import { Injectable, NotFoundException } from '@nestjs/common';
   import { InjectRepository } from '@nestjs/typeorm';
   import { Repository } from 'typeorm';
   import { User } from './entity/user.entity';
   import { CreateUserInput } from './dto/create-user.input';
   import * as bcrypt from 'bcrypt';
import { setLog } from 'src/common/logger.helper';

   @Injectable()
   export class UsersService {
     constructor(
       @InjectRepository(User)
       private usersRepository: Repository<User>,
     ) {}

     /**
      * Finding User with username
      * 
      * @param username 
      * @returns 
      */
      async findOneByUsername(username: string): Promise<User | undefined> {
        setLog({
          level: 'info',
          method: 'UserService.findOneByUsername',
          message: `Fetching user with username: ${username}`,
        });

        const user = this.usersRepository.findOne({ where: { username } });
        if (!user) {
          setLog({
            level: 'warn',
            method: 'UserService.findOneByUsername',
            message: `User with username: ${username} not found`,
          });

          throw new NotFoundException(`User with username ${username} not found`);
        }

        return user;
      }

      /**
       * Finding user with email
       * 
       * @param email 
       * @returns 
       */
      async findOneByEmail(email: string): Promise<User | undefined> {
        setLog({
          level: 'info',
          method: 'UserService.findOneByEmail',
          message: `Fetching user with email: ${email}`,
        });
      
        // Attempt to find the user by email
        const user = await this.usersRepository.findOne({ where: { email } });
      
        // If the user is not found, log the warning and throw a NotFoundException
        if (!user) {
          setLog({
            level: 'warn',
            method: 'UserService.findOneByEmail',
            message: `User with email: ${email} not found`,
          });
      
          throw new NotFoundException(`User with email ${email} not found`);
        }
      
        // Return the user if found
        return user;
      }
     
      /**
       * Get all users with pagination and limit
       * 
       * @param page 
       * @param limit 
       * @returns 
       */
      async findAll(page: number = 1, limit: number = 10) {
        setLog({
          level: 'info',
          method: 'UserService.findAll',
          message: `Fetching all users`,
        });

        return this.usersRepository.find({
          order: { username: 'ASC' },
        })
     }

    async create(createUserInput: CreateUserInput): Promise<User> {
      try {
        // Log the start of the user creation process
        setLog({
          level: 'info',
          method: 'UserService.create',
          message: `Creating a new user with username: ${createUserInput.username}`,
        });
    
        // Hash the password before saving the user
        const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
    
        // Create the user object with hashed password
        const user = this.usersRepository.create({ ...createUserInput, password: hashedPassword });
    
        // Save the new user to the database
        const savedUser = await this.usersRepository.save(user);
    
        // Log successful user creation
        setLog({
          level: 'info',
          method: 'UserService.create',
          message: `User created successfully with username: ${createUserInput.username}`,
        });
    
        return savedUser;
      } catch (error) {
        // Log error if the user creation fails
        setLog({
          level: 'error',
          method: 'UserService.create',
          message: `Error creating user with username: ${createUserInput.username}`,
          error: error.message, // Log the error message
        });
    
        // Rethrow the error to be handled by higher-level error handling
        throw new Error('Error creating user. Please try again.');
      }
    }
   }