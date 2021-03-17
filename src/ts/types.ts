export interface AuthData {
    username: string;
}

declare module 'express-serve-static-core' {
    interface Request {
      auth: AuthData;
    }
  }

export enum ResponseStatus {
    success = 'success',
    error = 'error'
}

export interface JSONResponse {
    status: ResponseStatus;
    data: any;
}