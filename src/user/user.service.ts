import { Injectable } from '@nestjs/common';
   import { InjectRepository } from '@nestjs/typeorm';
   import { Repository } from 'typeorm';
   import { User } from './entity/user.entity';
   import { CreateUserInput } from './dto/create-user.input';
   import * as bcrypt from 'bcrypt';

   @Injectable()
   export class UsersService {
     constructor(
       @InjectRepository(User)
       private usersRepository: Repository<User>,
     ) {}

     async findOneByUsername(username: string): Promise<User | undefined> {
       return this.usersRepository.findOne({ where: { username } });
     }

     async findOneByEmail(email: string): Promise<User | undefined> {
       return this.usersRepository.findOne({ where: { email } });
     }
     
     async findAll() {
        return this.usersRepository.find({
            order: { username: 'ASC' },
        })
     }

     async create(createUserInput: CreateUserInput): Promise<User> {
       const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
       const user = this.usersRepository.create({ ...createUserInput, password: hashedPassword });
       return this.usersRepository.save(user);
     }
   }