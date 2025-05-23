import 'express-session';

declare module 'express-session' {
  interface Session {
    moeCookies?: string;
    userData?: any;
    imageReq?: string;
    gradesPeriod1?: any;
    gradesPeriod2?: any;
  }
} 