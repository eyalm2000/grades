import 'express-session';

declare module 'express-session' {
  interface SessionData {
    moeCookies?: string;
    userData?: any;
    imageReq?: string;
    grades?: any;
  }
} 