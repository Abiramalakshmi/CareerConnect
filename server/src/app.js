import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import profileRoutes from './routes/profileRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://career-connect-five-opal.vercel.app'
  ]
}));
app.use(express.json());

// Populates req.auth from the Clerk session token on every request.
// requireAuth()/getAuth() in our middleware depend on this running first.
app.use(clerkMiddleware());

// Simple health check — handy for confirming the server is up.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/users', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Basic error handler — catches anything passed to next(err) in controllers.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

export default app;
