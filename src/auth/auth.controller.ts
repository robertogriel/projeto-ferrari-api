import { BadRequestException, Body, Controller, Get, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import {parse} from 'date-fns';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController
{

    constructor(private userService: UserService, private authService: AuthService) {}

    @Post()
    async verifyEmail(@Body('email') email)
    {
        try {
            await this.userService.getByEmail(email);
            return {
                exists: true
            }
        } catch (e) {
            return {
                exists: false
            }
        }
    }

    @Post('register')
    async register(@Body() body)
    {
        
        let { name, email, birthAt, phone, document, password } = body;
        
        if (birthAt) {
            try {
                birthAt = parse(birthAt, 'yyyy-MM-dd', new Date());
            } catch (e) {

                throw new BadRequestException('Birth date is invalid')
            }
        }

        const user = await this.userService.create({
            name, email, birthAt, phone, document, password
        });

        const token = await this.authService.getToken(user.id);

        return { user, token }
    }

    @Post('login')
    async login(@Body('email') email, @Body('password') password)
    {

        return this.authService.login({ email, password })
        
    }

    @UseGuards(AuthGuard)
    @Get('me')
    async me(){

        return {
            sucess: true
        }

    }

}
