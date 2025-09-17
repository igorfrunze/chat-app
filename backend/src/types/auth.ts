import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface SignupRequestBody {
  email: string;
  fullName: string;
  password: string;
}

export type LoginRequestBody = Omit<SignupRequestBody, 'fullName'>;

export interface AuthSuccessResponse
  extends Omit<SignupRequestBody, 'password'> {
  _id: string;
  profilePic?: string;
}

export interface ErrorResponse {
  message: string;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  fullName: string;
  password: string;
  profilePic?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

import { JwtPayload } from 'jsonwebtoken';

export interface DecodedToken extends JwtPayload {
  userId: string;
}
