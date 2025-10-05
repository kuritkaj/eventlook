import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { EventsService } from './events.service';
import { PurchaseTicketsDto } from './dto/purchase-tickets.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Post(':id/purchase')
  purchase(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: PurchaseTicketsDto
  ) {
    return this.eventsService.purchase(id, dto);
  }
}
