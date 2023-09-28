import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthRequestModel } from './models/auth.model';
import { UserRegistration } from '../user/models/user.model';
import { generateCode, getRandomStr } from '../utils';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AUTH_CODE_TYPE_ENUM, AuthCode } from './models/authCodes.model';
import { MailingService } from '../mailing/mailing.service';
import { EmailVerifyModel } from './models/emailVerify.model';
import { AUTH_CODE_EXPIRY } from './constants';
import {
  PasswordResetCheckAuthCodeModel,
  PasswordResetModel,
} from './models/passwordReset.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('AuthCode') private readonly authCodeModel: Model<AuthCode>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailingService: MailingService,
  ) {}

  // async getAuthCode(phoneNumber: string): Promise<any> {
  //   return await this.authCodeModel
  //     .findOne({
  //       phoneNumber: phoneNumber,
  //       expires: {
  //         $gte: new Date(),
  //       },
  //     })
  //     .exec();
  // }
  //
  // async expireAuthCode(phoneNumber: string): Promise<any> {
  //   return await this.authCodeModel
  //     .findOneAndUpdate({ phoneNumber: phoneNumber }, { expires: new Date() })
  //     .exec();
  // }

  public async getAuthenticatedUser(authData: AuthRequestModel) {
    const user = await this.userService.getByEmail(authData.email, {
      email: true,
      password: true,
      isActive: true,
      isEmailAddressVerified: true,
      isPhoneNumberVerified: true,
    });

    if (!user.isActive) {
      const emailVerified = user.isEmailAddressVerified;
      const phoneNumberVerified = user.isPhoneNumberVerified;
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User is not active',
          errorCode: !emailVerified
            ? 'email_not_verified'
            : !phoneNumberVerified
            ? 'phone_number_not_verified'
            : 'disabled_user',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.userService.isPasswordMatch(
      authData.password,
      user.password,
      true,
    );

    await this.userService.update({ _id: user.id }, { lastLogin: new Date() });

    return user;
  }

  // async refreshCode(
  //   phoneNumber: string,
  //   user: UserModel | CargoSupplierModel,
  //   type: LoginType,
  // ): Promise<any> {
  //   const now = new Date();
  //   const currentCode = await this.authCodeModel
  //     .findOne({ phoneNumber: phoneNumber })
  //     .exec();
  //   if (!currentCode || currentCode.expires < now) {
  //     const useIsDev = user.roles?.includes(Role.Dev);
  //     const newCode = useIsDev ? 777777 : generateCode(6);
  //     const minutes = 2;
  //     const expiresAt = new Date(now.getTime() + minutes * 60000);
  //     const newData = {
  //       expires: expiresAt,
  //       code: newCode,
  //       phoneNumber: phoneNumber,
  //       type: type,
  //     };
  //
  //     if (process.env.NODE_ENV === 'production') {
  //       if (!useIsDev) {
  //         await this.sendLoginCodeSMS(phoneNumber, newCode);
  //       }
  //     }
  //
  //     if (!currentCode) {
  //       // create a new
  //       const authCode = await this.authCodeModel.create(newData);
  //       return authCode.save();
  //     } else {
  //       // update existing
  //       return this.authCodeModel.findByIdAndUpdate(currentCode.id, newData, {
  //         new: true,
  //       });
  //     }
  //   }
  //   return null;
  // }

  async register(newUser: UserRegistration) {
    const user = await this.userService.registerUser(newUser);
    return await this.resendEmailVerificationCode(user.email);
    //return await this.getTokens(user.id, user.email);
  }

  async verifyEmail(verifyEmail: EmailVerifyModel) {
    const user = await this.userService.getByEmail(verifyEmail.email);
    if (user.isEmailAddressVerified) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Email has been already verified',
          errorCode: 'email_already_verified',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const authCodeFilter = {
      userId: user.id,
      code: verifyEmail.code,
      type: AUTH_CODE_TYPE_ENUM.email_verification,
      expiresAt: {
        $gte: new Date(),
      },
    };
    const authCode = await this.authCodeModel.exists(authCodeFilter);
    if (!authCode) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Invalid verification code',
          errorCode: 'invalid_verification_code',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.authCodeModel.deleteOne(authCodeFilter);
    await this.userService.update(
      { _id: user.id },
      { isActive: true, isEmailAddressVerified: true },
    );
    return { success: true };
  }

  async resendEmailVerificationCode(email: string) {
    const user = await this.userService.getByEmail(email);
    if (user.isEmailAddressVerified) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Email has been already verified',
          errorCode: 'email_already_verified',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const verificationCode = generateCode(6);
    await this.authCodeModel.create({
      userId: user.id,
      code: verificationCode,
      type: AUTH_CODE_TYPE_ENUM.email_verification,
      expiresAt: new Date(new Date().getTime() + AUTH_CODE_EXPIRY),
    });
    return { success: true };
    await this.mailingService.sendVerificationEmail(
      user.email,
      String(verificationCode),
    );
  }

  async login(authData: AuthRequestModel) {
    const user = await this.getAuthenticatedUser(authData);

    return await this.getTokens(user.id, user.email);
  }

  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: 'token' + getRandomStr(10),
          email: email,
          id: userId,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: 'refresh' + getRandomStr(10),
          email: email,
          id: userId,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_REFRESH_EXPIRATION_TIME',
          ),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(id: string) {
    const user = await this.userService.getById(id);

    return await this.getTokens(user.id, user.email);
  }

  async sendPasswordResetAuthCode(email: string) {
    const user = await this.userService.getByEmail(email);

    // if user has auth code delete it
    await this.authCodeModel.deleteMany({
      userId: user.id,
      type: AUTH_CODE_TYPE_ENUM.password_reset_verification,
    });

    const verificationCode = generateCode(6);
    await this.authCodeModel.create({
      userId: user.id,
      code: verificationCode,
      type: AUTH_CODE_TYPE_ENUM.password_reset_verification,
      expiresAt: new Date(new Date().getTime() + AUTH_CODE_EXPIRY),
    });
    return { success: true };
    await this.mailingService.sendPasswordResetAuthCodeEmail(
      user.email,
      String(verificationCode),
    );
  }

  async checkPasswordResetCode(
    checkResetCodeModel: PasswordResetCheckAuthCodeModel,
  ) {
    const user = await this.userService.getByEmail(checkResetCodeModel.email);
    const authCodeFilter = {
      userId: user.id,
      code: checkResetCodeModel.code,
      type: AUTH_CODE_TYPE_ENUM.password_reset_verification,
      expiresAt: {
        $gte: new Date(),
      },
    };
    const authCode = await this.authCodeModel.exists(authCodeFilter);
    if (!authCode) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Invalid verification code',
          errorCode: 'invalid_verification_code',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return { success: true };
  }

  async resetUserPassword(passwordResetModel: PasswordResetModel) {
    const user = await this.userService.getByEmail(passwordResetModel.email);
    const authCodeFilter = {
      userId: user.id,
      code: passwordResetModel.code,
      type: AUTH_CODE_TYPE_ENUM.password_reset_verification,
      expiresAt: {
        $gte: new Date(),
      },
    };
    const authCode = await this.authCodeModel.exists(authCodeFilter);
    if (!authCode) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Invalid verification code',
          errorCode: 'invalid_verification_code',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.userService.changePassword(
      user,
      passwordResetModel.password,
      passwordResetModel.passwordConfirmation,
    );
    await this.authCodeModel.deleteOne(authCodeFilter);
    return { success: true };
  }
}
