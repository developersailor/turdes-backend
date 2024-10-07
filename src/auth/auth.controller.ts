// Auth Controller (auth/auth.controller.ts)
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../models/user.model';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh.dto';
@Controller('auth')
@ApiTags()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'User already exists.' })
  async register(@Body() userDto: UserDto) {
    return this.authService.register(userDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token.',
  })
  async refreshToken(@Body() refresh: RefreshTokenDto) {
    const { refreshToken } = refresh;
    try {
      // Refresh token'ı doğrula
      const decoded = this.jwtService.verify(refresh.refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      const user = await User.findOne({
        where: { id: decoded.userId, refreshToken },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Yeni access token oluşturma
      const payload = { userId: user.id, email: user.email, role: user.role };
      const newAccessToken = this.jwtService.sign(payload, {
        expiresIn: '15m',
        secret: process.env.JWT_SECRET,
      });

      return { accessToken: newAccessToken };
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }
}
