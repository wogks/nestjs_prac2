import { BadRequestException, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { UsersModel } from 'src/users/entities/users.entity';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import * as multer from 'multer';

import {
  POST_IMAGE_PATH,
  PROJECT_ROOT_PATH,
} from 'src/common/const/path.const';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel, UsersModel]),
    JwtModule.register({}),
    UsersModule,
    CommonModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, AuthService, UsersService],
})
export class PostsModule {}
