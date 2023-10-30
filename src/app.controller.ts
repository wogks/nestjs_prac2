import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

interface Post {
  author: string;
  title: string;
  content: string;
  likeContent: number;
  commentCount: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('post')
  getPost(): Post {
    return {
      author: 'asdas',
      title: 'asd',
      content: 'sass',
      likeContent: 2,
      commentCount: 3,
    };
  }
}
