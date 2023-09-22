import {
  Body,
  Req,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import RequestWithUser from './requestWithUser.interface';
import { UserRegistration } from '../user/models/user.model';
import { UserService } from '../user/user.service';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { EmailVerifyModel } from './models/emailVerify.model';
import {
  PasswordResetCheckAuthCodeModel,
  PasswordResetModel,
} from './models/passwordReset.model';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async registerUser(@Body() newUser: UserRegistration) {
    return await this.authService.register(newUser);
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmail: EmailVerifyModel) {
    return await this.authService.verifyEmail(verifyEmail);
  }

  @Post('resend-verification-email')
  async resendVerificationEmail(@Body('email') email: string) {
    return await this.authService.resendEmailVerificationCode(email);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async logIn(@Req() request: RequestWithUser) {
    const user = request.user;
    //user.password = undefined;
    return user;
  }

  @UseGuards(AccessTokenGuard)
  @Get('user')
  async user(@Req() request: RequestWithUser) {
    const user = request.user;
    //user.password = undefined;
    return user;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refreshTokens(@Req() req: RequestWithUser) {
    const userId = req.user['id'];
    return this.authService.refreshTokens(userId);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return await this.authService.sendPasswordResetAuthCode(email);
  }

  @Post('forgot-password/check-code')
  async forgotPasswordCheckCode(
    @Body() passwordResetCheckAuthCodeModel: PasswordResetCheckAuthCodeModel,
  ) {
    return await this.authService.checkPasswordResetCode(
      passwordResetCheckAuthCodeModel,
    );
  }

  @Post('forgot-password/reset')
  async forgotPasswordChange(@Body() passwordResetModel: PasswordResetModel) {
    return await this.authService.resetUserPassword(passwordResetModel);
  }
}
