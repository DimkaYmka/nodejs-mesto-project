import { Schema, model, Document } from 'mongoose';
import validator from 'validator';

// Описание интерфейса для пользователя
interface IUser extends Document {
  name: string;
  about: string;
  password: string;
  email: string;
  avatar: string;
}

// Схема пользователя
const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: false,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    required: false,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  password: {
    type: String,
    required: true,
    select: false, // Пароль исключен из выборки по умолчанию
  },
  email: {
    type: String,
    validate: {
      validator: (v: string) => validator.isEmail(v),
      message: 'Неверный Email',
    },
    required: true,
    unique: true,
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (url: string) => validator.isURL(url),
      message: 'Неверный формат ссылки',
    },
  },
}, { versionKey: false });

// Удаление пароля при сериализации
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password; // Удаляем поле "password"
  return user;
};

// Экспорт модели
export default model<IUser>('user', userSchema);