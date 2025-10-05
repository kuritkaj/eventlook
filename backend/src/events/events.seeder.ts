import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsSeederService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>
  ) {}

  async seedInitialEvents(): Promise<void> {
    const existing = await this.eventsRepository.count();
    if (existing > 0) {
      return;
    }

    const now = new Date();
    const events = [
      this.eventsRepository.create({
        name: 'Tech Innovations Summit',
        place: 'San Francisco, CA',
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        ticketCount: 200,
        ticketPrice: 149.99
      }),
      this.eventsRepository.create({
        name: 'Music Vibes Festival',
        place: 'Austin, TX',
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        ticketCount: 500,
        ticketPrice: 89.5
      }),
      this.eventsRepository.create({
        name: 'Design Matters Conference',
        place: 'New York, NY',
        startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        ticketCount: 350,
        ticketPrice: 199.0
      })
    ];

    await this.eventsRepository.save(events);
  }
}
