import { IsInt, Max, Min } from 'class-validator';

export class PurchaseTicketsDto {
  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;
}
