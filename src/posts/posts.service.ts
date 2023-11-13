import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from 'src/users/entities/users.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDtop } from './dto/paginate-post.dot';
import { url } from 'inspector';
import { URL } from 'url';
import { HOST, PROTOCOL } from 'src/auth/const/env.const';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postRepository: Repository<PostsModel>,
  ) {}

  async getAllPosts() {
    return await this.postRepository.find({
      relations: ['author'],
    });
  }

  async paginatePosts(dto: PaginatePostDtop) {
    if (dto.page) {
      return this.pagePagenatePosts(dto);
    } else {
      return this.cursorPaginatePosts(dto);
    }
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

    if (dto.where__id_less_than) {
      where.id = LessThan(dto.where__id_less_than);
    } else if (dto.where__id_more_than) {
      where.id = MoreThan(dto.where__id_more_than);
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

    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/posts`);

    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (key !== 'where__id_more_than' && key !== 'where__id_less_than') {
            nextUrl.searchParams.append(key, dto[key].toString());
          }
        }
      }
      let key = null;
      if (dto.order__createdAt === 'ASC') {
        key = 'where__id_more_than';
      } else {
        key = 'where__id_less_than';
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
