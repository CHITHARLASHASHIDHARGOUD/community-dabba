import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, XCircle, Package, Filter, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const REQUEST_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'pickup_scheduled', label: 'Pickup' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

export default function Requests() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';
  const isDonor = user?.role === 'donor';
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['requests', isDonor ? 'received' : 'my', activeTab],
    queryFn: async () => {
      const endpoint = isDonor ? '/requests/received' : '/requests/my';
      const { data } = await axios.get(endpoint);
      return data?.data?.requests || [];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await axios.patch(`/requests/${id}/status`, { status: 'approved' });
      return data;
    },
    onSuccess: () => {
      toast.success('Request approved!');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      queryClient.invalidateQueries({ queryKey: ['receivedRequests'] });
    },
    onError: () => toast.error('Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await axios.patch(`/requests/${id}/status`, { status: 'rejected' });
      return data;
    },
    onSuccess: () => {
      toast.success('Request rejected');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      queryClient.invalidateQueries({ queryKey: ['receivedRequests'] });
    },
    onError: () => toast.error('Failed to reject'),
  });

  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await axios.patch(`/requests/${id}/cancel`);
      return data;
    },
    onSuccess: () => {
      toast.success('Request cancelled');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      queryClient.invalidateQueries({ queryKey: ['receivedRequests'] });
    },
    onError: () => toast.error('Failed to cancel'),
  });

  const filtered = activeTab === 'all' ? (requests || []) : (requests || []).filter(r => r.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isDonor ? 'Received Requests' : 'My Requests'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {isDonor ? 'Manage incoming food requests' : 'Track your food requests'}
          </p>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {REQUEST_TABS.map(tab => (
              <button key={tab.value} onClick={() => setSearchParams({ tab: tab.value })}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${activeTab === tab.value ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Request List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-32 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No requests found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {isDonor ? 'Incoming requests will appear here' : 'Browse meals and request some food'}
              </p>
              {!isDonor && (
                <Link to="/explore" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                  Browse Food <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((req) => (
                <motion.div key={req._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{req.meal?.title || 'Meal'}</h3>
                        <StatusBadge status={req.status} type="request" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {isDonor ? `From: ${req.requester?.name || 'Unknown'}` : `Donor: ${req.donor?.name || 'Unknown'}`}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(req.createdAt).toLocaleDateString()}</span>
                        {req.pickupCode && <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Code: {req.pickupCode}</span>}
                      </div>
                      {req.message && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">"{req.message}"</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isDonor && req.status === 'pending' && (
                        <>
                          <button onClick={() => approveMutation.mutate(req._id)} disabled={approveMutation.isPending}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50">
                            Approve
                          </button>
                          <button onClick={() => rejectMutation.mutate(req._id)} disabled={rejectMutation.isPending}
                            className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition disabled:opacity-50">
                            Reject
                          </button>
                        </>
                      )}
                      {!isDonor && req.status === 'pending' && (
                        <button onClick={() => cancelMutation.mutate(req._id)} disabled={cancelMutation.isPending}
                          className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition disabled:opacity-50">
                          Cancel
                        </button>
                      )}
                      <Link to={`/requests/${req._id}`} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                        View
                      </Link>
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
