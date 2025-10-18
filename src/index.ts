import { type Request, type Response } from 'express';
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from './configs/db';

const app = express();

connectDB();
// Middleware to parse JSON
app.use(express.json());

// Simple route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Hotel Booking Server!');
});

// Start server
app.listen(process.env.port, () => {
  console.log(`Server running on http://localhost:${process.env.port}`);
});
