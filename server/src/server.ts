import path from 'path';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db';
import portfolioRoutes from './routes/portfolioRoutes';

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const clientUrl = process.env.CLIENT_URL || '*';

app.use(
  cors({
    origin: clientUrl === '*' ? '*' : clientUrl.split(',').map((s) => s.trim()),
  })
);
app.use(express.json());

// Ensure MongoDB connection on serverless cold starts
app.use(async (_req: Request, res: Response, next: NextFunction) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    next();
  } catch {
    res.status(500).json({ success: false, message: 'Database connection error' });
  }
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Praveen Portfolio MERN TypeScript API' });
});

app.use('/api', portfolioRoutes);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Portfolio TypeScript server running on http://localhost:${PORT}`);
    });
  });
}

export default app;
