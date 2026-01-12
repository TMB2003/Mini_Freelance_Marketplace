import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Avatar,
  Box,
  Chip,
  Divider,
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
import type { Gig } from '../types';

const Gigs = () => {
  const [search, setSearch] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'budget_low' | 'budget_high'>('newest');

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
                  sx={{
                    transition: 'transform 120ms ease, box-shadow 120ms ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    },
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
    </Box>
  );
};

export default Gigs;
