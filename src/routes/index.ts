import { Router, Request, Response, NextFunction } from 'express';
import auth from '../middlewares/auth';
import NotFoundError from '../errors/400';
import {
  getUsers, getUser, createUser, updateUser, updateAvatar, login
} from '../controllers/users';
import {
  validationCreateUser,
  validationLogin
} from '../middlewares/celebrate';
import usersRouter from './users';
import cardsRouter from './cards';

const router = Router();

// Роуты для регистрации и логина
router.post('/signup', validationCreateUser, createUser);
router.post('/signin', validationLogin, login);

// Аутентификация для защищенных маршрутов
router.use(auth);

// Роуты для пользователей и карточек
router.use('/users', usersRouter);
router.use('/cards', cardsRouter);

// Обработка всех остальных запросов
router.use('/*', (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError('Страницы не существует'));
});

export default router;