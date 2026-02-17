import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { PrismaService } from '../../common/prisma.service';
import { User, UserStatus } from '@prisma/client';
import { JwtPayload } from '../../common/interfaces/auth.interface';
import { v4 as uuidv4 } from 'uuid';

/**
 * AuthService handles authentication and JWT token management
 */
@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Validate user credentials
     */
    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userService.findByEmail(email);

        if (!user) {
            return null;
        }

        // Check if user is active
        if (user.status !== UserStatus.ACTIVE) {
            throw new UnauthorizedException(
                `Account is ${user.status.toLowerCase()}`,
            );
        }

        // Verify password
        const isPasswordValid = await this.userService.verifyPassword(
            user,
            password,
        );

        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    /**
     * Login and generate tokens
     */
    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Update last login
        await this.userService.updateLastLogin(user.id);

        // Generate tokens
        const tokens = await this.generateTokens(user);

        return {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            user: {
                id: user.id,
                email: user.email,
                person: user.person,
            },
        };
    }

    /**
     * Generate access and refresh tokens
     */
    async generateTokens(user: User): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
        };

        // Generate access token
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('jwt.accessSecret'),
            expiresIn: this.configService.get<string>('jwt.accessExpiration'),
        });

        // Generate refresh token
        const refreshToken = this.jwtService.sign(
            { sub: user.id, jti: uuidv4() },
            {
                secret: this.configService.get<string>('jwt.refreshSecret'),
                expiresIn: this.configService.get<string>('jwt.refreshExpiration'),
            },
        );

        // Store refresh token in database
        const expiresInDays = 7; // 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        await this.prisma.refreshToken.create({
            data: {
                user_id: user.id,
                token: refreshToken,
                expires_at: expiresAt,
            },
        });

        return { accessToken, refreshToken };
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string) {
        try {
            // Verify refresh token
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('jwt.refreshSecret'),
            });

            // Check if token exists in database and not revoked
            const storedToken = await this.prisma.refreshToken.findUnique({
                where: { token: refreshToken },
            });

            if (!storedToken || storedToken.revoked_at) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Check if token is expired
            if (storedToken.expires_at < new Date()) {
                throw new UnauthorizedException('Refresh token expired');
            }

            // Get user
            const user = await this.userService.findById(payload.sub);

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // Generate new access token
            const accessPayload: JwtPayload = {
                sub: user.id,
                email: user.email,
            };

            const accessToken = this.jwtService.sign(accessPayload, {
                secret: this.configService.get<string>('jwt.accessSecret'),
                expiresIn: this.configService.get<string>('jwt.accessExpiration'),
            });

            return { access_token: accessToken };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    /**
     * Logout - revoke refresh token
     */
    async logout(refreshToken: string): Promise<void> {
        await this.prisma.refreshToken.updateMany({
            where: { token: refreshToken },
            data: { revoked_at: new Date() },
        });
    }
}
