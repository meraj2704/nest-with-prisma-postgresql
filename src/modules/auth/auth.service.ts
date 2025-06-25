import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
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
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = this.generateTokens(user);
    return {
      message: 'Login successful',
      data: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user,
      },
    };
  }

  // async register(registerDto: RegisterDto) {
  //   const existingUser = await this.prisma.user.findFirst({
  //     where: {
  //       OR: [{ email: registerDto.email }, { username: registerDto.username }],
  //     },
  //   });
  //   if (existingUser) {
  //     console.log('existingUser', existingUser);
  //     console.log('registerDto', registerDto);
  //     if (existingUser.email === registerDto.email) {
  //       throw new ConflictException('User with this email already exists');
  //     }
  //     if (existingUser.username === registerDto.username) {
  //       throw new ConflictException('User with this username already exists');
  //     }
  //   }
  //   const hashedPassword = await bcrypt.hash(registerDto.password, 10);
  //   const user = await this.prisma.user.create({
  //     data: {
  //       username: registerDto.username,
  //       fullName: registerDto.full_name,
  //       email: registerDto.email,
  //       phone: registerDto.phone,
  //       password: hashedPassword,
  //     },
  //   });
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const { password, ...userWithoutPassword } = user;
  //   const tokens = this.generateTokens(user);
  //   return {
  //     message: 'User registered successfully',
  //     data: {
  //       access_token: tokens.access_token,
  //       refresh_token: tokens.refresh_token,
  //       user: userWithoutPassword,
  //     },
  //   };
  // }

  private generateTokens(user: any) {
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

  async refreshToken(token: string) {
    console.log('token', token);
    try {
      const decoded = this.jwtService.verify(token);
      console.log('decoded', decoded);
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });
      console.log('user', user);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      const tokens = this.generateTokens(user);
      return {
        message: 'Tokens refreshed successfully',
        data: {
          ...tokens,
          user: userWithoutPassword,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async changePassword(changePasswordDto: {
    email: string;
    currentPassword: string;
    newPassword: string;
  }) {
    // const user = await this.validateUser(
    //   changePasswordDto.email,
    //   changePasswordDto.currentPassword,
    // );

    const user = await this.prisma.user.findUnique({
      where: { email: changePasswordDto.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const passwordMatch = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );
    await this.prisma.user.update({
      where: { email: changePasswordDto.email },
      data: { password: hashedNewPassword },
    });

    return {
      message: 'Password changed successfully',
    };
  }
}
