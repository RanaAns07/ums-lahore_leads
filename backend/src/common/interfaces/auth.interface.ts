/**
 * User payload attached to request after successful JWT authentication
 */
export interface JwtPayload {
    sub: string; // User ID
    email: string;
    iat?: number;
    exp?: number;
}

/**
 * User object attached to request by JwtStrategy
 */
export interface RequestUser {
    id: string;
    email: string;
    personId: string;
}
