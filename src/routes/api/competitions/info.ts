import { Request, Response } from 'express';
import Ajv from 'ajv';

import { JSONResponse, ResponseStatus } from '../../../ts/types';

import competition, { ICompetition } from '../../../database/models/competition';

const ajv = new Ajv({ allErrors: true });

/**
 * /api/competitions/info
 * Handles distribution of information about each competition
 * Currently used to give out API key to the owner
 * @param {string} compId - UUID of the competition to get information from
 */

const schema = {
    type: 'object',
    properties: {
        compId: {
            type: 'string',
        }
    },
    required: ['compId']
};

const validate = ajv.compile(schema);

const handler = async (req: Request, res: Response): Promise<any> => {
    const body = req.body;
    if(validate(body)){
        // Validate that the competition exists before getting information
        const competitionObject: ICompetition = await competition.findOne({ comp_id: body.compId });
        if(!competitionObject) return res.json({ status: ResponseStatus.error, data: 'the competition id could not be found' } as JSONResponse);
        // Validate that the requester is a user of the competition
        if(competitionObject.users.includes(req.auth.username)){
            // Return all pertinent information
            return res.json({ status: ResponseStatus.success, data: { name: competitionObject.name } } as JSONResponse);
        }else{
            return res.json({ status: ResponseStatus.error, data: 'authorization failed' } as JSONResponse);
        }
    }else{
        return res.send(validate.errors);
    }
};

export default handler;