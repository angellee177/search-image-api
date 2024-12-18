import { Request, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './user.service';
import { User } from './entity/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { GqlAuthGuard } from '../auth/guard/gql-auth.guard';
import { setLog } from 'src/common/logger.helper';

@Resolver(of => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [User])
  async users(): Promise<User[]> {
    setLog({
      level: 'info',
      method: 'UserResolver.users',
      message: `Started getting all users`,
    });

    return this.usersService.findAll();
  }

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    return this.usersService.create(createUserInput);
  }
}