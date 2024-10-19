import { Router } from 'express';
import {
  getCards, deleteCard, createCard, addLikeCard, deleteLikeCard
} from '../controllers/cards';
import {
  validationCreateCard,
  validationCheckCard
} from '../middlewares/celebrate';

const cardsRouter = Router();

// Роуты для работы с карточками
cardsRouter.get('/', getCards);

cardsRouter.delete('/:cardId', validationCheckCard, deleteCard);

cardsRouter.post('/', validationCreateCard, createCard);

cardsRouter.put('/:cardId/likes', validationCheckCard, addLikeCard);

cardsRouter.delete('/:cardId/likes', validationCheckCard, deleteLikeCard);

export default cardsRouter;