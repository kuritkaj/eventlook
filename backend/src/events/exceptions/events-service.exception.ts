export class EventsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class EventNotFoundError extends EventsServiceError {
  constructor(eventId: string) {
    super(`Event with id ${eventId} not found`);
  }
}

export class InvalidPurchaseQuantityError extends EventsServiceError {
  constructor() {
    super('Purchase verification failed');
  }
}

export class EventSoldOutError extends EventsServiceError {
  constructor() {
    super('Event is sold out');
  }
}

export class NotEnoughTicketsAvailableError extends EventsServiceError {
  constructor() {
    super('Not enough tickets available');
  }
}
