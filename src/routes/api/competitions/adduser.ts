import { Request, Response } from 'express';
import Ajv from 'ajv';

import { JSONResponse, ResponseStatus } from '../../../ts/types';

import competition, { ICompetition } from '../../../database/models/competition';
import user, { IUser } from '../../../database/models/user';

const ajv = new Ajv({ allErrors: true });

/**
 * /api/competitions/adduser
 * Adds a new user to a competition
 * @param {string} compId - UUID of the competition to be added to
 * @param {string} username - username of user to be added the competition
 */

const schema = {
    type: 'object',
    properties: {
        compId: {
            type: 'string',
        },
        username: {
            type: 'string'
        }
    },
    required: ['compId', 'username']
};

const validate = ajv.compile(schema);

const handler = async (req: Request, res: Response): Promise<any> => {
    const body = req.body;
    if(validate(body)){
        const competitionToModify: ICompetition = await competition.findOne({ comp_id: body.compId });
        // Validate that the comptition exists before adding
        if(!competitionToModify) return res.json({ status: ResponseStatus.error, data: 'the competition id could not be found' } as JSONResponse);
        // Validate that user is owner of the competition before adding
        if(competitionToModify.owner === req.auth.username){
            // Validate that the user being added actually exists
            const userToAdd: IUser = await user.findOne({ username: body.username });
            if(userToAdd){
                // User to be added actually exists and there are correct permissions so make the changes
                // Validate that the user is not already in the competition
                if(competitionToModify.users.includes(body.username)) return res.json({ status: ResponseStatus.error, data: 'the user is already a part of the competition' } as JSONResponse);
                // Add user to the competition
                try{
                    competitionToModify.users.push(body.username);
                    competitionToModify.save();
                }catch(e){
                    console.error('An error occurred while adding the user to the competition: ', e);
                    return res.json({ status: ResponseStatus.error, data: 'an error occurred while adding the user to the competition' } as JSONResponse);
                }
                // Add competition to the user
                try{
                    userToAdd.competitions.push(competitionToModify.comp_id);
                    userToAdd.save();
                }catch(e){
                    console.error('An error occurred while adding the comptition to the user: ', e);
                    return res.json({ status: ResponseStatus.error, data: 'an error occurred while adding the comptition to the user' } as JSONResponse);
                }

                // All tasks have been completed, response message is given
                return res.json({ status: ResponseStatus.success, data: 'user has successfully been added to the competition' } as JSONResponse);
            }else{
                return res.json({ status: ResponseStatus.error, data: 'username does not exist' } as JSONResponse);
            }
        }else{
            return res.json({ status: ResponseStatus.error, data: 'authorization failed' } as JSONResponse);
        }
    }else{
        return res.send(validate.errors);
    }
};

export default handler;