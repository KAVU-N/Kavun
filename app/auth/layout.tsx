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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`relative w-full ${isVerificationPage ? 'max-w-sm' : ''}`}
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