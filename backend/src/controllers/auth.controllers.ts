import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import User from '../models/user.model.js';
import { generateToken } from '../lib/utils.js';
import {
  AuthenticatedRequest,
  AuthSuccessResponse,
  ErrorResponse,
  LoginRequestBody,
  SignupRequestBody,
} from '../types';
import cloudinary from '../lib/cloudinary.js';

export const signup = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response<AuthSuccessResponse | ErrorResponse>
): Promise<void> => {
  const { email, fullName, password } = req.body;
  try {
    if (!email || !fullName || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (password.length < 6) {
      res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    const user = await User.findOne({ email });

    if (user) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      fullName,
      password: hashPassword,
    });

    await newUser.save();
    generateToken(newUser._id.toString(), res);

    res.status(201).json({
      _id: newUser._id.toString(),
      email: newUser.email,
      fullName: newUser.fullName,
      profilePic: newUser.profilePic,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('Error in signup controller:', error.message);
    } else {
      console.log('Unexpected error in signup controller:', error);
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response<AuthSuccessResponse | ErrorResponse>
): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    generateToken(user._id.toString(), res);

    res.status(200).json({
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('Error in login controller:', error.message);
    } else {
      console.log('Unexpected error in login controller:', error);
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = (
  req: Request,
  res: Response<{ message: string } | ErrorResponse>
): void => {
  try {
    res.cookie('jwt', '', { maxAge: 0 });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('Error in logout controller:', error.message);
    } else {
      console.log('Unexpected error in logout controller:', error);
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic) {
      res.status(400).json({ message: 'Profile picture is required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized - no user found' });
      return;
    }
    const userId = req.user._id;

    const uploadRespone = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadRespone.secure_url,
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('Error in updateProfile controller:', error.message);
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkAuth = (req: AuthenticatedRequest, res: Response) => {
  try {
    res.status(200).json(req.user);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('Error in checkAuth controller:', error.message);
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
