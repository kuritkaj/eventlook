import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { Order } from './entities/order.entity';
import { Ticket } from './entities/ticket.entity';
import { PurchaseTicketsDto } from './dto/purchase-tickets.dto';

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

export type PurchaseResult = {
  order: {
    id: string;
    orderNumber: string;
    createdAt: Date;
  };
  tickets: Array<{
    id: string;
    ticketNumber: string;
  }>;
};

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  async findAll(): Promise<EventWithAvailability[]> {
    const events = await this.eventsRepository.find({
      relations: { tickets: true },
      order: { startDate: 'ASC' }
    });

    return events.map((event) => this.mapEvent(event));
  }

  async purchase(eventId: string, dto: PurchaseTicketsDto): Promise<PurchaseResult> {
    return this.dataSource.transaction(async (manager) => {
      const eventsRepository = manager.withRepository(this.eventsRepository);
      const ordersRepository = manager.withRepository(this.ordersRepository);
      const ticketsRepository = manager.withRepository(this.ticketsRepository);

      const event = await eventsRepository.findOne({
        where: { id: eventId },
        lock: { mode: 'pessimistic_write' }
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      await this.verifyPurchase(event, dto.quantity, ticketsRepository);

      const order = ordersRepository.create({
        event,
        orderNumber: this.generateOrderNumber()
      });

      const savedOrder = await ordersRepository.save(order);

      const ticketEntities = Array.from({ length: dto.quantity }).map(() =>
        ticketsRepository.create({
          event,
          order: savedOrder,
          ticketNumber: this.generateTicketNumber()
        })
      );

      const savedTickets = await ticketsRepository.save(ticketEntities);

      return {
        order: {
          id: savedOrder.id,
          orderNumber: savedOrder.orderNumber,
          createdAt: savedOrder.createdAt
        },
        tickets: savedTickets.map((ticket) => ({
          id: ticket.id,
          ticketNumber: ticket.ticketNumber
        }))
      };
    });
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

  private async verifyPurchase(
    event: Event,
    quantity: number,
    ticketsRepository: Repository<Ticket>
  ): Promise<void> {
    if (quantity <= 0) {
      throw new BadRequestException('Purchase verification failed');
    }

    const ticketsSold = await ticketsRepository.count({
      where: { event: { id: event.id } }
    });
    const ticketsAvailable = event.ticketCount - ticketsSold;

    if (ticketsAvailable <= 0) {
      throw new BadRequestException('Event is sold out');
    }

    if (quantity > ticketsAvailable) {
      throw new BadRequestException('Not enough tickets available');
    }
  }

  private generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  }

  private generateTicketNumber(): string {
    return `T-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }
}
