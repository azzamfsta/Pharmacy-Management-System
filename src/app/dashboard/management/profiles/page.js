"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);

  // Data statis sesuai permintaan user
  const [profile] = useState({
    full_name: "Ronald Whisely",
    role: "User",
    email: "ronald@gmail.com",
    phone: "081435568734",
    address: "jalan Sukolilo no 28",
  });

  useEffect(() => {
    // Simulasi loading sebentar agar transisi smooth
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading)
    return (
      <div className="p-10 flex items-center gap-3 animate-pulse">
        <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
        <p className="font-black text-slate-300 uppercase tracking-widest text-xs">
          Loading Profile...
        </p>
      </div>
    );

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex text-xs font-bold text-[#00A99D] mb-8 gap-2 uppercase tracking-widest">
        <span className="text-slate-400">Home /</span>
        <span className="text-slate-400">User /</span>
        <span>User Profile</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-12 rounded-[32px] shadow-sm border border-slate-100 text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`}
                className="w-full h-full rounded-3xl border-4 border-slate-50 bg-slate-100 shadow-md"
                alt="Avatar"
              />
            </div>
            {/* Nama Panggilan saja */}
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-1">
              Ronald
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
              {profile.role}
            </p>
          </div>

          {/* Social/Link Section */}
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
            {[
              { label: "Website", val: "pharmaone.com" },
              { label: "Github", val: "ronald-dev" },
              { label: "Twitter", val: "@ronald_whisely" },
            ].map((link, i) => (
              <div
                key={i}
                className="flex justify-between p-5 px-8 items-center hover:bg-slate-50 transition"
              >
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {link.label}
                </span>
                <span className="text-[10px] font-bold text-slate-600">
                  {link.val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 h-full">
            <div className="space-y-2 mb-10 border-b border-slate-50 pb-6">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                Personal Information
              </h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
                Detail account of user Ronald
              </p>
            </div>

            <div className="space-y-1">
              {/* Row: Full Name */}
              <div className="grid grid-cols-3 py-6 border-b border-slate-50 items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Full Name
                </span>
                <span className="col-span-2 text-sm font-black text-slate-700 uppercase tracking-tight">
                  {profile.full_name}
                </span>
              </div>

              {/* Row: Email */}
              <div className="grid grid-cols-3 py-6 border-b border-slate-50 items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Email Address
                </span>
                <span className="col-span-2 text-sm font-bold text-slate-500">
                  {profile.email}
                </span>
              </div>

              {/* Row: Phone */}
              <div className="grid grid-cols-3 py-6 border-b border-slate-50 items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Phone Number
                </span>
                <span className="col-span-2 text-sm font-bold text-[#00A99D]">
                  {profile.phone}
                </span>
              </div>

              {/* Row: Address */}
              <div className="grid grid-cols-3 py-6 items-start">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Home Address
                </span>
                <span className="col-span-2 text-sm font-bold text-slate-600 leading-relaxed">
                  {profile.address}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
