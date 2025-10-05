import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from './event.entity';
import { Order } from './order.entity';

@Entity({ name: 'tickets' })
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ticketNumber: string;

  @ManyToOne(() => Event, (event) => event.tickets, { onDelete: 'CASCADE' })
  event: Event;

  @ManyToOne(() => Order, (order) => order.tickets, { onDelete: 'CASCADE' })
  order: Order;
}
