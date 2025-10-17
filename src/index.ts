import { type Request, type Response } from 'express';
import express from "express"
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Simple route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Hotel Booking Server!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
