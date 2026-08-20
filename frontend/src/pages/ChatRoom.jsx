import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { getMessages, sendMessage as sendMsgApi, getOrCreateConversation } from '../api/messages';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../api/axios';

export default function ChatRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEnd = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      const { data } = await getMessages(id);
      return data?.messages || data?.data?.messages || data || [];
    },
  });

  const participantQuery = useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      const { data } = await getOrCreateConversation({ recipientId: id });
      return data;
    },
  });

  const conversation = participantQuery.data;

  const otherParticipant = conversation?.participants?.find(p => p._id !== user?._id);

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      const { data } = await sendMsgApi({ conversationId: id, content });
      return data;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleNewMessage = useCallback((payload) => {
    if (payload?.conversationId === id && payload?.message?._id) {
      const currentMessages = queryClient.getQueryData(['messages', id]) || [];
      const alreadyExists = currentMessages.some(m => m._id === payload.message._id);
      if (!alreadyExists) {
        queryClient.setQueryData(['messages', id], (old) => {
          const existing = old || [];
          if (existing.some(m => m._id === payload.message._id)) return existing;
          return [...existing, payload.message];
        });
      }
    }
  }, [id, queryClient]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('receive-message', handleNewMessage);

    return () => {
      socket.off('receive-message', handleNewMessage);
    };
  }, [user?._id, handleNewMessage]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate(message.trim());
  };

  const participantName = otherParticipant?.name || 'Community Member';
  const participantAvatar = otherParticipant?.avatar;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Link to="/chat" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        {participantAvatar ? (
          <img src={participantAvatar} alt={participantName} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-orange-400 flex items-center justify-center text-white font-bold">
            {participantName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">{participantName}</h2>
          <p className="text-xs text-gray-400">Conversation</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        ) : (messages || []).length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">No messages yet. Say hello!</div>
        ) : (
          (messages || []).map((msg) => {
            const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
            return (
              <motion.div key={msg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-green-600 text-white rounded-br-md' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow-sm'}`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-green-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEnd} />
      </div>

      <form onSubmit={handleSend} className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex gap-3 flex-shrink-0">
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none text-sm" />
        <button type="submit" disabled={!message.trim() || sendMutation.isPending}
          className="p-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl transition">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
