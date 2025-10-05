import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

export type EventWithAvailability = {
  id: string;
  name: string;
  place: string;
  startDate: Date;
  ticketCount: number;
  ticketPrice: number;
  ticketsSold: number;
  ticketsAvailable: number;
};

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>
  ) {}

  async findAll(): Promise<EventWithAvailability[]> {
    const events = await this.eventsRepository.find({
      relations: { tickets: true },
      order: { startDate: 'ASC' }
    });

    return events.map((event) => this.mapEvent(event));
  }

  private mapEvent(event: Event): EventWithAvailability {
    const ticketsSold = event.tickets?.length ?? 0;
    const ticketsAvailable = Math.max(event.ticketCount - ticketsSold, 0);

    return {
      id: event.id,
      name: event.name,
      place: event.place,
      startDate: event.startDate,
      ticketCount: event.ticketCount,
      ticketPrice: event.ticketPrice,
      ticketsSold,
      ticketsAvailable
    };
  }
}
