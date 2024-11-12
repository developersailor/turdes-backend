import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh.dto';
import { AuthGuard } from '@nestjs/passport';
@Controller('auth')
@ApiTags('Authentication') // Api Tag ekledik
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService // Prisma servisi ekledik
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'User already exists.' })
  @ApiBody({ type: UserDto }) // Body'nin tipini Swagger için belirttik
  async register(@Body() userDto: UserDto) {
    return this.authService.register(userDto);
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
  @ApiBody({ type: RefreshTokenDto }) // Body'nin tipini Swagger için belirttik
  async refreshToken(@Body() refresh: RefreshTokenDto) {
    return this.authService.refreshToken(refresh.refreshToken);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AuthGuard('local')) // LocalStrategy kullanarak kimlik doğrulama
  async login(@Body() loginDto: LoginDto) {
    const token = await this.authService.login(loginDto);
    return token; // Direkt JSON yanıtı döndürmek NestJS'de daha yaygın bir yaklaşımdır
  }
}
