import 'express-session';

declare module 'express-session' {
  interface Session {
    moeCookies?: string;
    userData?: any;
    imageReq?: string;
    grades?: any;
  }
} 