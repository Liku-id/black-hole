import { SessionOptions } from 'iron-session';

export interface SessionData {
  user?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    ktpNumber: string;
    dateOfBirth: string;
    gender: string;
    isVerified: boolean;
    isGuest: boolean;
    role: {
      id: string;
      name: string;
    };
    profilePicture: {
      id: string;
      url: string;
    };
    createdAt: string;
    updatedAt: string;
  };
  accessToken?: string;
  refreshToken?: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false
};

export const sessionOptions: SessionOptions = {
  // Generate a random secret key - in production, this should come from environment variables
  password: process.env.SECRET_COOKIE_PASSWORD,
  cookieName: 'black-hole-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax'
  }
};

// Type declaration to ensure IronSession has the correct shape
declare module 'iron-session' {
  interface IronSessionData extends SessionData {}
}
