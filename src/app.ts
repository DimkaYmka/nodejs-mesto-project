require('dotenv').config();
import express from 'express';
import helmet from 'helmet';
import Limit from 'express-rate-limit';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { errors } from 'celebrate';
import cors from 'cors';
import routes from './routes';
import handleError from './middlewares/handleError';
import { requestLogger, errorLogger } from './middlewares/logger';

const app = express();

const limiterSetting = {
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // Ограничение: 100 запросов за 15 минут
};

const limiter = Limit(limiterSetting);

app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
  ],
  credentials: true,
  maxAge: 30,
}));

app.use(limiter);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(requestLogger);
app.use(routes); // Подключение маршрутов
app.use(errorLogger);

app.use(errors()); // Обработка ошибок celebrate
app.use(handleError); // Обработка ошибок

const { PORT = 3001 } = process.env;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});