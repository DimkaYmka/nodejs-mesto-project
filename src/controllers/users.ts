import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userSchema from '../models/user';

import NotFoundError from '../errors/404';
import AuthError from '../errors/401';
import BadRequestError from '../errors/400';
import ConflictError from '../errors/409';

// Типизация для req.user
interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

// Получить всех пользователей
export const getUsers = (req: Request, res: Response, next: NextFunction) => {
  userSchema
    .find({})
    .then((users) => res.send(users))
    .catch(next);
};

// Получить пользователя по ID
export const getUser = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;

  userSchema.findById(userId)
    .orFail(() => new NotFoundError('Пользователь с данным id не существует.'))
    .then((user) => res.send(user))
    .catch((err: any) => {
      if (err instanceof NotFoundError) {
        return next(new NotFoundError('Пользователь с данным id не существует.'));
      }
      if (err.name === 'CastError') {
        return next(new BadRequestError('Пользователь с данным id не существует.'));
      }
      return next(err);
    });
};

// Создать пользователя
export const createUser = (req: Request, res: Response, next: NextFunction) => {
  bcrypt.hash(String(req.body.password), 10)
    .then((hashedPassword: string) => {
      return userSchema.create({ ...req.body, password: hashedPassword });
    })
    .then((user) => res.send({ data: user }))
    .catch((err: any) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные.'));
      }
      if (err.code === 11000) {
        return next(new ConflictError('Пользователь с таким email уже существует.'));
      }
      return next(err);
    });
};

// Логин пользователя
export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  userSchema.findOne({ email })
    .select('+password')
    .orFail(() => new AuthError('Неправильный логин или пароль'))
    .then((user) => {
      bcrypt.compare(String(password), user.password)
        .then((isValidUser: boolean) => {
          if (isValidUser) {
            const token = jwt.sign(
              { _id: user._id },
              process.env.JWT_SECRET || 'JWT_SECRET',
              { expiresIn: '7d' }
            );
            res.cookie('jwt', token, {
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней в миллисекундах
              httpOnly: true,
              sameSite: true,
            });
            res.send({ data: user.toJSON() });
          } else {
            return next(new AuthError('Неправильный логин или пароль'));
          }
        });
    })
    .catch(next);
};

// Получить текущего пользователя
export const getUserById = (req: AuthRequest, res: Response, next: NextFunction) => {
  userSchema.findById(req.user?._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с данным id не существует.');
      }
      res.send(user);
    })
    .catch((err: any) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные.'));
      } else if (err instanceof NotFoundError) {
        next(new NotFoundError('Пользователь с данным id не существует.'));
      } else {
        next(err);
      }
    });
};

// Функция для обновления данных пользователя
const changeUserData = (
  id: string,
  newData: Record<string, any>,
  res: Response,
  next: NextFunction
) => {
  userSchema.findByIdAndUpdate(id, newData, { new: true, runValidators: true })
    .orFail(() => new NotFoundError('Пользователь с данным id не существует.'))
    .then((user) => res.send(user))
    .catch(next);
};

// Обновить информацию пользователя
export const updateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, about } = req.body;
  return changeUserData(req.user?._id!, { name, about }, res, next);
};

// Обновить аватар пользователя
export const updateAvatar = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { avatar } = req.body;
  return changeUserData(req.user?._id!, { avatar }, res, next);
};