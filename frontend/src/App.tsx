import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  Grid,
  Stack,
  Toolbar,
  Typography
} from '@mui/material';
import { Event, fetchEvents, purchaseTickets, PurchaseResponse } from './api/events';
import { EventCard } from './components/EventCard';
import { PurchaseDialog } from './components/PurchaseDialog';

export default function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [purchaseSubmitting, setPurchaseSubmitting] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [lastPurchase, setLastPurchase] = useState<PurchaseResponse | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
      setLoadError('We were unable to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleOpenDialog = (event: Event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
    setPurchaseError(null);
  };

  const handleCloseDialog = () => {
    if (purchaseSubmitting) {
      return;
    }
    setDialogOpen(false);
    setSelectedEvent(null);
    setPurchaseError(null);
  };

  const handlePurchase = async (quantity: number) => {
    if (!selectedEvent) {
      return;
    }

    setPurchaseSubmitting(true);
    setPurchaseError(null);

    try {
      const response = await purchaseTickets(selectedEvent.id, quantity);
      setLastPurchase(response);
      setDialogOpen(false);
      await loadEvents();
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        const payload = error.response?.data as
          | { message?: string | string[] }
          | undefined;
        const message = payload?.message;
        if (Array.isArray(message)) {
          setPurchaseError(message.join(', '));
        } else if (typeof message === 'string') {
          setPurchaseError(message);
        } else {
          setPurchaseError('Purchase failed. Please try again.');
        }
      } else {
        setPurchaseError('Purchase failed. Please try again.');
      }
    } finally {
      setPurchaseSubmitting(false);
    }
  };

  const headerSubTitle = useMemo(() => {
    if (loading) {
      return 'Fetching the latest lineup...';
    }

    if (events.length === 0) {
      return 'No events yet. Check back soon!';
    }

    return `${events.length} events available`;
  }, [events.length, loading]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fb' }}>
      <CssBaseline />
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Eventlook
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Discover upcoming experiences
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {headerSubTitle}
            </Typography>
          </Stack>

          {loading && (
            <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
              <CircularProgress color="primary" />
              <Typography variant="body1">Loading events...</Typography>
            </Stack>
          )}

          {loadError && !loading && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={loadEvents}>
                  Retry
                </Button>
              }
            >
              {loadError}
            </Alert>
          )}

          {!loading && !loadError && (
            <Grid container spacing={3}>
              {events.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <EventCard event={event} onPurchase={handleOpenDialog} />
                </Grid>
              ))}
            </Grid>
          )}

          {lastPurchase && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="success">
                <Stack spacing={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Purchase successful!
                  </Typography>
                  <Typography variant="body2">
                    Order {lastPurchase.order.orderNumber} •{' '}
                    {new Date(lastPurchase.order.createdAt).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    Tickets:
                    {' '}
                    {lastPurchase.tickets
                      .map((ticket) => ticket.ticketNumber)
                      .join(', ')}
                  </Typography>
                </Stack>
              </Alert>
            </Box>
          )}
        </Stack>
      </Container>

      <PurchaseDialog
        open={dialogOpen}
        event={selectedEvent}
        submitting={purchaseSubmitting}
        error={purchaseError}
        onClose={handleCloseDialog}
        onSubmit={handlePurchase}
      />
    </Box>
  );
}
