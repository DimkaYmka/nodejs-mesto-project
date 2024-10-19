import { Request, Response, NextFunction } from 'express';
import { defaultErrorMessage } from '../utils/errors';

// Типизация объекта ошибки
interface IError extends Error {
  statusCode?: number;
}

// Обработчик ошибок
const errorHandler = (err: IError, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    message: statusCode === 500 ? defaultErrorMessage : message,
  });

  console.log(err.message);
  next();
};

export default errorHandler;