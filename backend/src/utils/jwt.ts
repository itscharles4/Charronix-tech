import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
    userId: string;
    role: string;
    email: string;
    studentId?: string;
    teacherId?: string;
}

export interface RefreshTokenPayload {
    userId: string;
    tokenId: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
    const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRY as SignOptions['expiresIn'] };
    return jwt.sign(payload, env.JWT_SECRET, options);
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
    const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRY as SignOptions['expiresIn'] };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};


export const verifyAccessToken = (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};

export const decodeToken = (token: string): JwtPayload | null => {
    try {
        return jwt.decode(token) as JwtPayload;
    } catch {
        return null;
    }
};
