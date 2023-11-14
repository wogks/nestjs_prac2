import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from 'src/users/entities/users.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDtop } from './dto/paginate-post.dot';
import { url } from 'inspector';
import { URL } from 'url';
import { CommonService } from 'src/common/common.service';
import {
  ENV_HOST_KEY,
  ENV_PROTOCOL_KEY,
} from 'src/common/const/env-keys.const';
import { ConfigService } from '@nestjs/config';
import {
  POST_IMAGE_PATH,
  PUBLIC_FOLDER_PATH,
  TEMP_FOLDER_PATH,
} from 'src/common/const/path.const';
import { basename, join } from 'path';
import { promises } from 'fs';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
  ) {}

  async getAllPosts() {
    return await this.postRepository.find({
      relations: ['author'],
    });
  }

  async paginatePosts(dto: PaginatePostDtop) {
    return this.commonService.paginate(
      dto,
      this.postRepository,
      { relations: ['author'] },
      'posts',
    );
  }

  async pagePagenatePosts(dto: PaginatePostDtop) {
    const [posts, count] = await this.postRepository.findAndCount({
      skip: dto.take * (dto.page - 1),
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt,
      },
    });
    return {
      data: posts,
      total: count,
    };
  }

  async cursorPaginatePosts(dto: PaginatePostDtop) {
    const where: FindOptionsWhere<PostsModel> = {};

    if (dto.where__id__less_than) {
      where.id = LessThan(dto.where__id__less_than);
    } else if (dto.where__id__more_than) {
      where.id = MoreThan(dto.where__id__more_than);
    }
    const posts = await this.postRepository.find({
      where,
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });
    const lastItem =
      posts.length > 0 && posts.length === dto.take
        ? posts[posts.length - 1]
        : null;
    const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const host = this.configService.get<string>(ENV_HOST_KEY);

    const nextUrl = lastItem && new URL(`${protocol}://${host}/posts`);

    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, dto[key].toString());
          }
        }
      }
      let key = null;
      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }
      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: posts,
      curosr: {
        after: lastItem?.id ?? null,
      },
      count: posts.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `타이틀${i} `,
        content: `내용${i}`,
      });
    }
    return true;
  }

  async getPostById(id: number) {
    const post = await this.postRepository.findOne({
      where: {
        id,
      },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  async createPost(authorId: number, postDto: CreatePostDto) {
    const post = this.postRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
    });

    const newpost = await this.postRepository.save(post);

    return newpost;
  }

  async createPostImage(dto: CreatePostDto) {
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.image);
    try {
      await promises.access(tempFilePath);
    } catch (e) {
      throw new BadRequestException('존재하지않는 파일');
    }
    const fileName = basename(tempFilePath);

    const newPath = join(POST_IMAGE_PATH, fileName);

    await promises.rename(tempFilePath, newPath);

    return true;
  }

  async updatePost(postId: number, postDto: UpdatePostDto) {
    const { title, content } = postDto;
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }

    const newPost = await this.postRepository.save(post);

    return newPost;
  }

  deletePost(postId: number) {
    this.postRepository.delete(postId);

    return postId;
  }
}
