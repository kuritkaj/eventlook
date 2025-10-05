import { FC, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import { Event } from '../api/events';

type PurchaseDialogProps = {
  open: boolean;
  event: Event | null;
  submitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (quantity: number) => void;
};

export const PurchaseDialog: FC<PurchaseDialogProps> = ({
  open,
  event,
  submitting,
  error,
  onClose,
  onSubmit
}) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [event?.id, open]);

  const maxQuantity = event?.ticketsAvailable ?? 1;
  const isInvalidQuantity = quantity <= 0 || quantity > maxQuantity;

  const totalPrice = useMemo(() => {
    if (!event) {
      return 0;
    }
    return event.ticketPrice * quantity;
  }, [event, quantity]);

  const handleSubmit = () => {
    if (event && !isInvalidQuantity) {
      onSubmit(quantity);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Purchase tickets</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {event && (
            <Stack spacing={0.5}>
              <Typography variant="h6">{event.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {dayjs(event.startDate).format('dddd, MMMM D, YYYY • h:mm A')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {event.place}
              </Typography>
              <Typography variant="subtitle2">
                {event.ticketsAvailable} tickets remaining
              </Typography>
            </Stack>
          )}

          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            inputProps={{ min: 1, max: maxQuantity }}
            disabled={!event}
            error={isInvalidQuantity}
            helperText={
              isInvalidQuantity
                ? `Please enter a value between 1 and ${maxQuantity}`
                : undefined
            }
          />

          <Typography variant="subtitle1">
            Total: ${totalPrice.toFixed(2)}
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!event || submitting || isInvalidQuantity}
        >
          {submitting ? 'Processing…' : 'Confirm purchase'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
