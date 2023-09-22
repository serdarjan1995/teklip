import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRegistration } from './models/user.model';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async addUser(name: string, surname: string, email: string) {
    const newUser = new this.userModel({ name, surname, email });
    const res = await newUser.save();
    return res.id as string;
  }

  async isPasswordMatch(
    password: string,
    hashedPassword: string,
    raiseException = false,
  ) {
    const isPasswordMatching = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordMatching && raiseException) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Wrong credentials provided',
          errorCode: 'auth_error',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return isPasswordMatching;
  }

  checkPasswordConfirmation(password: string, passwordConfirmation: string) {
    if (password != passwordConfirmation) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'User password and passwordConfirmation does not match',
          errorCode: 'password_confirmation_does_not_match',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async registerUser(user: UserRegistration) {
    if (await this.checkEmailExists(user.email)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'User already exists',
          errorCode: 'user_exists_duplicate_email',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    this.checkPasswordConfirmation(user.password, user.passwordConfirmation);
    const passwordInPlaintext = user.password;
    const hashedPassword = await bcrypt.hash(passwordInPlaintext, 10);

    const isPasswordMatching = this.isPasswordMatch(
      passwordInPlaintext,
      hashedPassword,
    );

    if (!isPasswordMatching) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Password hashing error',
          errorCode: 'password_error',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newUser = new this.userModel({
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: hashedPassword,
      isActive: false,
      companyName: null,
      lastLogin: null,
    });
    const res = await newUser.save();
    return res as User;
  }

  async changePassword(
    user: User,
    password: string,
    passwordConfirmation: string,
  ) {
    this.checkPasswordConfirmation(password, passwordConfirmation);
    const hashedPassword = await bcrypt.hash(password, 10);

    const isPasswordMatching = this.isPasswordMatch(password, hashedPassword);

    if (!isPasswordMatching) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Password hashing error',
          errorCode: 'password_error',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.update({ _id: user.id }, { password: hashedPassword });
  }

  async getByEmail(email: string, projection = {}) {
    const user = await this.userModel.findOne({ email }, projection);
    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User with this email does not exist',
          errorCode: 'user_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async checkEmailExists(email: string) {
    return this.userModel.exists({ email });
  }

  async getById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User with this id does not exist',
          errorCode: 'user_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async update(filter: object, updateParams: object) {
    return this.userModel.findOneAndUpdate(filter, updateParams);
  }
}
