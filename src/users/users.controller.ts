import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from './jwt.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { MailService } from './mail.service';

@Controller('auth')
export class UsersController {
    constructor(private readonly usersService: UsersService, private readonly authService: AuthService, private readonly mailService: MailService) { }

    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto) {
        const existingUser = await this.usersService.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new BadRequestException('Email already in use');
        }

        const user = await this.usersService.create(createUserDto);
        const jwtData = await this.authService.generateToken(createUserDto.email);
        return {
            ...jwtData,
            message: 'User created successfully',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        };
    }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {

        const validUser = await this.usersService.validateUser(loginUserDto.email, loginUserDto.password);
        if (!validUser) {
            throw new BadRequestException('Invalid credentials');
        }

        const jwtData = await this.authService.generateToken(loginUserDto.email);

        return {
            ...jwtData,
            message: 'User login successfully',
            user: {
                id: validUser._id,
                email: validUser.email,
                firstName: validUser.firstName,
                lastName: validUser.lastName,
            },
        };
    }

    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        const token = await this.usersService.generateResetToken(email);
        const res = await this.mailService.sendResetPasswordEmail(email, token);

        return { message: 'Reset password email sent' };
    }

    @Post('reset-password')
    async resetPassword(@Body() body: { token: string; newPassword: string }) {
        return await this.usersService.resetPassword(body.token, body.newPassword);
    }


}
