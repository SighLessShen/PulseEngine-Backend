import { Request, Response } from 'express';
import Ajv from 'ajv';

import { JSONResponse, ResponseStatus } from '../../../ts/types';

import competition, { ICompetition } from '../../../database/models/competition';
import score, { IScore } from '../../../database/models/score';

const ajv = new Ajv({ allErrors: true });

/**
 * /api/competitions/getallscores
 * Handles distributing total scores from the current competition
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
        // Validate that the requester is a member of the competition; Owner is added to users so this will work for all
        if(competitionObject.users.includes(req.auth.username)){
            const scoreRecords: IScore[] = await score.find({ comp_id: body.compId }, '-_id comp_id teamname services createdAt', { sort: { createdAt: 'desc' } });
            return res.json({ status: ResponseStatus.success, data: scoreRecords } as JSONResponse);
        }else{
            return res.json({ status: ResponseStatus.error, data: 'authorization failed' } as JSONResponse);
        }
    }else{
        return res.send(validate.errors);
    }
};

export default handler;