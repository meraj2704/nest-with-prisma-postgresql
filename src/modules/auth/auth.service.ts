import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/users.repository.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return this.withoutPassword(user);
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      message: 'Login successful',
      data: {
        ...this.generateTokens(user),
        user,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findByEmailOrUsername(
      registerDto.email,
      registerDto.username,
    );
    if (existingUser) {
      if (existingUser.email === registerDto.email) {
        throw new ConflictException('User with this email already exists');
      }
      throw new ConflictException('User with this username already exists');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersRepository.create({
      username: registerDto.username,
      fullName: registerDto.full_name,
      email: registerDto.email,
      phone: registerDto.phone,
      password: hashedPassword,
      Department: { connect: { id: 1 } },
    });
    return {
      message: 'User registered successfully',
      data: {
        ...this.generateTokens(user),
        user: this.withoutPassword(user),
      },
    };
  }

  async refreshToken(token: string) {
    let decoded: { sub: number };
    try {
      decoded = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.usersRepository.findById(decoded.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return {
      message: 'Tokens refreshed successfully',
      data: {
        ...this.generateTokens(user),
        user: this.withoutPassword(user),
      },
    };
  }

  async changePassword(dto: {
    email: string;
    currentPassword: string;
    newPassword: string;
  }) {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const passwordMatch = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.usersRepository.update(user.id, {
      password: await bcrypt.hash(dto.newPassword, 10),
    });

    return {
      message: 'Password changed successfully',
    };
  }

  private generateTokens(
    user: Pick<User, 'id' | 'email' | 'username' | 'role' | 'departmentId'>,
  ) {
    const payload = {
      email: user.email,
      sub: user.id,
      username: user.username,
      role: user.role,
      departmentId: user.departmentId,
    };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1d' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  private withoutPassword(user: User) {
    const { password: _password, ...rest } = user;
    return rest;
  }
}
