import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([UsersModel])],
  controllers: [AuthController],
  providers: [AuthService, UsersService],
})
export class AuthModule {}
