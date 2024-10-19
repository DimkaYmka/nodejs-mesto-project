import { Request, Response, NextFunction } from 'express';
import cardSchema, { ICard } from '../models/card';
import NotFoundError from '../errors/404';
import BadRequestError from '../errors/400';
import ForbiddenError from '../errors/403';

// Расширение Request для добавления user
interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

// Получить все карточки
export const getCards = (req: Request, res: Response, next: NextFunction) => {
  cardSchema.find({})
    .then((cards: ICard[]) => res.send(cards))
    .catch(next);
};

// Удалить карточку
export const deleteCard = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { cardId } = req.params;

  cardSchema.findById(cardId)
    .then((card: ICard | null) => {
      if (!card) {
        return next(new NotFoundError('Карточка не существует.'));
      }
      if (!req.user || String(card.owner) !== req.user._id) {
        return next(new ForbiddenError('Вы не являетесь автором этой карточки.'));
      }
      return card.deleteOne().then(() => {
        res.send({ message: 'Карточка удалена' });
      });
    })
    .catch(next);
};

// Создать карточку
export const createCard = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, link } = req.body;

  if (!req.user) {
    return next(new ForbiddenError('Пользователь не авторизован.'));
  }

  cardSchema.create({ name, link, owner: req.user._id })
    .then((card: ICard) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Введены неверные данные'));
      }
      return next(err);
    });
};

// Добавить лайк карточке
export const addLikeCard = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ForbiddenError('Пользователь не авторизован.'));
  }

  cardSchema
    .findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail(() => new NotFoundError('Карточки с данным id не существует.'))
    .then((card: ICard | null) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Данные для лайка некорректные.'));
      }
      return next(err);
    });
};

// Удалить лайк с карточки
export const deleteLikeCard = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ForbiddenError('Пользователь не авторизован.'));
  }

  cardSchema.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail(() => new NotFoundError('Карточки с данным id не существует.'))
    .then((card: ICard | null) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Данные для лайка некорректные.'));
      }
      return next(err);
    });
};