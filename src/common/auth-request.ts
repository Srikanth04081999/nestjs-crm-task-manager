import type { Request } from 'express';
import type { User } from '../users/user.entity.js';

export interface AuthRequest extends Request {
  user: User;
}