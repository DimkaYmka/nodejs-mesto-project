import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AuthError from '../errors/401';

// Расширение типа Request для добавления поля user
interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;
  let payload;

  if (!token) {
    return next(new AuthError('Необходимо авторизоваться.'));
  }

  try {
    // Используем секретный ключ из переменных окружения
    payload = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
  } catch (err) {
    return next(new AuthError('Необходимо авторизоваться.'));
  }

  req.user = payload; // Сохраняем payload в req.user
  return next();
};

export default auth;