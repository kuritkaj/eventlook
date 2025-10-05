import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Order } from './order.entity';
import { Ticket } from './ticket.entity';

const numericTransformer = {
  to: (value: number) => value,
  from: (value: string | number): number =>
    typeof value === 'number' ? value : parseFloat(value)
};

@Entity({ name: 'events' })
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  place: string;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'int' })
  ticketCount: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numericTransformer })
  ticketPrice: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.event)
  orders: Order[];

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets: Ticket[];
}
