import bcrypt from 'bcrypt';
import { env } from '../config/env';

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, env.BCRYPT_ROUNDS);
};

export const comparePassword = async (
    password: string,
    hash: string
): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const isPasswordStrong = (password: string): { valid: boolean; message?: string } => {
    if (password.length < env.PASSWORD_MIN_LENGTH) {
        return { valid: false, message: `Password must be at least ${env.PASSWORD_MIN_LENGTH} characters` };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/\d/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true };
};
