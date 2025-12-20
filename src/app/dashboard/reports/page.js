"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportStats = async () => {
      setLoading(true);
      try {
        // Ambil data dari tabel sales
        const { data: sales, error } = await supabase
          .from("sales")
          .select("total_price");

        if (error) throw error;

        if (sales) {
          // 1. Kalkulasi Total Revenue (untuk Sales Report Card)
          const revenue = sales.reduce(
            (acc, curr) => acc + (parseFloat(curr.total_price) || 0),
            0
          );

          // 2. Kalkulasi Total Transaksi (untuk Payment Report Card)
          const transactions = sales.length;

          setStats({
            totalRevenue: revenue,
            totalTransactions: transactions,
          });
        }
      } catch (err) {
        console.error("Error loading report stats:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportStats();
  }, []);

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500 min-h-screen bg-[#F8FAFC]">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
          Reports
        </h1>
        <p className="text-slate-500 font-medium">
          Overall reports related to the pharmacy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl">
        {/* Total Sales Report Card */}
        <div className="bg-white border-2 border-amber-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div className="p-10 flex flex-col items-center text-center space-y-4">
            <div className="text-5xl bg-amber-50 p-6 rounded-3xl group-hover:scale-110 transition-transform duration-300">
              💵
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
              {loading ? "..." : `Rp ${stats.totalRevenue.toLocaleString()}`}
            </h2>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
              Total Sales Revenue
            </p>
          </div>
          <Link
            href="/dashboard/reports/sales"
            className="block w-full py-5 bg-amber-50 text-amber-600 font-black text-center text-xs uppercase tracking-widest hover:bg-amber-100 transition border-t border-amber-100"
          >
            View Detailed Report »
          </Link>
        </div>

        {/* Payment Report Card */}
        <div className="bg-white border-2 border-emerald-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div className="p-10 flex flex-col items-center text-center space-y-4">
            <div className="text-5xl bg-emerald-50 p-6 rounded-3xl group-hover:scale-110 transition-transform duration-300">
              🛡️
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
              {loading ? "..." : stats.totalTransactions}
            </h2>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
              Transactions Completed
            </p>
          </div>
          <Link
            href="/dashboard/reports/payments"
            className="block w-full py-5 bg-emerald-50 text-emerald-600 font-black text-center text-xs uppercase tracking-widest hover:bg-emerald-100 transition border-t border-emerald-100"
          >
            View Detailed Report »
          </Link>
        </div>
      </div>
    </div>
  );
}
