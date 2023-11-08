import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { HASH_ROUNDS, JWT_SEVRET } from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { emit } from 'process';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersServies: UsersService,
  ) {}

  extractTokenFromHeadr(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('잘못된 토큰');
    }
    const token = splitToken[1];

    return token;
  }

  //1 이메일,닉네임,비번을 입력받고 사용자를 생성한다. 생성 완료 후 토큰을 반환한다. 회원가입후 다시 로그인해주세요를 방지하기 위해서
  async registerWithEmail(
    user: Pick<UsersModel, 'nickname' | 'email' | 'password'>,
  ) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);
    const newUser = await this.usersServies.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }

  //2 이메일, 비번을 입력하면 사용자 검증을 진행한다 검증이 완료되면 토큰들을 반환한다
  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);
    return this.loginUser(existingUser);
  }

  //3. 1,2에서 필요한 엑세스, 리프레쉬 토큰을 반환하는 로직
  loginUser(user: Pick<UsersModel, 'id' | 'email'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  //4. signToken: 3에서 필요한 access, refreshtocken을 반환하는 로직
  //페이로드에 email, sub->id, type: 'access, refresh'
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SEVRET,
      //기한 초단위
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }
  //5. 2에서 로그인을 진행할때 필요한 기본적인 검증진행
  //1 사용자 존재하는지 확인 2 비밀번호가 맞는기 확인 3 모두 통과되면 찾은 상용자 정보 변환 4 loginemail에서 반환된 데이터를 기반으로 토큰 생성
  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    const existingUser = await this.usersServies.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }
    //파라미터 1. 입력된 비밀번호, 기존해시 -> 사용자 정보에 저장돼있는 hash
    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다.');
    }
    return existingUser;
  }
  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');

    const split = decoded.split(':');
    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 유형의 토큰이다');
    }
    const email = split[0];
    const password = split[1];

    return {
      email,
      password,
    };
  }
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: JWT_SEVRET,
      });
    } catch (error) {
      throw new UnauthorizedException('토큰만료 혹은 잘못됨');
    }
  }
  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: JWT_SEVRET,
    });
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('is not refrexh');
    }
    return this.signToken(
      {
        ...decoded,
      },
      isRefreshToken,
    );
  }
}
