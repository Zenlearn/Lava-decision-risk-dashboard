"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Briefcase } from "lucide-react";
import { motion, Variants } from "framer-motion";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  deepSpace:      "#1B264F",
  zenMidnight:    "#294D89",
  learningCobalt: "#2B4AC8",
  slateBreeze:    "#94A3B8",
  serenityIce:    "#F8FAFC",
  metaGrey:       "#475569",
  white:          "#FFFFFF",
} as const;

const cardStyle = {
  background: T.white,
  border: `1px solid ${T.slateBreeze}`,
  borderRadius: "8px",
} as const;

interface TabProfileProps {
  user?: {
    name: string;
    email: string;
    role?: string;
  };
}

export default function TabProfile({ user }: TabProfileProps) {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a full implementation, this could fetch from /api/v1/user/profile
    // For now, we hydrate from the passed-in user object (from localStorage)
    if (user) {
      setUserDetails({
        first_name: user.name?.split(' ')[0] || '',
        last_name: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        job_title: user.role || 'Administrator',
        phone: '+91 XXXXX XXXXX', // Placeholder or fetch from real API
      });
    }
    // Simulate loading for the nice UI effect
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [user]);

  const containerVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants: Variants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: T.learningCobalt }} />
      </div>
    );
  }

  return (
    <div className="w-full pb-10 pt-6 px-8" style={{ background: T.serenityIce, minHeight: '100vh' }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto">
        
        {/* Header Title */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: T.deepSpace }}>User Profile</h1>
          <p className="text-sm mt-1" style={{ color: T.metaGrey }}>Manage your account settings and preferences</p>
        </motion.div>

        {/* ── Profile header card ─────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="rounded-xl overflow-hidden mb-6 shadow-sm" style={cardStyle}>
          {/* Deep-space banner */}
          <div className="relative h-32" style={{ background: T.deepSpace }}>
            <div className="absolute -bottom-16 left-6">
              <div className="w-32 h-32 rounded-full border-4 overflow-hidden" style={{ borderColor: T.white, background: T.white, boxShadow: "0 2px 8px rgba(27,38,79,0.15)" }}>
                <div className="w-full h-full flex items-center justify-center" style={{ background: T.serenityIce }}>
                  <span className="text-4xl font-semibold" style={{ color: T.learningCobalt }}>
                    {userDetails?.first_name?.charAt(0)?.toUpperCase()}
                    {userDetails?.last_name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-20 pb-6 px-8">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold" style={{ color: T.deepSpace }}>
                {userDetails?.first_name} {userDetails?.last_name}
              </h1>
            </div>
            
            <div className="text-sm font-medium mt-1 mb-6" style={{ color: T.learningCobalt }}>
              {userDetails?.job_title}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 pt-4" style={{ borderTop: `1px solid ${T.serenityIce}` }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: T.serenityIce }}>
                  <User size={18} style={{ color: T.learningCobalt }} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: T.slateBreeze }}>Full Name</div>
                  <div className="text-sm font-medium" style={{ color: T.deepSpace }}>{userDetails?.first_name} {userDetails?.last_name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: T.serenityIce }}>
                  <Mail size={18} style={{ color: T.learningCobalt }} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: T.slateBreeze }}>Email Address</div>
                  <div className="text-sm font-medium" style={{ color: T.deepSpace }}>{userDetails?.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: T.serenityIce }}>
                  <Phone size={18} style={{ color: T.learningCobalt }} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: T.slateBreeze }}>Phone Number</div>
                  <div className="text-sm font-medium" style={{ color: T.deepSpace }}>{userDetails?.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: T.serenityIce }}>
                  <Briefcase size={18} style={{ color: T.learningCobalt }} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: T.slateBreeze }}>Role</div>
                  <div className="text-sm font-medium" style={{ color: T.deepSpace }}>{userDetails?.job_title}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
