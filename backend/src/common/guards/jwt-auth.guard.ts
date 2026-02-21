import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * Validates JWT tokens using the JwtStrategy
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
