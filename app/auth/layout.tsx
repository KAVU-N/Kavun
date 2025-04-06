'use client';
import { motion } from 'framer-motion';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if the current page is the verification page
  const isVerificationPage = typeof window !== 'undefined' && window.location.pathname.includes('/auth/verify');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFB996] to-[#FFECEC] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`relative ${isVerificationPage ? 'max-w-sm' : 'max-w-5xl'} w-full bg-white rounded-xl shadow-2xl p-6 mt-8`}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}