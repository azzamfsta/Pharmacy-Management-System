"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function InventoryDashboard() {
  const [isShortageModalOpen, setIsShortageModalOpen] = useState(false);
  const [shortageItems, setShortageItems] = useState([]);
  const [counts, setCounts] = useState({ available: 0, groups: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Hitung total obat
      const { count: medicineCount } = await supabase
        .from("medicines")
        .select("*", { count: "exact", head: true });

      // 2. Hitung total grup
      const { count: groupCount } = await supabase
        .from("medicine_groups")
        .select("*", { count: "exact", head: true });

      // 3. Ambil data shortage (stok < 10) beserta ID untuk navigasi restock
      const { data: shortageData } = await supabase
        .from("medicines")
        .select("id, name, stock, price") // Pastikan 'id' ditarik
        .lt("stock", 10);

      setCounts({
        available: medicineCount || 0,
        groups: groupCount || 0,
      });
      setShortageItems(shortageData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Inventory
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Overall inventory status and monitoring.
          </p>
        </div>
      </div>

      {/* GRID 3 OPSI UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border-2 border-blue-100 rounded-[32px] overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md">
          <div className="p-10 flex flex-col items-center text-center flex-1">
            <div className="text-5xl mb-6 bg-blue-50 w-20 h-20 flex items-center justify-center rounded-3xl text-blue-400 font-light">
              +
            </div>
            <h2 className="text-5xl font-black text-slate-800 mb-2">
              {loading ? "..." : counts.available}
            </h2>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
              Medicines Available
            </p>
          </div>
          <Link
            href="/dashboard/inventory/list"
            className="w-full py-5 bg-blue-50 text-blue-600 text-center font-black text-[11px] uppercase tracking-widest border-t border-blue-100"
          >
            VISIT INVENTORY »
          </Link>
        </div>

        <div className="bg-white border-2 border-emerald-100 rounded-[32px] overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md">
          <div className="p-10 flex flex-col items-center text-center flex-1">
            <div className="text-4xl mb-6 bg-emerald-50 w-20 h-20 flex items-center justify-center rounded-3xl">
              💊
            </div>
            <h2 className="text-5xl font-black text-slate-800 mb-2">
              {loading ? "..." : counts.groups.toString().padStart(2, "0")}
            </h2>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
              Medicine Groups
            </p>
          </div>
          <Link
            href="/dashboard/inventory/groups"
            className="w-full py-5 bg-emerald-50 text-emerald-600 text-center font-black text-[11px] uppercase tracking-widest border-t border-emerald-100"
          >
            GROUP DETAILS »
          </Link>
        </div>

        <div className="bg-white border-2 border-red-100 rounded-[32px] overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md">
          <div className="p-10 flex flex-col items-center text-center flex-1">
            <div className="text-4xl mb-6 bg-red-50 w-20 h-20 flex items-center justify-center rounded-3xl">
              ⚠️
            </div>
            <h2 className="text-5xl font-black text-slate-800 mb-2">
              {loading
                ? "..."
                : shortageItems.length.toString().padStart(2, "0")}
            </h2>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
              Medicine Shortage
            </p>
          </div>
          <button
            onClick={() => setIsShortageModalOpen(true)}
            className="w-full py-5 bg-red-50 text-red-600 text-center font-black text-[11px] uppercase tracking-widest hover:bg-red-100 transition border-t border-red-100 cursor-pointer"
          >
            RESOLVE NOW »
          </button>
        </div>
      </div>

      {/* POP-UP MODAL: MEDICINE SHORTAGE ALERTS */}
      {isShortageModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setIsShortageModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-10 pb-0 flex justify-between items-start">
              <div className="flex items-center gap-5">
                <span className="text-4xl">⚠️</span>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                  Medicine Shortage Alerts
                </h2>
              </div>
              <button
                onClick={() => setIsShortageModalOpen(false)}
                className="text-slate-300 hover:text-slate-500 text-3xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-10">
              <div className="flex justify-end mb-6">
                <span className="bg-red-500 text-white text-[11px] font-black px-5 py-2 rounded-lg uppercase tracking-wider shadow-lg shadow-red-100">
                  Immediate Action Required
                </span>
              </div>

              {/* Tabel Konten */}
              <div className="border border-slate-100 rounded-[24px] overflow-hidden shadow-sm bg-white">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="p-5 font-black">Medicine Name</th>
                      <th className="p-5 font-black text-center">Stock</th>
                      <th className="p-5 font-black text-center">Status</th>
                      <th className="p-5 font-black text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold text-slate-600">
                    {shortageItems.length > 0 ? (
                      shortageItems.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-t border-slate-50 hover:bg-slate-50 transition"
                        >
                          <td className="p-5 text-slate-800 font-black">
                            {item.name}
                          </td>
                          <td className="p-5 text-red-500 font-black text-xl text-center">
                            {item.stock}
                          </td>
                          <td className="p-5 text-center">
                            <span
                              className={`px-4 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest shadow-sm ${
                                item.stock <= 5
                                  ? "bg-red-500 text-white"
                                  : "bg-amber-100 text-amber-600"
                              }`}
                            >
                              {item.stock <= 5 ? "Critical" : "Low"}
                            </span>
                          </td>
                          <td className="p-5 text-center">
                            {/* TOMBOL RESTOCK NOW DENGAN NAVIGASI KE EDIT */}
                            <Link
                              href={`/dashboard/inventory/edit/${item.id}`}
                              className="bg-[#00A99D] text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-[#008f85] transition cursor-pointer flex items-center justify-center gap-2 mx-auto w-fit shadow-md shadow-teal-100"
                            >
                              🛒 RESTOCK NOW
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="p-20 text-center text-emerald-600 font-black tracking-widest uppercase text-xs"
                        >
                          ✅ All stocks are currently safe.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
