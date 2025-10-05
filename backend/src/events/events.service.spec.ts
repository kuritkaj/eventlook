import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { Order } from './entities/order.entity';
import { Ticket } from './entities/ticket.entity';

const createMockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  create: jest.fn()
});

type DataSourceLike = Pick<DataSource, 'transaction'>;

describe('EventsService', () => {
  let service: EventsService;
  let eventsRepository: jest.Mocked<Repository<Event>>;
  let ordersRepository: jest.Mocked<Repository<Order>>;
  let ticketsRepository: jest.Mocked<Repository<Ticket>>;
  let dataSource: jest.Mocked<DataSourceLike>;
  let baseEventsRepository: Repository<Event>;
  let baseOrdersRepository: Repository<Order>;
  let baseTicketsRepository: Repository<Ticket>;

  const mockTransaction = ({
    eventRepo,
    orderRepo,
    ticketRepo
  }: {
    eventRepo: ReturnType<typeof createMockRepository>;
    orderRepo: ReturnType<typeof createMockRepository>;
    ticketRepo: ReturnType<typeof createMockRepository>;
  }) => {
    dataSource.transaction.mockImplementation(async (arg1: any, arg2?: any) => {
      const callback = typeof arg1 === 'function' ? arg1 : arg2;
      if (typeof callback !== 'function') {
        throw new Error('Transaction callback missing');
      }
      return callback({
        withRepository: (repo: unknown) => {
          if (repo === baseEventsRepository) {
            return eventRepo as unknown;
          }
          if (repo === baseOrdersRepository) {
            return orderRepo as unknown;
          }
          if (repo === baseTicketsRepository) {
            return ticketRepo as unknown;
          }
          throw new Error('Unexpected repository request');
        }
      } as any);
    });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: createMockRepository()
        },
        {
          provide: getRepositoryToken(Order),
          useValue: createMockRepository()
        },
        {
          provide: getRepositoryToken(Ticket),
          useValue: createMockRepository()
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventsRepository = module.get(getRepositoryToken(Event));
    ordersRepository = module.get(getRepositoryToken(Order));
    ticketsRepository = module.get(getRepositoryToken(Ticket));
    dataSource = module.get(DataSource) as jest.Mocked<DataSourceLike>;
    baseEventsRepository = (service as any).eventsRepository;
    baseOrdersRepository = (service as any).ordersRepository;
    baseTicketsRepository = (service as any).ticketsRepository;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns events ordered with availability metadata', async () => {
    const event: Partial<Event> = {
      id: 'event-1',
      name: 'Sample',
      place: 'Venue',
      startDate: new Date('2024-01-01T20:00:00Z'),
      ticketCount: 100,
      ticketPrice: 50,
      tickets: new Array(25).fill(null)
    };
    eventsRepository.find.mockResolvedValue([event as Event]);

    const result = await service.findAll();

    expect(eventsRepository.find).toHaveBeenCalledWith({
      relations: { tickets: true },
      order: { startDate: 'ASC' }
    });
    expect(result).toEqual([
      expect.objectContaining({
        id: 'event-1',
        ticketsAvailable: 75,
        ticketsSold: 25
      })
    ]);
  });

  it('prevents purchasing more tickets than available', async () => {
    const transactionalEventRepo = createMockRepository();
    const transactionalOrderRepo = createMockRepository();
    const transactionalTicketRepo = createMockRepository();

    transactionalEventRepo.findOne.mockResolvedValue({
      id: 'event-2',
      ticketCount: 2,
      ticketPrice: 10
    } as unknown as Event);
    transactionalTicketRepo.count.mockResolvedValue(2);

    mockTransaction({
      eventRepo: transactionalEventRepo,
      orderRepo: transactionalOrderRepo,
      ticketRepo: transactionalTicketRepo
    });

    await expect(
      service.purchase('event-2', { quantity: 1 })
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(transactionalOrderRepo.create).not.toHaveBeenCalled();
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
  });

  it('creates orders and tickets on successful purchase', async () => {
    const transactionalEventRepo = createMockRepository();
    const transactionalOrderRepo = createMockRepository();
    const transactionalTicketRepo = createMockRepository();

    const event = {
      id: 'event-3',
      ticketCount: 5,
      ticketPrice: 25
    } as unknown as Event;

    const createdAt = new Date('2024-05-01T10:00:00Z');

    transactionalEventRepo.findOne.mockResolvedValue(event);
    transactionalTicketRepo.count.mockResolvedValue(0);
    transactionalOrderRepo.create.mockImplementation((value) => value as Order);
    transactionalOrderRepo.save.mockImplementation(async (value) => ({
      ...value,
      id: 'order-1',
      createdAt
    }));
    transactionalTicketRepo.create.mockImplementation((value) => value as Ticket);
    transactionalTicketRepo.save.mockImplementation(async (tickets: Ticket[]) =>
      tickets.map((ticket, index) => ({
        ...ticket,
        id: `ticket-${index + 1}`
      }))
    );

    mockTransaction({
      eventRepo: transactionalEventRepo,
      orderRepo: transactionalOrderRepo,
      ticketRepo: transactionalTicketRepo
    });

    jest.spyOn(service as any, 'generateOrderNumber').mockReturnValue('ORD-999');
    const ticketNumberSpy = jest.spyOn(service as any, 'generateTicketNumber');
    ticketNumberSpy
      .mockReturnValueOnce('T-AAA')
      .mockReturnValueOnce('T-BBB');
    const result = await service.purchase('event-3', { quantity: 2 });

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(transactionalEventRepo.findOne).toHaveBeenCalledWith({
      where: { id: 'event-3' },
      lock: { mode: 'pessimistic_write' }
    });
    expect(transactionalTicketRepo.count).toHaveBeenCalledWith({
      where: { event: { id: 'event-3' } }
    });
    expect(transactionalOrderRepo.save).toHaveBeenCalledTimes(1);
    expect(transactionalTicketRepo.save).toHaveBeenCalledTimes(1);
    expect(result.tickets).toHaveLength(2);
    expect(result.order.orderNumber).toBe('ORD-999');
    expect(result.tickets.map((ticket) => ticket.ticketNumber)).toEqual([
      'T-AAA',
      'T-BBB'
    ]);
  });


});
