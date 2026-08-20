import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock, User, QrCode, Copy, MessageCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { RatingInput } from '../components/RatingStars';
import { getMessages, sendMessage as sendMsgApi, getOrCreateConversation } from '../api/messages';
import { getSocket } from '../api/axios';

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pickupCode, setPickupCode] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const messagesEnd = useRef(null);

  const { data: request, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: async () => {
      const endpoint = user?.role === 'donor' ? '/requests/received' : '/requests/my';
      const { data } = await axios.get(endpoint);
      const all = data?.data?.requests || [];
      return all.find(r => r._id === id);
    },
  });

  const isDonor = user?.role === 'donor';
  const otherUserId = isDonor ? request?.requester?._id : request?.donor?._id;

  const { data: conversation, refetch: refetchConversation } = useQuery({
    queryKey: ['conversation-for-request', id],
    queryFn: async () => {
      if (!otherUserId) return null;
      try {
        const { data } = await axios.post('/messages/conversations', { recipientId: otherUserId, mealId: request?.meal?._id });
        return data;
      } catch {
        return null;
      }
    },
    enabled: false,
  });

  const { data: messages } = useQuery({
    queryKey: ['request-chat', conversation?._id || id],
    queryFn: async () => {
      if (!conversation?._id) return [];
      const { data } = await getMessages(conversation._id);
      return data?.messages || [];
    },
    enabled: !!conversation?._id,
    refetchInterval: false,
  });

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      let convId = conversation?._id;
      if (!convId) {
        const { data: newConv } = await axios.post('/messages/conversations', { recipientId: otherUserId, mealId: request?.meal?._id });
        convId = newConv._id;
      }
      return sendMsgApi({ conversationId: convId, content });
    },
    onSuccess: () => {
      setChatMessage('');
      refetchConversation();
      if (conversation?._id) {
        queryClient.invalidateQueries({ queryKey: ['request-chat', conversation._id] });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => toast.error('Failed to send message'),
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !conversation?._id) return;
    const handler = (payload) => {
      if (payload?.conversationId === conversation._id) {
        queryClient.invalidateQueries({ queryKey: ['request-chat'] });
      }
    };
    socket.on('receive-message', handler);
    return () => socket.off('receive-message', handler);
  }, [conversation?._id, queryClient]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback((e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    sendMutation.mutate(chatMessage.trim());
  }, [chatMessage, sendMutation]);

  const verifyPickupMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/requests/${id}/verify-pickup`, { pickupCode });
      return data;
    },
    onSuccess: () => { toast.success('Pickup verified!'); queryClient.invalidateQueries({ queryKey: ['request'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Invalid pickup code'),
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/requests/${id}/complete`);
      return data;
    },
    onSuccess: () => {
      toast.success('Request completed!');
      setShowRating(true);
      queryClient.invalidateQueries({ queryKey: ['request'] });
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      queryClient.invalidateQueries({ queryKey: ['receivedRequests'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  const rateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post('/feedback', { requestId: id, rating, comment });
      return data;
    },
    onSuccess: () => { toast.success('Thank you for your feedback!'); setShowRating(false); },
    onError: () => toast.error('Already rated or error occurred'),
  });

  const copyCode = () => {
    if (request?.pickupCode) {
      navigator.clipboard.writeText(request.pickupCode);
      toast.success('Code copied!');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!request) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Request not found</p></div>;

  const canVerify = isDonor && ['approved', 'pickup_scheduled', 'ready_for_pickup'].includes(request.status);
  const canComplete = isDonor && ['approved', 'pickup_scheduled', 'ready_for_pickup', 'collected'].includes(request.status);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/requests" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Requests
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{request.meal?.title || 'Meal'}</h1>
                <p className="text-gray-500 dark:text-gray-400">Request Details</p>
              </div>
              <StatusBadge status={request.status} type="request" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">{isDonor ? 'Requester' : 'Donor'}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{isDonor ? request.requester?.name : request.donor?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Requested</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(request.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {request.message && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-6">
                <p className="text-xs text-gray-400 mb-1">{isDonor ? 'Requester' : 'Donor'} message:</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{request.message}"</p>
              </div>
            )}

            {/* Pickup Code */}
            {request.pickupCode && (isDonor || ['approved', 'pickup_scheduled', 'ready_for_pickup'].includes(request.status)) && (
              <div className="p-6 bg-gradient-to-br from-green-50 to-orange-50 dark:from-green-900/20 dark:to-orange-900/20 rounded-2xl mb-6 text-center">
                <QrCode className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{isDonor ? 'Pickup Code' : 'Show this code at pickup'}</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-3xl font-mono font-bold text-gray-900 dark:text-white tracking-widest">{request.pickupCode}</p>
                  <button onClick={copyCode} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition"><Copy className="w-4 h-4 text-gray-400" /></button>
                </div>
              </div>
            )}

            {/* Donor Actions */}
            {isDonor && canVerify && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-4">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-3">Verify Pickup Code</p>
                <div className="flex gap-2">
                  <input value={pickupCode} onChange={(e) => setPickupCode(e.target.value)} placeholder="Enter 6-digit code"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none font-mono text-center text-lg tracking-widest" maxLength={6} />
                  <button onClick={() => verifyPickupMutation.mutate()} disabled={pickupCode.length !== 6 || verifyPickupMutation.isPending}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-xl transition">
                    Verify
                  </button>
                </div>
              </div>
            )}

            {isDonor && canComplete && (
              <button onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-xl mb-4 transition">
                Mark as Completed
              </button>
            )}
          </div>

          {/* Inline Chat */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Chat with {isDonor ? request.requester?.name : request.donor?.name}</h3>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
              {(messages || []).length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No messages yet. Say hello!
                </div>
              ) : (
                (messages || []).map((msg) => {
                  const isMine = msg.sender?._id === user?._id;
                  return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        isMine
                          ? 'bg-green-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-md'
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-green-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEnd} />
            </div>

            <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!chatMessage.trim() || sendMutation.isPending}
                className="p-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Rating Modal */}
          <AnimatePresence>
            {showRating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Rate Your Experience</h3>
                  <div className="flex justify-center mb-4"><RatingInput value={rating} onChange={setRating} /></div>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Leave a comment (optional)" rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none mb-4" />
                  <div className="flex gap-3">
                    <button onClick={() => setShowRating(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300">Skip</button>
                    <button onClick={() => rateMutation.mutate()} disabled={rateMutation.isPending}
                      className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-50">Submit</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
