import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateToken = (userId: string, res: Response) => {
  const JWT_SECRET: string = process.env.JWT_SECRET as string;

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
