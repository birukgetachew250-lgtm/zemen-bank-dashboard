import { getIronSession, type IronSessionData, type IronSessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export const sessionOptions: IronSessionOptions = {
  cookieName: 'zemen_admin_session',
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// This is where we specify the shape of our session data
declare module 'iron-session' {
  interface IronSessionData {
    userId?: number;
  }
}

export function getSession() {
  return getIronSession<IronSessionData>(cookies(), sessionOptions);
}
