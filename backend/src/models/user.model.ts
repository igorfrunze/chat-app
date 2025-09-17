import { Model, model, Schema } from 'mongoose';
import { IUser } from '../types';

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true, minLength: 6 },
    profilePic: { type: String, default: '' },
  },
  { timestamps: true }
);

const User: Model<IUser> = model<IUser>('User', userSchema);

export default User;
