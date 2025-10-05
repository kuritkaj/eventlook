import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Event } from './event.entity';
import { Ticket } from './ticket.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Event, (event) => event.orders, { onDelete: 'CASCADE' })
  event: Event;

  @OneToMany(() => Ticket, (ticket) => ticket.order, { cascade: ['insert'] })
  tickets: Ticket[];
}
