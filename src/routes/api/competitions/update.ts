import { Request, Response } from 'express';
import Ajv from 'ajv';

import { JSONResponse, ResponseStatus } from '../../../ts/types';

import competition, { ICompetition } from '../../../database/models/competition';
import score, { IScore } from '../../../database/models/score';

const ajv = new Ajv({ allErrors: true });

/**
 * /api/competitions/update
 * Handles adding new scores to the database
 * @param {string} compId - UUID of the competition to get information from
 * @param {string} apikey - API key which has access to modify the competition
 */

const schema = {
    type: 'object',
    properties: {
        compId: {
            type: 'string',
        },
        apikey: {
            type: 'string'
        },
        teamname: {
            type: 'string'
        },
        services: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string'
                    },
                    status: {
                        type: 'boolean'
                    }
                }
            }
        }
    },
    required: ['compId', 'apikey', 'teamname', 'services']
};

const validate = ajv.compile(schema);

const handler = async (req: Request, res: Response): Promise<any> => {
    const body = req.body;
    if(validate(body)){
        // Validate that the competition exists before getting information
        const competitionObject: ICompetition = await competition.findOne({ comp_id: body.compId });
        if(!competitionObject) return res.json({ status: ResponseStatus.error, data: 'the competition id could not be found' } as JSONResponse);
        // Validate that the API key for the competition
        if(competitionObject.apikey === body.apikey){
            // Add new scores to the collection
            const newScore = new score({ comp_id: body.compId, teamname: body.teamname, services: body.services } as IScore);
            try{
                await newScore.save();
            }catch(e){
                console.error('An error happened in score creation: ', e);
                return res.json({ status: ResponseStatus.error, data: 'an error occurred during score creation' } as JSONResponse);
            }
            return res.json({ status: ResponseStatus.success, data: 'records were added successfully' } as JSONResponse);
        }else{
            return res.json({ status: ResponseStatus.error, data: 'authorization failed' } as JSONResponse);
        }
    }else{
        return res.send(validate.errors);
    }
};

export default handler;