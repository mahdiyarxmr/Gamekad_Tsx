import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtGuard, Public } from '../common/jwt.guard';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

class RegisterDto {
  @IsString() @MinLength(3) username: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsString() confirm: string;
  @IsOptional() @IsString() displayName?: string;
  @IsIn(['boy', 'girl'], { message: 'جنسیت را انتخاب کن: پسر یا دختر.' })
  gender: string;
  @IsOptional() @IsString() phone?: string;
}
class LoginDto {
  @IsString() username: string;
  @IsString() password: string;
}

@ApiTags('auth')
@Controller('auth')
@UseGuards(JwtGuard)
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public() @Post('register')
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }

  @Public() @Post('login')
  login(@Body() body: LoginDto) {
    return this.auth.login(body);
  }

  @Public() @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.auth.refresh(body.refreshToken);
  }

  @Public() @Post('logout')
  logout(@Body() body: { refreshToken?: string }) {
    return this.auth.logout(body.refreshToken || '');
  }

  @Get('me')
  me(@Req() req: any) {
    return this.auth.me(req.user.id);
  }

  @Patch('me')
  updateMe(@Req() req: any, @Body() body: any) {
    return this.auth.updateMe(req.user.id, body);
  }

  @Post('me/avatar')
  avatar(@Req() req: any, @Body() body: { image?: string }) {
    return this.auth.uploadAvatar(req.user.id, body?.image || '');
  }
}
