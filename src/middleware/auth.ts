import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { JSONResponse, ResponseStatus, AuthData } from '../ts/types';

/**
 * userAuthRequired
 * Middleware used to require authentication on a route, it adds a req.auth with the authentication data
 */

export const userAuthRequired = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if(authHeader === undefined || !authHeader.startsWith('Bearer ')){
        return res.json({ status: ResponseStatus.error, data: 'authorization failed' } as JSONResponse);
    }

    const userJWT = authHeader.slice('Bearer '.length);
    try{
        const decoded = jwt.verify(userJWT, process.env.JWT_SECRET) as AuthData;
        req.auth = { 'username': decoded.username } as AuthData;
        return next();
    }catch(e){
        return res.json({ status: ResponseStatus.error, data: 'authorization failed' } as JSONResponse);
    }
};