import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async getUsers() {
    return await this.usersRepository.find();
  }

  async createUser(user: Pick<UsersModel, 'email' | 'nickname' | 'password'>) {
    //닉네임 중복이 없는지 확인
    //exist()-> 해당되는 값이 있으면 true
    const nicknameExists = await this.usersRepository.exist({
      where: {
        nickname: user.nickname,
      },
    });

    if (nicknameExists) {
      throw new BadRequestException('이미 존재하는 익네임 입니다.');
    }

    const emailExists = await this.usersRepository.exist({
      where: {
        email: user.email,
      },
    });
    if (emailExists) {
      throw new BadRequestException('이메일이 존재합니다.');
    }

    const userObject = this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    const newUser = await this.usersRepository.save(user);

    return user;
  }

  async getUserByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }
}
