import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, DecodedToken } from '../types';
import { ErrorResponse } from '../types';

export const protectRoute = async (
  req: AuthenticatedRequest,
  res: Response<ErrorResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      res.status(401).json({ message: 'Unauthorized - no token provided' });
      return;
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;

    if (!decoded) {
      res.status(401).json({ message: 'Unauthorized - invalid token' });
      return;
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'Unauthorized - user not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof Error) {
      console.log('Error in protectRoute middleware:', error.message);
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
