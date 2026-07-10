"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { motion, Variants } from "framer-motion";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  deepSpace:      "#1B264F",
  learningCobalt: "#2B4AC8",
  slateBreeze:    "#94A3B8",
  serenityIce:    "#F8FAFC",
  metaGrey:       "#475569",
  white:          "#FFFFFF",
  error:          "#ef4444",
  success:        "#16a34a"
} as const;

const cardStyle = {
  background: T.white,
  border: `1px solid ${T.slateBreeze}`,
  borderRadius: "8px",
} as const;

interface Activity {
  id: string;
  activity_type: string;
  timestamp: string;
  description?: string;
  marked_suspicious?: boolean;
  metadata?: {
    ip?: string;
    platform?: string;
    device?: string;
    moduleId?: string;
    programmeId?: string;
  };
}

export default function TabActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"login" | "other">("login");

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/v1/analytics/activities", {
        headers: {
          "Content-Type": "application/json",
          // The proxy should automatically attach the token cookie
        }
      });
      
      if (response.ok) {
        const res = await response.json();
        if (res && res.activities) {
          setActivities(res.activities);
        }
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const handleSuspiciousLogins = async (activity: Activity) => {
    try {
      await fetch("/api/v1/user/login/suspicious", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activity.id,
          marked_suspicious: !activity.marked_suspicious,
        })
      });
      fetchActivities(); // Refresh data
    } catch (error) {
      console.error("Error marking suspicious activity:", error);
    }
  };

  const loginActivities = activities.filter((a) => a.activity_type === "login");
  const otherActivities = activities.filter((a) => a.activity_type !== "login");
  const selectedActivities = activeTab === "login" ? loginActivities : otherActivities;

  const containerVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants: Variants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className="w-full pb-10 pt-6 px-8" style={{ background: T.serenityIce, minHeight: '100vh' }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto">
        
        {/* Header Title */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: T.deepSpace }}>Your Activities</h1>
          <p className="text-sm mt-1" style={{ color: T.metaGrey }}>Login history and platform activity log</p>
        </motion.div>

        {/* Tab Buttons */}
        <motion.div variants={itemVariants} className="flex gap-4 mb-4">
          <button
            className="px-4 py-2 rounded font-medium text-sm transition-colors focus:outline-none"
            style={{
              background: activeTab === "login" ? T.learningCobalt : T.white,
              color: activeTab === "login" ? T.white : T.deepSpace,
              border: activeTab === "login" ? 'none' : `1px solid ${T.slateBreeze}`
            }}
            onClick={() => setActiveTab("login")}
          >
            Login Activities ({loginActivities.length})
          </button>
          <button
            className="px-4 py-2 rounded font-medium text-sm transition-colors focus:outline-none"
            style={{
              background: activeTab === "other" ? T.learningCobalt : T.white,
              color: activeTab === "other" ? T.white : T.deepSpace,
              border: activeTab === "other" ? 'none' : `1px solid ${T.slateBreeze}`
            }}
            onClick={() => setActiveTab("other")}
          >
            Other Activities ({otherActivities.length})
          </button>
        </motion.div>

        {/* ── Activities Card ─────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="rounded-xl overflow-hidden shadow-sm" style={cardStyle}>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: T.learningCobalt, borderTopColor: "transparent" }} />
            </div>
          ) : selectedActivities.length > 0 ? (
            <div className="p-0">
              {activeTab === "login" ? (
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full divide-y" style={{ borderColor: T.slateBreeze }}>
                    <thead style={{ background: T.serenityIce, color: T.deepSpace }}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date and Time</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Browser</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Device</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y" style={{ borderColor: `${T.slateBreeze}40` }}>
                      {selectedActivities.map((log, idx) => (
                        <tr key={log.id} style={{ background: idx % 2 === 0 ? T.white : T.serenityIce }}>
                          <td className="px-6 py-3 text-sm text-gray-700">{formatDate(log.timestamp)}</td>
                          <td className="px-6 py-3 text-sm text-gray-700">{(log.metadata?.ip) || "—"}</td>
                          <td className="px-6 py-3 text-sm text-gray-700">{log.metadata?.platform || "—"}</td>
                          <td className="px-6 py-3 text-sm text-gray-700">{log.metadata?.device || "desktop"}</td>
                          <td className="px-6 py-3 text-sm">
                            <button
                              onClick={() => handleSuspiciousLogins(log)}
                              className="font-medium hover:underline focus:outline-none"
                              style={{ color: log.marked_suspicious ? T.success : T.error }}
                            >
                              {log.marked_suspicious ? "Unmark Suspicious" : "Mark Suspicious"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-4 w-full p-6">
                  {selectedActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start p-4 rounded-lg"
                      style={{ background: T.serenityIce, border: `1px solid ${T.slateBreeze}` }}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0" style={{ background: 'rgba(43,74,200,0.1)' }}>
                        <Clock className="w-5 h-5" style={{ color: T.learningCobalt }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium" style={{ color: T.deepSpace }}>
                            {activity.activity_type
                              .split("_")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </p>
                          <span className="text-xs px-2 py-1 rounded font-medium" style={{ background: T.white, color: T.metaGrey, border: `1px solid ${T.slateBreeze}` }}>
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm mt-1" style={{ color: T.metaGrey }}>
                          {activity.description}
                        </p>
                        {activity.metadata && (
                          <div className="mt-3 text-xs space-y-1" style={{ color: T.slateBreeze }}>
                            {activity.metadata.moduleId && (
                              <div>Module ID: {activity.metadata.moduleId}</div>
                            )}
                            {activity.metadata.programmeId && (
                              <div>Programme ID: {activity.metadata.programmeId}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16" style={{ color: T.slateBreeze }}>
              <p>No {activeTab === "login" ? "login" : "other"} activities recorded yet.</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
