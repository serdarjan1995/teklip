import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRegistration } from './models/user.model';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post('register')
  // async registerUser(@Body() newUser: UserRegistration) {
  //   return await this.userService.registerUser(newUser);
  // }
}
