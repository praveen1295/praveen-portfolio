import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

export interface AdminTokenPayload {
  role: 'admin';
  exp: number;
}

export interface AdminRequest extends Request {
  admin?: AdminTokenPayload;
}

const getSecret = (): string =>
  process.env.ADMIN_TOKEN_SECRET || 'dev-portfolio-secret-change-me';

export function signToken(payload: AdminTokenPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token: string): AdminTokenPayload | null {
  if (!token || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as AdminTokenPayload;
  if (parsed.exp && Date.now() > parsed.exp) return null;
  return parsed;
}

export function requireAdmin(req: AdminRequest, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    res.status(401).json({ success: false, message: 'Unauthorized: Admin login required' });
    return;
  }
  req.admin = decoded;
  next();
}
