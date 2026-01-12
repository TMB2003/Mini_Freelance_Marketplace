import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Typography,
  TextField,
  Card,
  CardContent,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { fetchGigs } from '../services/gigs';
import { createBid, getGigBids, hireBid } from '../services/bids';
import { getAuthUserId } from '../utils/authToken';
import { createBidSchema, fieldErrorsFromZod } from '../schemas';
import type { Bid, Gig } from '../types';

const Gigs = () => {
  const [search, setSearch] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'budget_low' | 'budget_high'>('newest');

  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [bidMessage, setBidMessage] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [bidFieldErrors, setBidFieldErrors] = useState<Record<string, string>>({});
  const [bidSuccessMessage, setBidSuccessMessage] = useState<string | null>(null);

  const minBudgetNumber = minBudget.trim() ? Number(minBudget) : undefined;
  const maxBudgetNumber = maxBudget.trim() ? Number(maxBudget) : undefined;
  const searchValue = search.trim() ? search.trim() : undefined;

  const { data, isLoading, isError } = useQuery<Gig[]>({
    queryKey: ['gigs', searchValue ?? '', minBudgetNumber ?? null, maxBudgetNumber ?? null],
    queryFn: () =>
      fetchGigs({
        search: searchValue,
        minBudget: minBudgetNumber,
        maxBudget: maxBudgetNumber,
      }),
  });

  const authUserId = getAuthUserId();

  const queryClient = useQueryClient();

  const isGigOwner = useMemo(() => {
    if (!selectedGig || !authUserId) return false;
    const ownerId = typeof selectedGig.ownerId === 'string' ? selectedGig.ownerId : selectedGig.ownerId._id;
    return ownerId === authUserId;
  }, [authUserId, selectedGig]);

  const gigBidsQuery = useQuery<Bid[]>({
    queryKey: ['bids', selectedGig?._id ?? ''],
    queryFn: () => getGigBids(selectedGig!._id),
    enabled: !!selectedGig && dialogOpen && isGigOwner,
  });

  const createBidMutation = useMutation({
    mutationFn: (payload: { gigId: string; message: string; amount?: number }) => createBid(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['gigs'] });
    },
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

  const sortedGigs = useMemo(() => {
    const rows = [...(data ?? [])];
    if (sortBy === 'budget_low') {
      rows.sort((a, b) => a.budget - b.budget);
    }
    if (sortBy === 'budget_high') {
      rows.sort((a, b) => b.budget - a.budget);
    }
    if (sortBy === 'newest') {
      rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return rows;
  }, [data, sortBy]);

  const formatBudget = (value: number) => {
    try {
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
    } catch {
      return String(value);
    }
  };

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          background:
            'linear-gradient(135deg, rgba(25,118,210,0.10) 0%, rgba(156,39,176,0.06) 100%)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Browse Gigs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover jobs and find the right project for you.
        </Typography>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
            Filters
          </Typography>
          <TextField
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            label="Search by title"
            placeholder="e.g. Logo design"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Budget range
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <TextField
              label="Min"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              type="number"
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Max"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              type="number"
              inputProps={{ min: 0 }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <FormControl fullWidth>
            <InputLabel id="sort-by-label">Sort</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              label="Sort"
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="budget_low">Budget: Low to High</MenuItem>
              <MenuItem value="budget_high">Budget: High to Low</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        <Box>
          {isLoading && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
                <CircularProgress />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
                <Skeleton variant="rounded" height={150} />
                <Skeleton variant="rounded" height={150} />
                <Skeleton variant="rounded" height={150} />
                <Skeleton variant="rounded" height={150} />
              </Box>
            </Box>
          )}

          {isError && (
            <Typography color="error">Failed to load gigs. Please try again.</Typography>
          )}

          {!isLoading && !isError && (sortedGigs.length ?? 0) === 0 && (
            <Typography color="text.secondary">No gigs found.</Typography>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: 2,
            }}
          >
            {sortedGigs.map((gig) => {
              const owner = typeof gig.ownerId === 'string' ? undefined : gig.ownerId;
              const ownerName = owner?.name ?? 'Unknown owner';
              const ownerEmail = owner?.email;
              const ownerInitials = owner?.name
                ? owner.name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase())
                    .join('')
                : 'U';

              return (
                <Card
                  key={gig._id}
                  variant="outlined"
                  tabIndex={0}
                  role="button"
                  sx={{
                    transition: 'transform 120ms ease, box-shadow 120ms ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setSelectedGig(gig);
                    setDialogOpen(true);
                    setBidMessage('');
                    setBidAmount('');
                    setBidFieldErrors({});
                    setBidSuccessMessage(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedGig(gig);
                      setDialogOpen(true);
                      setBidMessage('');
                      setBidAmount('');
                      setBidFieldErrors({});
                      setBidSuccessMessage(null);
                    }
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 2,
                      }}
                    >
                      <Typography variant="h6" sx={{ minWidth: 0 }} noWrap>
                        {gig.title}
                      </Typography>
                      <Chip label={`Budget: ${formatBudget(gig.budget)}`} color="primary" variant="outlined" />
                    </Box>

                    <Box sx={{ mt: 1.25 }}>
                      {gig.description ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        >
                          {gig.description}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No description provided.
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ mt: 1.5 }}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32 }}>{ownerInitials}</Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" noWrap>
                            {ownerName}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
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

          {!isGigOwner && (
            <Box sx={{ maxWidth: 720 }}>
              {!authUserId && (
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Login required to place a bid.
                </Typography>
              )}

              {selectedGig?.status !== 'open' && (
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  This gig is not accepting bids.
                </Typography>
              )}

              {bidSuccessMessage && (
                <Typography sx={{ mb: 2 }} color="success.main">
                  {bidSuccessMessage}
                </Typography>
              )}

              {!!(createBidMutation.error as any)?.response?.data?.message && (
                <Typography sx={{ mb: 2 }} color="error">
                  {(createBidMutation.error as any)?.response?.data?.message}
                </Typography>
              )}

              <TextField
                fullWidth
                label="Message"
                value={bidMessage}
                onChange={(e) => {
                  setBidMessage(e.target.value);
                  if (bidFieldErrors.message) setBidFieldErrors((prev) => ({ ...prev, message: '' }));
                }}
                multiline
                minRows={4}
                sx={{ mb: 2 }}
                error={!!bidFieldErrors.message}
                helperText={bidFieldErrors.message || ' '}
                disabled={!authUserId || selectedGig?.status !== 'open'}
              />

              <TextField
                fullWidth
                label="Price (optional)"
                value={bidAmount}
                onChange={(e) => {
                  setBidAmount(e.target.value);
                  if (bidFieldErrors.amount) setBidFieldErrors((prev) => ({ ...prev, amount: '' }));
                }}
                type="number"
                inputProps={{ min: 0 }}
                sx={{ mb: 1 }}
                error={!!bidFieldErrors.amount}
                helperText={bidFieldErrors.amount || ' '}
                disabled={!authUserId || selectedGig?.status !== 'open'}
              />

              <Button
                variant="contained"
                disabled={
                  !authUserId ||
                  selectedGig?.status !== 'open' ||
                  createBidMutation.isPending ||
                  !bidMessage.trim() ||
                  !selectedGig
                }
                onClick={() => {
                  if (!selectedGig) return;

                  const result = createBidSchema.safeParse({
                    gigId: selectedGig._id,
                    message: bidMessage,
                    amount: bidAmount.trim() ? bidAmount : undefined,
                  });

                  if (!result.success) {
                    setBidFieldErrors(fieldErrorsFromZod(result.error));
                    return;
                  }

                  setBidFieldErrors({});
                  setBidSuccessMessage(null);

                  createBidMutation.mutate(
                    {
                      gigId: selectedGig._id,
                      message: bidMessage.trim(),
                      amount: bidAmount.trim() ? Number(bidAmount) : undefined,
                    },
                    {
                      onSuccess: () => {
                        setBidSuccessMessage('Bid submitted successfully.');
                        setBidMessage('');
                        setBidAmount('');
                      },
                    },
                  );
                }}
              >
                {createBidMutation.isPending ? 'Submitting...' : 'Submit Bid'}
              </Button>
            </Box>
          )}

          {isGigOwner && (
            <Box>
              {gigBidsQuery.isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              )}

              {gigBidsQuery.isError && (
                <Typography color="error">Failed to load bids.</Typography>
              )}

              {!gigBidsQuery.isLoading && (gigBidsQuery.data?.length ?? 0) === 0 && (
                <Typography color="text.secondary">No bids yet.</Typography>
              )}

              <Stack spacing={2}>
                {(gigBidsQuery.data ?? []).map((bid) => {
                  const freelancer = typeof bid.freelancerId === 'string' ? undefined : bid.freelancerId;
                  const freelancerName = freelancer?.name ?? 'Unknown freelancer';
                  const freelancerEmail = freelancer?.email;
                  const amountLabel = bid.amount !== undefined ? formatBudget(bid.amount) : '—';

                  const canHire =
                    isGigOwner &&
                    selectedGig?.status === 'open' &&
                    bid.status === 'pending' &&
                    !hireBidMutation.isPending;

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
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogOpen(false);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Gigs;
