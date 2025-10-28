import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../dto/users/create-user.dto';
import { UsersService } from '../services/users.service';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.registerUser(createUserDto);
  }
}
