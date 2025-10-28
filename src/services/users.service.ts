import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { CreateUserDto } from '../dto/users/create-user.dto';
import { UsersRepository } from '../repositories/users.repository';
import { UserDocument } from '../schemas/user.schema';

//to avoid type issue while returning results
export interface RegisterUserResult {
  message: string;
  user: {
    id: string;
    email: string;
    role: UserDocument['role'];
    profile: UserDocument['profile'];
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async registerUser(dto: CreateUserDto): Promise<RegisterUserResult> {
    const normalizedEmail = dto.email.toLowerCase();
    const existingUser =
      await this.usersRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('User already exists. Please login.');
    }

    const passwordHash = await hash(dto.password, 12);

    const createdUser = this.ensureUserDocument(
      await this.usersRepository.create({
        email: normalizedEmail,
        passwordHash,
        profile: dto.profile,
      }),
    );

    return {
      message: 'User registered successfully.',
      user: {
        id: String(createdUser.id),
        email: createdUser.email,
        role: createdUser.role,
        profile: createdUser.profile,
      },
    };
  }

  //member functions
  private ensureUserDocument(value: unknown): UserDocument {
    if (!this.isUserDocument(value)) {
      throw new InternalServerErrorException('Failed to create user record.');
    }

    return value;
  }

  private isUserDocument(value: unknown): value is UserDocument {
    return (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      'email' in value &&
      'role' in value
    );
  }
}
