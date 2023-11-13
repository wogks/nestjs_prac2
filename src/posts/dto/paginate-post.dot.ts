import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  isNumber,
} from 'class-validator';
import { BasePaginationDto } from 'src/common/dto/base-pagination.dto';

export class PaginatePostDtop extends BasePaginationDto {
  @IsNumber()
  @IsOptional()
  where__id__more_than: number;

  @IsString()
  @IsOptional()
  where__title__i_like: string;
}
