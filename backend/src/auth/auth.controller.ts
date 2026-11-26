import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import {
  clearSessionCookie,
  readSessionToken,
  setSessionCookie,
} from './session-cookie.js';
import { CurrentUserResponse, User } from './user.interface.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/register  { email, password, firstName, lastName }
  // Creates the account and logs the user in straight away
  @Post('register')
  async register(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: RegisterDto,
  ): Promise<User> {
    const { user, token } = await this.authService.register(body);
    await this.replaceSession(req, res, token);
    return user;
  }

  // POST /api/auth/login  { email, password }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDto,
  ): Promise<User> {
    const { user, token } = await this.authService.login(body);
    await this.replaceSession(req, res, token);
    return user;
  }

  // POST /api/auth/logout
  // POST, not GET: a GET link (e.g. an <img> on another site) could log the
  // user out without them clicking anything
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(readSessionToken(req));
    clearSessionCookie(res);
  }

  // GET /api/auth/me
  // 200 with { user: null } for guests, instead of 401, because "not logged
  // in" is a normal state for a shop, not an error
  @Get('me')
  async me(@Req() req: Request): Promise<CurrentUserResponse> {
    return {
      user: await this.authService.getUserBySession(readSessionToken(req)),
    };
  }

  // Every login gets a brand new token, and the browser's previous session
  // is deleted. If someone had planted a known session id in the browser
  // before login (session fixation), it becomes useless.
  private async replaceSession(
    req: Request,
    res: Response,
    token: string,
  ): Promise<void> {
    await this.authService.logout(readSessionToken(req));
    setSessionCookie(res, token);
  }
}
