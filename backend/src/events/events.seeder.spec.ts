import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventsSeederService } from './events.seeder';
import { Event } from './entities/event.entity';

const createMockRepository = () => ({
  count: jest.fn(),
  create: jest.fn(),
  save: jest.fn()
});

describe('EventsSeederService', () => {
  let service: EventsSeederService;
  let eventsRepository: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    eventsRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsSeederService,
        {
          provide: getRepositoryToken(Event),
          useValue: eventsRepository
        }
      ]
    }).compile();

    service = module.get<EventsSeederService>(EventsSeederService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('skips when events already exist', async () => {
    eventsRepository.count.mockResolvedValue(3);

    await service.seedInitialEvents();

    expect(eventsRepository.save).not.toHaveBeenCalled();
  });

  it('creates default events', async () => {
    const createdEntities = [] as Event[];
    eventsRepository.count.mockResolvedValue(0);
    eventsRepository.create.mockImplementation((entity) => entity as Event);
    eventsRepository.save.mockImplementation(async (events) => {
      createdEntities.push(...events);
      return events;
    });

    await service.seedInitialEvents();

    expect(eventsRepository.create).toHaveBeenCalledTimes(3);
    expect(eventsRepository.save).toHaveBeenCalledWith(expect.any(Array));
    expect(createdEntities).toHaveLength(3);
  });
});
