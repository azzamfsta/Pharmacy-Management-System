"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({ children }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState({ name: "", role: "" });
  const [currentTime, setCurrentTime] = useState(new Date()); // State untuk jam real-time
  const pathname = usePathname();
  const router = useRouter();

  // 1. Efek untuk Jam Real-time menyesuaikan laptop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 2. Fetch User Profile
  useEffect(() => {
    const getUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

        if (!error && profile) {
          setUserData({
            name: profile.full_name,
            role: profile.role,
          });
        } else {
          setUserData({
            name: user.user_metadata?.full_name || user.email.split("@")[0],
            role: "User",
          });
        }
      }
    };
    getUserProfile();
  }, []);

  const handleLogout = async () => {
    const confirmLogout = confirm("Apakah Anda yakin ingin keluar?");
    if (confirmLogout) {
      await supabase.auth.signOut();
      router.push("/login");
    }
  };

  const getNavLinkClass = (path) => {
    const isActive =
      pathname === path || (path !== "/dashboard" && pathname.startsWith(path));
    return `flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-all duration-200 ${
      isActive
        ? "bg-[#00A99D] text-white shadow-lg"
        : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
    }`;
  };

  // Format Jam: 10:14:05 AM
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Format Tanggal: Friday, 19 Dec 2025
  const formattedDate = currentTime.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] font-sans">
      <aside className="w-72 bg-[#1D242E] text-white flex flex-col fixed h-full shadow-2xl z-30">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 border-b border-slate-700/50 flex items-center gap-3 mb-6">
            <div className="bg-[#FFC107] p-2 rounded-lg text-xl shadow-md">
              ➕
            </div>
            <h1 className="text-xl font-bold tracking-tight">PharmGate</h1>
          </div>

          <div className="px-4">
            <div className="relative mb-8">
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center justify-between p-3 bg-slate-700/20 rounded-xl cursor-pointer hover:bg-slate-700/40 transition border border-transparent hover:border-slate-600/50"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg border-2 border-[#00A99D] bg-slate-800 flex items-center justify-center font-black text-sm text-white">
                      {userData.name
                        ? userData.name.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#1D242E] rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate w-32">
                      {userData.name || "Loading..."}
                    </p>
                    <p className="text-[10px] text-[#FFC107] font-bold uppercase tracking-widest">
                      {userData.role}
                    </p>
                  </div>
                </div>
                <div className="text-slate-500 text-xs">⋮</div>
              </div>

              {profileOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <Link
                    href="/dashboard/management/profiles"
                    onClick={() => setProfileOpen(false)}
                    className="w-full text-left p-3.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition cursor-pointer"
                  >
                    <span className="text-slate-400">👤</span> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left p-3.5 text-sm text-red-500 hover:bg-red-50 border-t border-slate-50 flex items-center gap-3 transition cursor-pointer"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>

            <nav className="space-y-1.5">
              <Link href="/dashboard" className={getNavLinkClass("/dashboard")}>
                <span>📊</span> Dashboard
              </Link>
              <Link
                href="/dashboard/inventory"
                className={getNavLinkClass("/dashboard/inventory")}
              >
                <span>📦</span> Inventory
              </Link>
              <Link
                href="/dashboard/reports"
                className={getNavLinkClass("/dashboard/reports")}
              >
                <span>📝</span> Reports
              </Link>
              <Link
                href="/dashboard/purchase"
                className={getNavLinkClass("/dashboard/purchase")}
              >
                <span>🛒</span> POS
              </Link>
            </nav>

            <div className="mt-10 pt-6 border-t border-slate-700/50 space-y-1.5">
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                Management
              </p>
              <Link
                href="/dashboard/management/contacts"
                className={getNavLinkClass("/dashboard/management/contacts")}
              >
                <span>👥</span> Contact Management
              </Link>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <header className="bg-white h-20 shadow-sm flex justify-between items-center px-10 sticky top-0 z-20">
          {/* BAGIAN JAM REAL-TIME (Menggantikan Search Bar) */}
          <div className="flex items-center gap-4 bg-[#F8F9FA] px-6 py-2.5 rounded-2xl border border-slate-100 shadow-inner">
            <span className="text-xl">🕒</span>
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-800 tabular-nums leading-none">
                {formattedTime}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {formattedDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="text-right leading-tight">
                <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">
                  Welcome back,
                </p>
                <p className="text-[10px] text-slate-400 font-bold">
                  {userData.name}
                </p>
              </div>
              <div className="w-10 h-10 bg-[#FFC107] rounded-full flex items-center justify-center font-black text-[#1D242E] shadow-sm border-2 border-white ring-2 ring-[#FFC107]/20">
                {userData.name ? userData.name.charAt(0).toUpperCase() : "?"}
              </div>
            </div>
          </div>
        </header>

        <main className="p-10 flex-1">{children}</main>
      </div>
    </div>
  );
}
