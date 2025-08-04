import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

// Type assertion to ensure JWT_SECRET is string
const secret: string = JWT_SECRET;

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role?: 'admin' | 'user';
}

/**
 * Generate a JWT token with 7-day expiration
 * @param payload - User data to include in token
 * @returns string - JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, secret, {
    expiresIn: '7d',
    issuer: 'ecommerce-app',
    audience: 'ecommerce-users'
  });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns JWTPayload - Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'ecommerce-app',
      audience: 'ecommerce-users'
    });
    
    // Type guard to ensure decoded has the expected structure
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && 'email' in decoded && 'name' in decoded) {
      return decoded as JWTPayload;
    }
    
    throw new Error('Invalid token payload structure');
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

/**
 * Decode a JWT token without verification (for debugging purposes)
 * @param token - JWT token to decode
 * @returns object - Decoded token payload
 */
export function decodeToken(token: string): object | null {
  const decoded = jwt.decode(token);
  if (typeof decoded === 'object' && decoded !== null) {
    return decoded;
  }
  return null;
}

/**
 * Check if a token is close to expiration
 * @param token - JWT token to check
 * @param thresholdMinutes - Minutes before expiration to consider "close" (default: 60)
 * @returns boolean - True if token expires within threshold
 */
export function isTokenCloseToExpiration(token: string, thresholdMinutes: number = 60): boolean {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded || !decoded.exp) {
      return true; // Consider invalid tokens as expired
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - currentTime;
    const thresholdSeconds = thresholdMinutes * 60;

    return timeUntilExpiry <= thresholdSeconds;
  } catch {
    return true; // Consider invalid tokens as expired
  }
}

/**
 * Get token expiration time
 * @param token - JWT token
 * @returns Date - Expiration date or null if invalid
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded || !decoded.exp) {
      return null;
    }
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}