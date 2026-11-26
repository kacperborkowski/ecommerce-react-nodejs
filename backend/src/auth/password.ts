import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import type { ScryptOptions } from 'node:crypto';

// Passwords are hashed with scrypt (built into Node.js). It is deliberately
// slow and uses a lot of memory, so guessing millions of passwords from a
// stolen database would take far too long.
//
// The saved value contains everything needed to check a password later:
//   scrypt$<N>$<r>$<p>$<salt>$<hash>
// The salt is random for every password, so two users with the same password
// get different hashes.

// Cost parameters recommended by OWASP for scrypt
const N = 2 ** 17;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

function deriveKey(
  password: string,
  salt: Buffer,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // maxmem must fit 128 * N * r bytes (128 MiB for the values above)
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      { ...options, maxmem: 256 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await deriveKey(password, salt, { N, r: R, p: P });

  return [
    'scrypt',
    N,
    R,
    P,
    salt.toString('base64'),
    key.toString('base64'),
  ].join('$');
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [algorithm, n, r, p, salt, hash] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, 'base64');
  // Uses the parameters saved with the hash, so old hashes keep working
  // after the cost values above are raised
  const actual = await deriveKey(password, Buffer.from(salt, 'base64'), {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });

  // Compares in constant time: a normal === stops at the first different
  // byte, and the timing difference could leak information
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
