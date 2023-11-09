import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, isNumber } from 'class-validator';

export class PaginatePostDtop {
  @IsNumber()
  @IsOptional()
  where__id_more_than?: number;

  @IsIn(['ASC'])
  @IsOptional()
  order__createdAt: 'ASC' = 'ASC';

  @IsNumber()
  @IsOptional()
  take: number = 20;
}
