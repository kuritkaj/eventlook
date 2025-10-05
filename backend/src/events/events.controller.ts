import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post
} from '@nestjs/common';
import { EventsService } from './events.service';
import { EventPurchaseService } from './event-purchase.service';
import { PurchaseTicketsDto } from './dto/purchase-tickets.dto';
import {
  EventNotFoundError,
  EventsServiceError
} from './exceptions/events-service.exception';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly eventPurchaseService: EventPurchaseService
  ) {}

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Post(':id/purchase')
  async purchase(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: PurchaseTicketsDto
  ) {
    try {
      return await this.eventPurchaseService.purchase(id, dto);
    } catch (error) {
      if (error instanceof EventNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof EventsServiceError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
