import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document{
    username: string;
    password: string;
    fname: string;
    lname: string;
    email: string;
    ownedCompetitions: string[];
    competitions: string[];
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    ownedCompetitions: { type: [String], required: true },
    competitions: { type: [String], required: true }
});

export default mongoose.model<IUser>('User', UserSchema);