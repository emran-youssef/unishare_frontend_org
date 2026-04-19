import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';
import type { ChatMessageDto, ConversationDto, SendMessageRequest } from '../../types/api.types';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Chat', 'Conversation'],
  endpoints: (builder) => ({
    // Get all conversations for current user
    getConversations: builder.query<ConversationDto[], void>({
      query: () => '/chat/conversations',
      providesTags: ['Conversation'],
    }),

    // Get messages with a specific user
    getMessages: builder.query<ChatMessageDto[], number>({
      query: (userId) => `/chat/${userId}`,
      providesTags: (_result, _err, userId) => [{ type: 'Chat', id: userId }],
    }),

    // Send a message to a specific user
    sendMessage: builder.mutation<ChatMessageDto, { userId: number; body: SendMessageRequest }>({
      query: ({ userId, body }) => ({
        url: `/chat/${userId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _err, { userId }) => [
        { type: 'Chat', id: userId },
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
