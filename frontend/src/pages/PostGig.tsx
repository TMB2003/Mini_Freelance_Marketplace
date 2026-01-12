import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';

import { createGig } from '../services/gigs';
import { fieldErrorsFromZod, postGigSchema } from '../schemas';

const PostGig = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      createGig({
        title: title.trim(),
        description: description.trim() ? description.trim() : undefined,
        budget: Number(budget),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['gigs'] });
      navigate('/gigs');
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = postGigSchema.safeParse({
      title,
      description,
      budget,
    });

    if (!result.success) {
      setFieldErrors(fieldErrorsFromZod(result.error));
      return;
    }

    setFieldErrors({});
    mutation.mutate();
  };

  const errorMessage =
    (mutation.error as any)?.response?.data?.message ||
    (mutation.error as any)?.message ||
    undefined;

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Post a Job
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Share the details of your project and start receiving bids.
          </Typography>

          {errorMessage && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
          )}

          <Box component="form" onSubmit={submit}>
            <TextField
              fullWidth
              required
              label="Title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: '' }));
              }}
              sx={{ mb: 2 }}
              error={!!fieldErrors.title}
              helperText={fieldErrors.title || ' '}
            />

            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: '' }));
              }}
              multiline
              minRows={4}
              sx={{ mb: 2 }}
              error={!!fieldErrors.description}
              helperText={fieldErrors.description || ' '}
            />

            <TextField
              fullWidth
              required
              label="Budget"
              value={budget}
              onChange={(e) => {
                setBudget(e.target.value);
                if (fieldErrors.budget) setFieldErrors((prev) => ({ ...prev, budget: '' }));
              }}
              type="number"
              inputProps={{ min: 1 }}
              placeholder="e.g. 200"
              error={!!fieldErrors.budget}
              helperText={fieldErrors.budget || ' '}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={mutation.isPending || !title.trim() || !budget.trim()}
              >
                {mutation.isPending ? 'Posting...' : 'Post Job'}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/gigs')}>
                Cancel
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PostGig;
