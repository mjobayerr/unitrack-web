import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Bus, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';

export function Splash() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A3C8F] via-[#2d5bb7] to-[#1A3C8F] flex flex-col items-center justify-between p-6 text-white overflow-hidden relative max-w-[430px] mx-auto">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-32 left-10 w-40 h-40 bg-[#1DB954]/20 rounded-full blur-3xl"></div>

      <div className="flex-1 flex flex-col items-center justify-center z-10">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-[32px] flex items-center justify-center border-2 border-white/30 shadow-2xl">
            <Bus className="w-16 h-16" strokeWidth={2.5} />
          </div>
        </motion.div>

        {/* App Name */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-4"
        >
          <h1 className="text-5xl mb-2 tracking-tight">UniTrack BD</h1>
          <div className="h-1 w-32 bg-[#1DB954] rounded-full mx-auto"></div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-xl text-white/90 text-center max-w-xs"
        >
          Never miss your bus again
        </motion.p>
      </div>

      {/* Features */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="w-full space-y-4 mb-8 z-10"
      >
        <div className="flex items-center gap-3 text-white/90">
          <div className="w-2 h-2 bg-[#1DB954] rounded-full"></div>
          <span>Real-time bus tracking</span>
        </div>
        <div className="flex items-center gap-3 text-white/90">
          <div className="w-2 h-2 bg-[#1DB954] rounded-full"></div>
          <span>Automated QR payments</span>
        </div>
        <div className="flex items-center gap-3 text-white/90">
          <div className="w-2 h-2 bg-[#1DB954] rounded-full"></div>
          <span>Live seat availability</span>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="w-full z-10"
      >
        <Button
          onClick={() => navigate('/login')}
          className="w-full bg-white text-[#1A3C8F] hover:bg-white/90 h-14 rounded-[12px] gap-2 shadow-xl"
          size="lg"
        >
          Login with Student ID
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
}
