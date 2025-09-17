import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import User from '../models/user.model';
import { generateToken } from '../lib/utils';
import { error } from 'console';

export const signup = async (req: Request, res: Response) => {
  const { email, fullName, password } = req.body;
  try {

    if (!email || !fullName || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      fullName,
      password: hashPassword,
    });

    if (newUser) {
      generateToken(newUser._id.toString(), res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('Error in signup controller:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      console.log('Unexpected error in signup controller:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const login = (req: Request, res: Response) => {
  res.send('login route');
};

export const logout = (req: Request, res: Response) => {
  res.send('logout route');
};
