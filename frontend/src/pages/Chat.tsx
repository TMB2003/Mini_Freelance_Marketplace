import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { fetchChatGigs, fetchGigMessages } from '../services/chat';
import { connectSocket } from '../services/socket';
import { getAuthUserId } from '../utils/authToken';
import type { ChatMessage, Gig } from '../types';

const Chat = () => {
  const authUserId = getAuthUserId();

  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [draft, setDraft] = useState('');
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const gigsQuery = useQuery<Gig[]>({
    queryKey: ['chat', 'gigs'],
    queryFn: () => fetchChatGigs(),
    enabled: !!authUserId,
  });

  const messagesQuery = useQuery<ChatMessage[]>({
    queryKey: ['chat', 'messages', selectedGig?._id ?? ''],
    queryFn: () => fetchGigMessages(selectedGig!._id),
    enabled: !!authUserId && !!selectedGig,
  });

  const mergedMessages = useMemo(() => {
    const base = messagesQuery.data ?? [];
    if (!liveMessages.length) return base;

    const seen = new Set(base.map((m) => m._id));
    const combined = [...base];
    for (const msg of liveMessages) {
      if (!seen.has(msg._id)) combined.push(msg);
    }

    combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return combined;
  }, [liveMessages, messagesQuery.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mergedMessages.length]);

  useEffect(() => {
    if (!selectedGig || !authUserId) return;

    const socket = connectSocket();
    if (!socket) return;

    socket.emit('chat:join', { gigId: selectedGig._id });

    const onMessage = (msg: any) => {
      if (!msg || msg.gigId !== selectedGig._id) return;
      setLiveMessages((prev) => [...prev, msg]);
    };

    socket.on('chat:message', onMessage);

    return () => {
      socket.off('chat:message', onMessage);
    };
  }, [authUserId, selectedGig]);

  const hirerLabel = (gig: Gig) => {
    const owner = typeof gig.ownerId === 'string' ? undefined : gig.ownerId;
    const name = owner?.name;
    return name ? `${name}` : 'Client';
  };

  const send = () => {
    if (!selectedGig || !authUserId) return;
    const text = draft.trim();
    if (!text) return;

    const socket = connectSocket();
    if (!socket) return;

    socket.emit('chat:send', { gigId: selectedGig._id, text });
    setDraft('');
  };

  return (
    <Box sx={{ height: { xs: 'calc(100vh - 120px)', md: 'calc(100vh - 128px)' } }}>
      {/* <Typography variant="h4" component="h1" gutterBottom>
        Chat
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Chat with the hired freelancer/client for assigned projects.
      </Typography> */}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '340px 1fr' },
          gap: 2,
          alignItems: 'start',
          height: '100%'
        }}
      >
        <Paper variant="outlined" sx={{ p: 1.5, height: '100%', overflow: 'auto' }}>
          <Typography variant="subtitle1" sx={{ px: 1, pb: 1, fontWeight: 700 }}>
            Conversations
          </Typography>

          {gigsQuery.isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {gigsQuery.isError && <Typography color="error">Failed to load chats.</Typography>}

          {!gigsQuery.isLoading && (gigsQuery.data?.length ?? 0) === 0 && (
            <Typography color="text.secondary" sx={{ px: 1 }}>
              No assigned gigs available for chat.
            </Typography>
          )}

          <List disablePadding>
            {(gigsQuery.data ?? []).map((gig) => {
              const selected = selectedGig?._id === gig._id;
              return (
                <ListItemButton
                  key={gig._id}
                  selected={selected}
                  onClick={() => {
                    setSelectedGig(gig);
                    setLiveMessages([]);
                  }}
                >
                  <ListItemText
                    secondary={gig.title}
                    primary={hirerLabel(gig)}
                    primaryTypographyProps={{ noWrap: true, fontWeight: 600 }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" noWrap>
              {selectedGig ? hirerLabel(selectedGig) : 'Select a conversation'}
            </Typography>
            {selectedGig && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {selectedGig.title}
              </Typography>
            )}
          </Box>
          <Divider />

          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {!selectedGig && <Typography color="text.secondary">Choose a gig to start chatting.</Typography>}

            {selectedGig && messagesQuery.isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            )}

            {selectedGig && messagesQuery.isError && <Typography color="error">Failed to load messages.</Typography>}

            <Stack spacing={1.25}>
              {mergedMessages.map((msg) => {
                const senderId = typeof msg.senderId === 'string' ? msg.senderId : msg.senderId._id;
                const mine = !!authUserId && senderId === authUserId;
                const senderName = typeof msg.senderId === 'string' ? 'User' : msg.senderId.name;

                return (
                  <Box
                    key={msg._id}
                    sx={{
                      display: 'flex',
                      justifyContent: mine ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '75%',
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: mine ? 'primary.main' : 'grey.100',
                        color: mine ? 'primary.contrastText' : 'text.primary',
                      }}
                    >
                      {!mine && (
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {senderName}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {msg.text}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}

              <div ref={bottomRef} />
            </Stack>
          </Box>

          <Divider />
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                placeholder={selectedGig ? 'Write a message…' : 'Select a conversation first'}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!selectedGig}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <Button variant="contained" disabled={!selectedGig || !draft.trim()} onClick={send}>
                Send
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Chat;
