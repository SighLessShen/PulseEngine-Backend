import { Request, Response } from 'express';
import Ajv from 'ajv';

import { JSONResponse, ResponseStatus } from '../../../ts/types';

import user, { IUser } from '../../../database/models/user';

const ajv = new Ajv({ allErrors: true });

/**
 * /api/users/profile
 * Handles distributing total scores from the current competition
 */

const handler = async (req: Request, res: Response): Promise<any> => {
    const userObject: IUser = await user.findOne({ username: req.auth.username }, '-_id username fname lname email ownedCompetitions competitions');
    if(!userObject) return res.json({ status: ResponseStatus.error, data: 'the user could not be found' } as JSONResponse);
    return res.json({ status: ResponseStatus.success, data: userObject } as JSONResponse);
};

export default handler;