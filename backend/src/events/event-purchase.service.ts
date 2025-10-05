import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { Order } from './entities/order.entity';
import { Ticket } from './entities/ticket.entity';
import { PurchaseTicketsDto } from './dto/purchase-tickets.dto';
import {
  EventNotFoundError,
  EventSoldOutError,
  InvalidPurchaseQuantityError,
  NotEnoughTicketsAvailableError
} from './exceptions/events-service.exception';

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
export class EventPurchaseService {
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
        throw new EventNotFoundError(eventId);
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

  private async verifyPurchase(
    event: Event,
    quantity: number,
    ticketsRepository: Repository<Ticket>
  ): Promise<void> {
    if (quantity <= 0) {
      throw new InvalidPurchaseQuantityError();
    }

    const ticketsSold = await ticketsRepository.count({
      where: { event: { id: event.id } }
    });
    const ticketsAvailable = event.ticketCount - ticketsSold;

    if (ticketsAvailable <= 0) {
      throw new EventSoldOutError();
    }

    if (quantity > ticketsAvailable) {
      throw new NotEnoughTicketsAvailableError();
    }
  }

  private generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  }

  private generateTicketNumber(): string {
    return `T-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }
}
