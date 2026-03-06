import express, { Request, Response, NextFunction } from 'express';
import admin from './firebaseAdmin';

// Middleware to verify Firebase ID Token
export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    if (admin.apps.length) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      (req as any).user = decodedToken;
      next();
    } else {
      // If Firebase Admin is not initialized (e.g. missing env vars), 
      // we might want to fail secure or allow for dev.
      // For this implementation, we'll fail secure but log a warning.
      console.warn('Firebase Admin not initialized. Cannot verify token.');
      res.status(500).json({ error: 'Internal Server Error: Auth configuration missing' });
    }
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const initAuth = (app: express.Application) => {
  // No-op for now as we don't need server-side auth routes
};
