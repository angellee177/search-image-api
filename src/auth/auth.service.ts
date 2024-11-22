import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { setLog } from 'src/common/logger.helper';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validate user info before login
   * 
   * @param username 
   * @param pass 
   * @returns 
   */
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);

    if (!user) {
      setLog({
        level: 'warn',
        method: 'AuthService.validateUser',
        message: `User not found`,
      });
      throw new BadRequestException('User not found');
    }

    const isMatch: boolean = bcrypt.compareSync(pass, user.password);

    if (!isMatch) {
      setLog({
        level: 'warn',
        method: 'AuthService.validateUser',
        message: `Password does not match`,
      });
      throw new BadRequestException('Password does not match');
    }

    const { password, ...result } = user;

    return result;
  }

  /**
   * Login 
   * 
   * @param user 
   * @returns 
   */
  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    setLog({
      level: 'info',
      method: 'AuthService.login',
      message: `Login successfull`,
    });

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}