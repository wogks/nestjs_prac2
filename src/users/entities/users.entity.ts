import {
  IsEmail,
  IsString,
  Length,
  ValidationArguments,
  isEmail,
  isString,
} from 'class-validator';
import { emailValidationMessage } from 'src/common/validation-message.ts/email';
import { lengthValidationMessage } from 'src/common/validation-message.ts/length';
import { stringValidationMessage } from 'src/common/validation-message.ts/string';
import { PostsModel } from 'src/posts/entities/posts.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

enum RolesEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
@Entity()
export class UsersModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
    unique: true,
  })
  @Length(1, 20, {
    message: lengthValidationMessage,
  })
  @IsString({
    message: stringValidationMessage,
  })
  nickname: string;

  @Column({
    unique: true,
  })
  @IsString({
    message: stringValidationMessage,
  })
  @IsEmail(
    {},
    {
      message: emailValidationMessage,
    },
  )
  email: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  @Length(3, 8, {
    message: lengthValidationMessage,
  })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
