import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Exclude password from the returned user object
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id };
    return {
      message: 'Login successful',

      data: {
        access_token: this.jwtService.sign(payload),
        refresh_token: this.jwtService.sign(payload),
        user,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.users.create({
      data: {
        username: registerDto.username,
        full_name: registerDto.full_name,
        email: registerDto.email,
        phone: registerDto.phone,
        password: hashedPassword,
      },
    });
    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user,
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.prisma.users.findUnique({
        where: { user_id: decoded.sub },
      });
      if (!user) {
        throw new Error('User not found');
      }
      return this.generateTokens(user);
    } catch {
      throw new Error('Invalid token');
    }
  }
}
