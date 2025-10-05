import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Order } from './entities/order.entity';
import { Ticket } from './entities/ticket.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsSeederService } from './events.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Order, Ticket])],
  providers: [EventsService, EventsSeederService],
  controllers: [EventsController],
  exports: [EventsService, EventsSeederService]
})
export class EventsModule {}
