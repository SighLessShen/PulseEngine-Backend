import { Request, Response } from 'express';
import Ajv from 'ajv';
import { v4 as uuidv4 } from 'uuid';

import { JSONResponse, ResponseStatus } from '../../../ts/types';

import competition, { ICompetition } from '../../../database/models/competition';
import user, { IUser } from '../../../database/models/user';

const ajv = new Ajv({ allErrors: true });

/**
 * /api/competitions/create
 * Handles creation of new competitions
 * @param {string} name - name of new competition
 */

const schema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
        }
    },
    required: ['name']
};

const validate = ajv.compile(schema);

const handler = async (req: Request, res: Response): Promise<any> => {
    const body = req.body;
    if(validate(body)){
        const compId = uuidv4();
        const apikey = uuidv4();
        // Generate new UUIDs and save it as new competition
        try{
            const newCompetition = new competition({ comp_id: compId, name: body.name, owner: req.auth.username, apikey, users: [req.auth.username] } as ICompetition);
            await newCompetition.save();
        }catch(e){
            console.error('An error occurred in competition creation: ', e);
            return res.json({ status: ResponseStatus.error, data: 'an error occurred during competition creation' } as JSONResponse);
        }

        // Add competition to creator
        const ownerCompetitions: IUser = await user.findOne({ username: req.auth.username });
        try{
            await ownerCompetitions.ownedCompetitions.push(compId);
            await ownerCompetitions.save();
        }catch(e){
            console.error('An error occurred while adding the competition to the owner: ', e);
            return res.json({ status: ResponseStatus.error, data: 'an error occurred while adding the competition to the owner' } as JSONResponse);
        }

        return res.json({ status: ResponseStatus.success, data: { compId } });
    }else{
        return res.send(validate.errors);
    }
};

export default handler;