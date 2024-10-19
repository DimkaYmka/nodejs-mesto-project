import { Router } from 'express';
import {
  getUsers, getUser, getUserById, updateUser, updateAvatar
} from '../controllers/users';

import {
  validationUserId,
  validationUpdateAvatar,
  validationUpdateUser,
} from '../middlewares/celebrate';

// Создаем экземпляр Router
const usersRouter = Router();

// Роуты
usersRouter.get('/', getUsers);

usersRouter.get('/me', getUserById);

usersRouter.get('/:id', validationUserId, getUser);

usersRouter.patch('/me', validationUpdateUser, updateUser);

usersRouter.patch('/me/avatar', validationUpdateAvatar, updateAvatar);

// Экспортируем роутер
export default usersRouter;