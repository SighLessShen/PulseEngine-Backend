import { Request, Response } from 'express';
import Ajv from 'ajv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { JSONResponse, ResponseStatus } from '../../ts/types';

import user, { IUser } from '../../database/models/user';

const ajv = new Ajv({ allErrors: true });

/**
 * /auth/register
 * Handles registration of new accounts
 * @param {string} username - user's username
 * @param {string} password - user's password
 * @param {string} passwordConfirm - user's password confirmation
 * @param {string} fname - user's first name
 * @param {string} lname - user's last name
 * @param {string} email - user's email
 */

const schema = {
    type: 'object',
    properties: {
        username: {
            type: 'string',
        },
        password: {
            type: 'string'
        },
        passwordConfirm: {
            type: 'string'
        },
        fname: {
            type: 'string'
        },
        lname: {
            type: 'string'
        },
        email: {
            type: 'string',
            format: 'email'
        },
    },
    required: ['username', 'password', 'passwordConfirm', 'fname', 'lname', 'email']
};

const validate = ajv.compile(schema);

const handler = async (req: Request, res: Response): Promise<any> => {
    const body = req.body;
    if(validate(body)){
        if(body.password === body.passwordConfirm){
            // Mongo has no way besides parsing error string, this is best alternative to checking for duplicates. Cost is OK because it is register route
            let dupSearch: IUser = await user.findOne({ username: body.username });
            if(dupSearch){
                return res.json({ status: ResponseStatus.error, data: 'username in use' } as JSONResponse);
            }
            dupSearch = await user.findOne({ email: body.email });
            if(dupSearch){
                return res.json({ status: ResponseStatus.error, data: 'email in use' } as JSONResponse);
            }

            // Generate password and user model
            const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS));
            const hashedPw = await bcrypt.hash(body.password, salt);
            const newUser = new user({username: body.username, password: hashedPw, fname: body.fname, lname: body.lname, email: body.email} as IUser);
            try{
                await newUser.save();
            }catch(e){
                console.error('An error happened in user creation: ', e);
                return res.json({ status: ResponseStatus.error, data: 'an error occurred during record creation' } as JSONResponse);
            }
            const token = jwt.sign({ username: body.username }, process.env.JWT_SECRET, { algorithm: 'HS256' });
            return res.json({ status: ResponseStatus.success, data: token } as JSONResponse);
        }else{
            return res.json({ status: ResponseStatus.error, data: 'passwords do not match' } as JSONResponse);
        }
    }else{
        return res.send(validate.errors);
    }
};

export default handler;