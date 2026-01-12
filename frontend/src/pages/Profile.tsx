import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { fetchGigs } from '../services/gigs';
import { getGigBids, hireBid } from '../services/bids';
import { useAuth } from '../hooks/useAuth';
import { getAuthUserId } from '../utils/authToken';
import type { Bid, Gig } from '../types';

const Profile = () => {
  const { logout } = useAuth();
  const authUserId = getAuthUserId();
  const queryClient = useQueryClient();

  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const gigsQuery = useQuery<Gig[]>({
    queryKey: ['gigs', 'profile'],
    queryFn: () => fetchGigs(),
  });

  const myOpenGigs = useMemo(() => {
    const gigs = gigsQuery.data ?? [];
    if (!authUserId) return [];
    return gigs.filter((gig) => {
      const ownerId = typeof gig.ownerId === 'string' ? gig.ownerId : gig.ownerId._id;
      return ownerId === authUserId;
    });
  }, [authUserId, gigsQuery.data]);

  const gigBidsQuery = useQuery<Bid[]>({
    queryKey: ['bids', selectedGig?._id ?? ''],
    queryFn: () => getGigBids(selectedGig!._id),
    enabled: !!selectedGig && dialogOpen,
  });

  const hireBidMutation = useMutation({
    mutationFn: (bidId: string) => hireBid(bidId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['gigs'] }),
        queryClient.invalidateQueries({ queryKey: ['bids'] }),
      ]);
    },
  });

  const formatBudget = (value: number) => {
    try {
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
    } catch {
      return String(value);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your open jobs and their bids.
          </Typography>
        </Box>
        <Box>
          <Button variant="outlined" onClick={logout}>
            Logout
          </Button>
        </Box>
      </Stack>

      {gigsQuery.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {gigsQuery.isError && <Typography color="error">Failed to load your jobs.</Typography>}

      {!gigsQuery.isLoading && !gigsQuery.isError && myOpenGigs.length === 0 && (
        <Typography color="text.secondary">You have no open jobs right now.</Typography>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
        {myOpenGigs.map((gig) => (
          <Card
            key={gig._id}
            variant="outlined"
            tabIndex={0}
            role="button"
            sx={{
              cursor: 'pointer',
              borderRadius: 2,
              transition: 'transform 120ms ease, box-shadow 120ms ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 28px rgba(0,0,0,0.10)',
              },
            }}
            onClick={() => {
              setSelectedGig(gig);
              setDialogOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedGig(gig);
                setDialogOpen(true);
              }
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
                    {gig.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mt: 0.75,
                    }}
                  >
                    {gig.description ? gig.description : 'No description provided.'}
                  </Typography>
                </Box>

                <Stack spacing={1} alignItems="flex-end" sx={{ flexShrink: 0 }}>
                  <Chip label={`Budget: ${formatBudget(gig.budget)}`} variant="outlined" color="primary" />
                  <Chip label="Open" variant="outlined" color="success" />
                </Stack>
              </Stack>

              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="text.secondary">
                Click to manage bids
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle>{selectedGig?.title ?? 'Gig'}</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedGig && (
            <Box sx={{ mb: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                <Chip label={`Budget: ${formatBudget(selectedGig.budget)}`} color="primary" variant="outlined" />
                <Chip
                  label={selectedGig.status === 'open' ? 'Open' : 'Assigned'}
                  color={selectedGig.status === 'open' ? 'success' : 'default'}
                  variant="outlined"
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                {selectedGig.description ? selectedGig.description : 'No description provided.'}
              </Typography>
            </Box>
          )}

          {gigBidsQuery.isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {gigBidsQuery.isError && <Typography color="error">Failed to load bids.</Typography>}

          {!gigBidsQuery.isLoading && (gigBidsQuery.data?.length ?? 0) === 0 && (
            <Typography color="text.secondary">No bids yet.</Typography>
          )}

          <Stack spacing={2}>
            {(gigBidsQuery.data ?? []).map((bid) => {
              const freelancer = typeof bid.freelancerId === 'string' ? undefined : bid.freelancerId;
              const freelancerName = freelancer?.name ?? 'Unknown freelancer';
              const freelancerEmail = freelancer?.email;
              const amountLabel = bid.amount !== undefined ? formatBudget(bid.amount) : '—';

              const canHire = selectedGig?.status === 'open' && bid.status === 'pending' && !hireBidMutation.isPending;

              return (
                <Paper key={bid._id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                        {freelancerName}
                      </Typography>
                      {freelancerEmail && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {freelancerEmail}
                        </Typography>
                      )}
                    </Box>

                    <Chip
                      label={bid.status}
                      color={bid.status === 'hired' ? 'success' : bid.status === 'rejected' ? 'default' : 'warning'}
                      variant="outlined"
                    />
                    <Chip label={`Price: ${amountLabel}`} variant="outlined" />

                    {canHire && (
                      <Button
                        variant="contained"
                        onClick={() => {
                          hireBidMutation.mutate(bid._id, {
                            onSuccess: () => {
                              setSelectedGig((prev) => (prev ? { ...prev, status: 'assigned' } : prev));
                              gigBidsQuery.refetch();
                            },
                          });
                        }}
                      >
                        Hire
                      </Button>
                    )}
                  </Stack>

                  {!!(hireBidMutation.error as any)?.response?.data?.message && (
                    <Typography sx={{ mt: 1 }} color="error">
                      {(hireBidMutation.error as any)?.response?.data?.message}
                    </Typography>
                  )}

                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {bid.message}
                  </Typography>
                </Paper>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
