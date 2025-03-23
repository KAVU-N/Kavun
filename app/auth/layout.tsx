'use client';
import { motion } from 'framer-motion';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFB996] to-[#FFECEC] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative max-w-md w-full bg-white rounded-xl shadow-2xl p-8"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative"
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFB996]/50 via-[#FFECEC]/30 to-[#FFB996]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Content */}
          <div className="relative p-0">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}