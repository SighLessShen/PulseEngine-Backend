import { Request, Response } from 'express';
import Ajv from 'ajv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { JSONResponse, ResponseStatus } from '../../ts/types';

import user, { IUser } from '../../database/models/user';

const ajv = new Ajv({ allErrors: true });

/**
 * /auth/login
 * Handles logging into user accounts
 * @param {string} username - user's username
 * @param {string} password - user's password
 */

const schema = {
    type: 'object',
    properties: {
        username: {
            type: 'string',
        },
        password: {
            type: 'string'
        }
    },
    required: ['username', 'password']
};

const validate = ajv.compile(schema);

const handler = async (req: Request, res: Response): Promise<any> => {
    const body = req.body;
    if(validate(body)){
        const authUser: IUser = await user.findOne({ username: body.username });
        if(authUser){
            const passwordCompare = await bcrypt.compare(body.password, authUser.password);
            if(passwordCompare){
                const token = jwt.sign({ username: body.username }, process.env.JWT_SECRET, { algorithm: 'HS256' });
                res.json({ status: ResponseStatus.success, data: token } as JSONResponse);
            }else{
                res.json({ status: ResponseStatus.error, data: 'passwords do not match' });
            }
        }else{
            res.json({ status: ResponseStatus.error, data: 'username not found' } as JSONResponse);
        }
    }else{
        res.send(validate.errors);
    }
};

export default handler;