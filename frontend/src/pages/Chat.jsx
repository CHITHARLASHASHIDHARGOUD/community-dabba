import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Search, Clock } from 'lucide-react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await axios.get('/messages/conversations');
      return (data || []).filter(c => c.lastMessage);
    },
  });

  const filtered = (conversations || []).filter(c => {
    if (!search) return true;
    const other = c.participants?.find(p => p._id !== user?._id);
    return other?.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Messages</h1>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-20 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No conversations yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Start a conversation from a request</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((conv) => {
                const other = conv.participants?.find(p => p._id !== user?._id);
                return (
                  <Link key={conv._id} to={`/chat/${conv._id}`}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition block">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {other?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{other?.name || 'Unknown'}</h3>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conv.lastMessage?.content || 'Start a conversation'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
