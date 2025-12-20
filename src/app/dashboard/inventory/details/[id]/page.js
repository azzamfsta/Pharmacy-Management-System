"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function MedicineDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      const { data, error } = await supabase
        .from("medicines")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setMedicine(data);
      setLoading(false);
    };
    fetchDetails();
  }, [id]);

  if (loading)
    return (
      <div className="p-10 font-bold text-slate-400">Loading details...</div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* TOMBOL BACK KE MEDICINE LIST */}
          <Link
            href="/dashboard/inventory/list"
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm group"
            title="Back to Medicine List"
          >
            <span className="text-slate-400 group-hover:text-slate-600 font-bold">
              ←
            </span>
          </Link>

          <h1 className="text-2xl font-black text-slate-800 tracking-tighter">
            Inventory › List of Medicines ›{" "}
            <span className="text-slate-500 font-bold">{medicine?.name}</span>
          </h1>
        </div>

        <Link
          href={`/dashboard/inventory/edit/${id}`}
          className="bg-[#00A99D] text-white px-6 py-2.5 rounded-lg font-black shadow-lg flex items-center gap-2 hover:bg-[#008f85] transition-all"
        >
          ✏️ Edit Details
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info Card */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Medicine ID
            </p>
            <h2 className="text-3xl font-black text-slate-800">
              {medicine?.medicine_id || "-"}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Medicine Group
            </p>
            <h2 className="text-3xl font-black text-slate-800 text-[#1D242E]">
              {medicine?.group_name || "Uncategorized"}
            </h2>
          </div>
        </div>

        {/* Price & Stock Card */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Unit Price
            </p>
            <h2 className="text-3xl font-black text-[#00A99D]">
              Rp {Number(medicine?.price || 0).toLocaleString()}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Stock Left
            </p>
            <h2 className="text-3xl font-black text-emerald-500">
              {medicine?.stock}
            </h2>
          </div>
        </div>
      </div>

      {/* Manual Content */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
            How to Use
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            {medicine?.how_to_use || "No instructions provided."}
          </p>
        </div>
        <hr className="border-slate-50" />
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
            Side Effects
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            {medicine?.side_effects || "No side effects reported."}
          </p>
        </div>
      </div>
    </div>
  );
}
