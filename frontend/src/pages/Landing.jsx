import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  UtensilsCrossed,
  Heart,
  Users,
  Leaf,
  Scale,
  ArrowRight,
  Search,
  HandHeart,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Star,
  Quote,
  Sparkles,
  TrendingUp,
  PackageOpen,
  HandPlatter,
} from 'lucide-react';
import MealCard from '../components/MealCard';
import axios from '../api/axios';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const floatingIcons = [
  { Icon: Heart, x: '10%', y: '20%', size: 28, delay: 0, color: 'text-green-400/30 dark:text-green-500/20' },
  { Icon: UtensilsCrossed, x: '85%', y: '15%', size: 32, delay: 0.5, color: 'text-orange-400/30 dark:text-orange-500/20' },
  { Icon: Leaf, x: '75%', y: '65%', size: 24, delay: 1, color: 'text-green-500/20 dark:text-green-400/15' },
  { Icon: Heart, x: '20%', y: '70%', size: 20, delay: 1.5, color: 'text-orange-300/30 dark:text-orange-400/20' },
  { Icon: Sparkles, x: '50%', y: '10%', size: 26, delay: 0.8, color: 'text-green-300/30 dark:text-green-400/20' },
  { Icon: HandPlatter, x: '90%', y: '45%', size: 22, delay: 1.2, color: 'text-orange-400/20 dark:text-orange-500/15' },
];

const steps = [
  { icon: Heart, title: 'Donate Food', desc: 'Share your surplus homemade or packaged food with neighbors in need.' },
  { icon: Search, title: 'Receiver Finds', desc: 'People browse available meals nearby and find what they need.' },
  { icon: HandHeart, title: 'Request Meal', desc: 'Receivers send a request for the meal they want to pick up.' },
  { icon: CheckCircle2, title: 'Donor Approves', desc: 'Donors review requests and approve the best match.' },
  { icon: MapPin, title: 'Pickup', desc: 'Coordinate a convenient pickup time and location.' },
  { icon: TrendingUp, title: 'Community Impact', desc: 'Every shared meal reduces waste and strengthens community bonds.' },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Home Cook & Donor',
    quote: 'I cook for my family and always have extra. Community Dabba lets me share that love with someone who truly needs it. It feels amazing to know my food feeds another family.',
    avatar: 'PS',
    rating: 5,
  },
  {
    name: 'Rahul Patel',
    role: 'College Student & Receiver',
    quote: 'As a student living alone, this platform has been a lifesaver. I get fresh home-cooked meals and have connected with wonderful neighbors in my area.',
    avatar: 'RP',
    rating: 5,
  },
  {
    name: 'Anjali Mehta',
    role: 'Restaurant Owner & Donor',
    quote: 'We used to throw away perfectly good food at the end of the day. Now, through Community Dabba, our surplus becomes someone\'s dinner. Zero waste, maximum impact.',
    avatar: 'AM',
    rating: 5,
  },
];

function CountUp({ end, duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function StatItem({ icon: Icon, value, label, color }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-1">
          {value > 0 ? <CountUp end={value} /> : 0}
          {label === 'Food Saved (kg)' ? 'kg' : '+'}
        </p>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const [stats, setStats] = useState({ mealsDonated: 0, peopleHelped: 0, foodSaved: 0, activeDonors: 0 });
  const [featuredMeals, setFeaturedMeals] = useState([]);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    axios.get('/admin/stats/public').then(({ data }) => {
      setStats({
        mealsDonated: data.mealsDonated || 0,
        peopleHelped: data.peopleHelped || 0,
        foodSaved: data.foodSaved || 0,
        activeDonors: data.activeDonors || 0,
      });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    axios.get('/meals', { params: { limit: 4, status: 'available' } }).then(({ data }) => {
      setFeaturedMeals(data?.data?.meals || []);
    }).catch(() => {});
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center bg-gradient-to-br from-green-50 via-cream to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 overflow-hidden">
        {floatingIcons.map(({ Icon, x, y, size, delay, color }, i) => (
          <motion.div
            key={i}
            className={`absolute ${color}`}
            style={{ left: x, top: y }}
            animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay, ease: 'easeInOut' }}
          >
            <Icon style={{ width: size, height: size }} />
          </motion.div>
        ))}

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-200/20 dark:bg-green-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-200/20 dark:bg-orange-500/5 rounded-full blur-3xl" />
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Join 10,000+ community members</span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                <span className="text-gray-900 dark:text-white">Share Food.</span>
                <br />
                <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent">Reduce Waste.</span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Build Community.</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                Community Dabba connects food donors with neighbors in need. Share surplus meals, reduce waste, and strengthen the bonds that make our communities thrive.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/register?role=donor" className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
                  <Heart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Donate Food
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/explore" className="group inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-2xl border-2 border-orange-200 dark:border-orange-500/30 hover:border-orange-400 dark:hover:border-orange-400/50 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                  <Search className="w-5 h-5 mr-2 text-orange-500 group-hover:scale-110 transition-transform" />
                  Find Food
                  <ArrowRight className="w-5 h-5 ml-2 text-orange-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="mt-10 flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {['bg-green-500', 'bg-orange-500', 'bg-green-400', 'bg-orange-400'].map((bg, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-bold`}>
                        {['P', 'R', 'A', 'S'][i]}
                      </div>
                    ))}
                  </div>
                  <span>Active community</span>
                </div>
                <div className="hidden sm:flex items-center space-x-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-1">4.9/5 rating</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="hidden lg:block relative">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-green-400/20 to-orange-400/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-2xl rounded-3xl p-8 border border-white/30 dark:border-gray-700/30 shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                      <HandHeart className="w-8 h-8 mb-3 opacity-90" />
                      <p className="text-2xl font-bold">{stats.mealsDonated > 0 ? stats.mealsDonated.toLocaleString() : '—'}</p>
                      <p className="text-sm opacity-80">Meals Donated</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                      <Users className="w-8 h-8 mb-3 opacity-90" />
                      <p className="text-2xl font-bold">{stats.peopleHelped > 0 ? stats.peopleHelped.toLocaleString() : '—'}</p>
                      <p className="text-sm opacity-80">People Helped</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
                      <PackageOpen className="w-8 h-8 mb-3 opacity-90" />
                      <p className="text-2xl font-bold">{stats.foodSaved > 0 ? `${stats.foodSaved.toLocaleString()}` : '—'}</p>
                      <p className="text-sm opacity-80">Kg Food Saved</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-red-400 rounded-2xl p-6 text-white shadow-lg">
                      <Heart className="w-8 h-8 mb-3 opacity-90" />
                      <p className="text-2xl font-bold">{stats.activeDonors > 0 ? stats.activeDonors.toLocaleString() : '—'}</p>
                      <p className="text-sm opacity-80">Active Donors</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 sm:py-24 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-green-600 dark:text-green-400 mb-3">Our Impact</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Making a Difference, One Meal at a Time</motion.h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatItem icon={HandHeart} value={stats.mealsDonated} label="Meals Donated" color="from-green-500 to-emerald-600" />
            <StatItem icon={Users} value={stats.peopleHelped} label="People Helped" color="from-orange-400 to-orange-600" />
            <StatItem icon={PackageOpen} value={stats.foodSaved} label="Food Saved (kg)" color="from-green-400 to-green-600" />
            <StatItem icon={Heart} value={stats.activeDonors} label="Active Donors" color="from-orange-500 to-red-500" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-cream to-green-50/50 dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-orange-500 mb-3">How It Works</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Simple Steps to Share & Receive</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              From donation to pickup, Community Dabba makes food sharing seamless and rewarding.
            </motion.p>
          </motion.div>

          {/* Desktop horizontal stepper */}
          <div className="hidden lg:block relative">
            <div className="absolute top-12 left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-green-300 via-orange-300 to-green-300 dark:from-green-700 dark:via-orange-700 dark:to-green-700" />
            <div className="grid grid-cols-6 gap-6">
              {steps.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="relative text-center group"
                >
                  <div className="relative z-10 mx-auto w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center mb-5 shadow-md group-hover:border-green-400 dark:group-hover:border-green-500 group-hover:shadow-xl transition-all duration-300">
                    <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                      {i + 1}
                    </div>
                    <Icon className="w-10 h-10 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile vertical stepper */}
          <div className="lg:hidden space-y-6">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start space-x-4"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-700 flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute ml-7 mt-14 w-0.5 h-6 bg-green-200 dark:bg-green-800" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Meals */}
      <section className="py-20 sm:py-24 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-green-600 dark:text-green-400 mb-3">Fresh & Available</motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Featured Meals</motion.h2>
            </div>
            <motion.div variants={fadeUp} custom={2}>
              <Link to="/explore" className="group inline-flex items-center space-x-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-green-400 hover:text-green-600 dark:hover:border-green-500 dark:hover:text-green-400 transition-all shadow-sm hover:shadow-md">
                <span>View All</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {featuredMeals.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredMeals.map((meal, i) => (
                <MealCard key={meal._id} meal={meal} index={i} />
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-green-100 to-orange-100 dark:from-green-900/30 dark:to-orange-900/30 flex items-center justify-center">
                <UtensilsCrossed className="w-12 h-12 text-green-500 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Meals Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">Be the first to share a meal with your community. Every donation makes a difference.</p>
              <Link to="/register?role=donor" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md">
                <Heart className="w-5 h-5 mr-2" />
                Start Donating
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-orange-50/50 to-green-50/50 dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-orange-500 mb-3">Testimonials</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">What Our Community Says</motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map(({ name, role, quote, avatar, rating }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <Quote className="absolute top-6 right-6 w-10 h-10 text-green-200 dark:text-green-800/40" />
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-sm sm:text-base">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-green-600 to-orange-500 dark:from-green-700 dark:via-green-800 dark:to-orange-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border border-white/30 rounded-full" />
          <div className="absolute bottom-10 right-10 w-60 h-60 border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-20 h-20 border border-white/20 rounded-full" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
              Join the Community Today
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
              Whether you have surplus food to share or need a nutritious meal, Community Dabba is here for you.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?role=donor" className="group inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 font-semibold rounded-2xl hover:bg-green-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
                <Heart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Become a Donor
              </Link>
              <Link to="/explore" className="group inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Find Food Near You
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
