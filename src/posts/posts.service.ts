import { Injectable, NotFoundException } from '@nestjs/common';
export interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts: PostModel[] = [
  {
    id: 1,
    author: 'dwf',
    title: 'asd',
    content: 'sdw',
    likeCount: 213213,
    commentCount: 332,
  },
  {
    id: 2,
    author: 'dwf',
    title: 'asd',
    content: 'sdw',
    likeCount: 213213,
    commentCount: 332,
  },
  {
    id: 3,
    author: 'dwf',
    title: 'asd',
    content: 'sdw',
    likeCount: 213213,
    commentCount: 332,
  },
];
@Injectable()
export class PostsService {
  getAllPosts() {
    return posts;
  }

  getPostById(id: number) {
    const post = posts.find((post) => post.id === +id);
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  createPost(author: string, title: string, content: string) {
    const post = {
      id: posts[posts.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };
    posts = [...posts, post];
    return posts;
  }

  updatePost(postId: number, author: string, title: string, content: string) {
    const post = posts.find((post) => post.id === postId);

    if (!post) {
      throw new NotFoundException();
    }

    if (author) {
      post.author = author;
    }
    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }

    posts = posts.map((prevePost) =>
      prevePost.id === postId ? post : prevePost,
    );

    return posts;
  }

  deletePost(postId: number) {
    posts = posts.filter((post) => post.id !== postId);

    return postId;
  }
}
