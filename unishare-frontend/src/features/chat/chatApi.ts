import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';
import type { ChatMessageDto, ListingDto, SendMessageRequest } from '../../types/api.types';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Chat', 'Conversation'],
  endpoints: (builder) => ({
    // Get all conversations — backend returns List<ListingDto>
    // Each item is a listing where the user has an active conversation
    getConversations: builder.query<ListingDto[], void>({
      query: () => '/chat/conversations',
      providesTags: ['Conversation'],
    }),

    // Get messages for a specific listing conversation
    // userId = the OTHER person in the conversation (not the caller)
    getMessages: builder.query<ChatMessageDto[], { listingId: number; userId: number }>({
      query: ({ listingId, userId }) => `/chat/${listingId}/${userId}`,
      providesTags: (_result, _err, { listingId, userId }) => [
        { type: 'Chat', id: `${listingId}-${userId}` },
      ],
    }),

    // Send a message in a listing conversation
    sendMessage: builder.mutation<
      ChatMessageDto,
      { listingId: number; receiverId: number; body: SendMessageRequest }
    >({
      query: ({ listingId, receiverId, body }) => ({
        url: `/chat/${listingId}/${receiverId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _err, { listingId, receiverId }) => [
        { type: 'Chat', id: `${listingId}-${receiverId}` },
        'Conversation',
      ],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatApi;
