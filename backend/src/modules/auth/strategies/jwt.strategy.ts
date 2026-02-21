import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { JwtPayload, RequestUser } from '../../../common/interfaces/auth.interface';

/**
 * JWT Strategy for Passport authentication
 * Validates JWT tokens and attaches user to request
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('jwt.accessSecret') || 'default',
        });
    }

    async validate(payload: JwtPayload): Promise<RequestUser> {
        const user = await this.userService.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Attach user to request
        return {
            id: user.id,
            email: user.email,
            personId: user.person_id,
        };
    }
}
