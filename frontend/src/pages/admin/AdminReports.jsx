import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, AlertTriangle, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../../api/axios';

const STATUS_COLORS = {
  open: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  investigating: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  resolved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  dismissed: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
};

const REASON_LABELS = {
  fake_meal: 'Fake Meal',
  expired_food: 'Expired Food',
  wrong_location: 'Wrong Location',
  inappropriate: 'Inappropriate Content',
  suspicious: 'Suspicious User',
  abuse: 'Abuse',
  other: 'Other',
};

export default function AdminReports() {
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin-reports', statusFilter],
    queryFn: async () => {
      const { data } = await axios.get('/reports/admin', { params: { status: statusFilter } });
      return data?.reports || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }) => {
      const { data } = await axios.patch(`/reports/admin/${id}`, { status, adminNotes });
      return data;
    },
    onSuccess: () => { toast.success('Report updated'); queryClient.invalidateQueries({ queryKey: ['admin-reports'] }); },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Reports</h1>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['', 'open', 'investigating', 'resolved', 'dismissed'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${statusFilter === s ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-24 animate-pulse" />)}
            </div>
          ) : (reports || []).length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No reports found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(reports || []).map((report) => (
                <motion.div key={report._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[report.status] || STATUS_COLORS.open}`}>
                          {report.status}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {REASON_LABELS[report.reason] || report.reason}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Reported by: <span className="font-medium text-gray-700 dark:text-gray-300">{report.reporter?.name || 'Unknown'}</span>
                      </p>
                      {report.description && <p className="text-sm text-gray-500 dark:text-gray-400 italic">"{report.description}"</p>}
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {report.status === 'open' && (
                        <>
                          <button onClick={() => updateStatusMutation.mutate({ id: report._id, status: 'investigating' })}
                            className="px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 text-sm rounded-lg hover:bg-yellow-100 transition">
                            Investigate
                          </button>
                          <button onClick={() => updateStatusMutation.mutate({ id: report._id, status: 'resolved' })}
                            className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 text-sm rounded-lg hover:bg-green-100 transition">
                            Resolve
                          </button>
                          <button onClick={() => updateStatusMutation.mutate({ id: report._id, status: 'dismissed' })}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm rounded-lg hover:bg-gray-200 transition">
                            Dismiss
                          </button>
                        </>
                      )}
                      {report.status === 'investigating' && (
                        <>
                          <button onClick={() => updateStatusMutation.mutate({ id: report._id, status: 'resolved' })}
                            className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 text-sm rounded-lg hover:bg-green-100 transition">
                            Resolve
                          </button>
                          <button onClick={() => updateStatusMutation.mutate({ id: report._id, status: 'dismissed' })}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm rounded-lg hover:bg-gray-200 transition">
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
