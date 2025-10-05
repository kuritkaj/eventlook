import { FC, useMemo } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import { Event } from '../api/events';

type EventCardProps = {
  event: Event;
  onPurchase: (event: Event) => void;
};

export const EventCard: FC<EventCardProps> = ({ event, onPurchase }) => {
  const soldOut = event.ticketsAvailable <= 0;
  const formattedDate = useMemo(
    () => dayjs(event.startDate).format('ddd, MMM D YYYY • h:mm A'),
    [event.startDate]
  );

  const availabilityLabel = soldOut
    ? 'Sold out'
    : `${event.ticketsAvailable} of ${event.ticketCount} tickets left`;

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6" component="h3">
            {event.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formattedDate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {event.place}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`$${event.ticketPrice.toFixed(2)} per ticket`}
              color="primary"
              variant="outlined"
            />
            <Typography variant="body2" color={soldOut ? 'error' : 'text.secondary'}>
              {availabilityLabel}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          disabled={soldOut}
          onClick={() => onPurchase(event)}
        >
          {soldOut ? 'Sold Out' : 'Purchase Tickets'}
        </Button>
      </CardActions>
    </Card>
  );
};
