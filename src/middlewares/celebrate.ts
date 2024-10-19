import { celebrate, Joi, Segments } from 'celebrate';

// Регулярное выражение для проверки URL
const urlPattern = /^https?:\/\/(?:www\.)?(?:[a-z0-9-]+[a-z0-9]*\.)+[a-z]{2,}(?::[0-9]+)?(?:\/\S*)?#?$/i;

// Валидация для создания пользователя
export const validationCreateUser = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(1),
    avatar: Joi.string().regex(urlPattern),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
});

// Валидация для логина
export const validationLogin = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
});

// Валидация для ID пользователя
export const validationUserId = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().length(24).hex(),
  }),
});

// Валидация для обновления аватара
export const validationUpdateAvatar = celebrate({
  [Segments.BODY]: Joi.object().keys({
    avatar: Joi.string().required().regex(urlPattern),
  }),
});

// Валидация для обновления данных пользователя
export const validationUpdateUser = celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
});

// Валидация для создания карточки
export const validationCreateCard = celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().regex(urlPattern),
  }),
});

// Валидация для проверки ID карточки
export const validationCheckCard = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    cardId: Joi.string().required().length(24).hex(),
  }),
});