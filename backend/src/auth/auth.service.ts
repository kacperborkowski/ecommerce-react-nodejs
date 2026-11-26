import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import pg from 'pg';
import { DatabaseService } from '../database/database.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { hashPassword, verifyPassword } from './password.js';
import { SESSION_DURATION_DAYS } from './session-cookie.js';
import { User } from './user.interface.js';

const USER_COLUMNS =
  'u.id, u.email, u.first_name AS "firstName", u.last_name AS "lastName"';

// The same message for "no such email" and "wrong password", so the login
// form doesn't reveal which emails have accounts
const INVALID_CREDENTIALS = 'Invalid email or password';

// What register() and login() return: the user, and the session token for
// the cookie
export interface SessionResult {
  user: User;
  token: string;
}

@Injectable()
export class AuthService {
  // A real hash of a random password, checked when the email doesn't exist,
  // so a wrong email takes as long as a wrong password (see login())
  private dummyHash?: Promise<string>;

  constructor(private readonly db: DatabaseService) {}

  async register(dto: RegisterDto): Promise<SessionResult> {
    const passwordHash = await hashPassword(dto.password);

    let user: User;
    try {
      [user] = await this.db.query<User>(
        `INSERT INTO users AS u (email, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4)
         RETURNING ${USER_COLUMNS}`,
        [dto.email, passwordHash, dto.firstName, dto.lastName],
      );
    } catch (error) {
      // The UNIQUE constraint on email also covers two sign-ups at the same
      // moment, which a "SELECT first, then INSERT" check would miss
      if (this.isDuplicateEmail(error)) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      throw error;
    }

    return { user, token: await this.createSession(user.id) };
  }

  async login(dto: LoginDto): Promise<SessionResult> {
    const [row] = await this.db.query<User & { passwordHash: string }>(
      `SELECT ${USER_COLUMNS}, u.password_hash AS "passwordHash"
       FROM users u
       WHERE u.email = $1`,
      [dto.email],
    );

    // Without an account we still hash the password. Otherwise an unknown
    // email would answer instantly and a known one after ~0.5 s, and an
    // attacker could use that difference to find out who has an account.
    const valid = await verifyPassword(
      dto.password,
      row?.passwordHash ?? (await this.getDummyHash()),
    );

    if (!row || !valid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const { passwordHash: _, ...user } = row;
    return { user, token: await this.createSession(user.id) };
  }

  // The logged-in user for a session cookie, or null (no cookie, unknown or
  // expired session)
  async getUserBySession(token: string | undefined): Promise<User | null> {
    if (!token) {
      return null;
    }

    const [user] = await this.db.query<User>(
      `SELECT ${USER_COLUMNS}
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > now()`,
      [hashToken(token)],
    );

    return user ?? null;
  }

  async logout(token: string | undefined): Promise<void> {
    if (token) {
      await this.db.query('DELETE FROM sessions WHERE token_hash = $1', [
        hashToken(token),
      ]);
    }
  }

  private async createSession(userId: number): Promise<string> {
    // 32 random bytes: impossible to guess, unlike a user id or a counter
    const token = randomBytes(32).toString('base64url');

    await this.db.query(
      `INSERT INTO sessions (token_hash, user_id, expires_at)
       VALUES ($1, $2, now() + make_interval(days => $3))`,
      [hashToken(token), userId, SESSION_DURATION_DAYS],
    );

    // Housekeeping: drop this user's expired sessions
    await this.db.query(
      'DELETE FROM sessions WHERE user_id = $1 AND expires_at <= now()',
      [userId],
    );

    return token;
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= hashPassword(randomBytes(16).toString('hex'));
    return this.dummyHash;
  }

  // 23505 is the Postgres error code for "unique constraint violated"
  private isDuplicateEmail(error: unknown): boolean {
    return (
      error instanceof pg.DatabaseError &&
      error.code === '23505' &&
      error.constraint === 'users_email_key'
    );
  }
}

// The database keeps only a hash of the token. SHA-256 is enough here (no
// salt, no slow hashing like for passwords), because the token is already
// long and random, so there is nothing to guess.
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
