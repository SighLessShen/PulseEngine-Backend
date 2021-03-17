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

 interface DetailedServiceScore {
    status: boolean;
    checksUp: number;
    totalChecks: number;
 }

 interface TeamScores {
     [key: string]: DetailedServiceScore;
 }

 interface Scores {
     [key: string]: TeamScores;
 }

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
            const scoreRecords: IScore[] = await score.find({ comp_id: body.compId }, null, { sort: { createdAt: 'desc' } });

            // Process the records to have useful data; TODO: Offload this to an information calc worker and implement a server-side cache
            const scores: Scores = {};

            for(const scoreRecord of scoreRecords){
                if(scores[scoreRecord.teamname] === undefined){
                    // First time seeing the team so ServiceStatus is correct, just need to initialize checksUp and totalChecks for each service
                    scores[scoreRecord.teamname] = {};
                    for(const serviceStatus of scoreRecord.services){
                        // Add each service to current status for the team
                        const serviceScore: DetailedServiceScore = {status: serviceStatus.status,
                            checksUp: serviceStatus.status ? 1 : 0,
                            totalChecks: 1  };
                        scores[scoreRecord.teamname][serviceStatus.name] = serviceScore;
                    }
                }else{
                    // This team has been seen before, only increment checksUp / totalChecks and add new services
                    for(const serviceStatus of scoreRecord.services){
                        if(scores[scoreRecord.teamname][serviceStatus.name]){
                            // If a service with the name already exists then update it
                            scores[scoreRecord.teamname][serviceStatus.name].totalChecks += 1;
                            if(serviceStatus.status) scores[scoreRecord.teamname][serviceStatus.name].checksUp += 1;
                        }else{
                            // New service, create a new service and add it to current status for the team
                            const serviceScore: DetailedServiceScore = {status: serviceStatus.status,
                                checksUp: serviceStatus.status ? 1 : 0,
                                totalChecks: 1  };
                            scores[scoreRecord.teamname][serviceStatus.name] = serviceScore;
                        }
                    }
                }
            }

            // All scores have been added to scores object and can now be returned
            return res.json({ status: ResponseStatus.success, data: scores } as JSONResponse);
        }else{
            return res.json({ status: ResponseStatus.error, data: 'authorization failed' } as JSONResponse);
        }
    }else{
        return res.send(validate.errors);
    }
};

export default handler;