import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import MainLayout from './layouts/MainLayout';
import LoadingSpinner from './components/LoadingSpinner';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Explore = lazy(() => import('./pages/Explore'));
const MealDetail = lazy(() => import('./pages/MealDetail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DonorDashboard = lazy(() => import('./pages/DonorDashboard'));
const ReceiverDashboard = lazy(() => import('./pages/ReceiverDashboard'));
const NewMeal = lazy(() => import('./pages/NewMeal'));
const EditMeal = lazy(() => import('./pages/EditMeal'));
const Requests = lazy(() => import('./pages/Requests'));
const RequestDetail = lazy(() => import('./pages/RequestDetail'));
const Chat = lazy(() => import('./pages/Chat'));
const ChatRoom = lazy(() => import('./pages/ChatRoom'));
const Profile = lazy(() => import('./pages/Profile'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminMeals = lazy(() => import('./pages/admin/AdminMeals'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/meals/:id" element={<MealDetail />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/donor/dashboard" element={<DonorDashboard />} />
              <Route path="/receiver/dashboard" element={<ReceiverDashboard />} />
              <Route path="/donor/meals/new" element={<NewMeal />} />
              <Route path="/donor/meals/:id/edit" element={<EditMeal />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/requests/:id" element={<RequestDetail />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:id" element={<ChatRoom />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/meals" element={<AdminMeals />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </MainLayout>
  );
}

export default App;
