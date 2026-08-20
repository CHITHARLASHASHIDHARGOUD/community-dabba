import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, Check, CheckCheck, MessageCircle, ClipboardList, Package, Star, Shield, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';

const iconMap = {
  new_request: ClipboardList,
  request_approved: Check,
  request_rejected: BellOff,
  pickup_scheduled: Package,
  pickup_reminder: Bell,
  pickup_completed: CheckCheck,
  new_message: MessageCircle,
  verification_approved: Shield,
  system: Info,
};

const colorMap = {
  new_request: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  request_approved: 'bg-green-100 dark:bg-green-900/30 text-green-600',
  request_rejected: 'bg-red-100 dark:bg-red-900/30 text-red-600',
  pickup_scheduled: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  pickup_reminder: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
  pickup_completed: 'bg-green-100 dark:bg-green-900/30 text-green-600',
  new_message: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  verification_approved: 'bg-green-100 dark:bg-green-900/30 text-green-600',
  system: 'bg-gray-100 dark:bg-gray-700 text-gray-600',
};

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await axios.get('/notifications');
      return data?.notifications || [];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id) => { await axios.patch(`/notifications/${id}/read`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: async () => { await axios.patch('/notifications/read-all'); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All marked as read'); },
  });

  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              <p className="text-gray-500 dark:text-gray-400">{unreadCount} unread</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}
                className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition font-medium">
                Mark all as read
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-20 animate-pulse" />)}
            </div>
          ) : (notifications || []).length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
              <BellOff className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No notifications</h3>
              <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(notifications || []).map((notif) => {
                const Icon = iconMap[notif.type] || Bell;
                const colorClass = colorMap[notif.type] || colorMap.system;
                return (
                  <motion.div key={notif._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    onClick={() => !notif.isRead && markReadMutation.mutate(notif._id)}
                    className={`bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition hover:shadow-md ${!notif.isRead ? 'ring-2 ring-green-500/20' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{notif.title}</p>
                      <p className="text-xs text-gray-400 truncate">{notif.message}</p>
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {!notif.isRead && <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" />}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
