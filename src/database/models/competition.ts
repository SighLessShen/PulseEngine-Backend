import mongoose, { Schema, Document } from 'mongoose';

import { IUser } from './user';

export interface ICompetition extends Document{
    comp_id: string;
    name: string;
    owner: IUser["username"];
    apikey: string;
    users: string[];
}

const CompetitionSchema: Schema = new Schema({
    comp_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    owner: { type: String, required: true },
    apikey: { type: String, required: true, unique: true },
    users: { type: [String], required: true }
});

export default mongoose.model<ICompetition>('Competition', CompetitionSchema);