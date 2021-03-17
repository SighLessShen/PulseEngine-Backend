import mongoose, { Schema, Document } from 'mongoose';

import { ICompetition } from './competition';

export interface ServiceStatus {
    name: string;
    status: boolean;
}

export interface IScore extends Document{
    comp_id: ICompetition["comp_id"];
    teamname: string;
    services: ServiceStatus[];
}

const ScoreSchema: Schema = new Schema({
    comp_id: { type: String, required: true },
    teamname: { type: String, required: true },
    services: [{
        name: { type: String, required: true },
        status: { type: Boolean, required: true }
    }]
}, {
    timestamps: true
});

export default mongoose.model<IScore>('Score', ScoreSchema);