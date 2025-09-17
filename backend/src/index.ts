import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.route';
import { connectDB } from './lib/db';

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectDB();
});
