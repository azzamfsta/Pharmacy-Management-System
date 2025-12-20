"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import Link from "next/link"; // Import Link untuk tombol back

// Import Recharts dinamis untuk performa Next.js
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
  ssr: false,
});

export default function PaymentsReport() {
  const [salesData, setSalesData] = useState([]);
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    transactionCount: 0,
    history: [],
    distribution: [],
  });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [methodFilter, setMethodFilter] = useState("All Methods");

  // Fungsi Fetch Data Utama - Mengambil kolom customer_name
  const fetchPaymentAnalytics = async () => {
    setLoading(true);
    try {
      const { data: sales, error } = await supabase
        .from("sales")
        .select("id, total_price, created_at, payment_method, customer_name")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSalesData(sales || []);
    } catch (err) {
      console.error("Error fetching report:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Logic Filtering & Aggregation
  useEffect(() => {
    let filtered = [...salesData];

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.created_at).toISOString().split("T")[0];
        return itemDate >= dateRange.start && itemDate <= dateRange.end;
      });
    }

    if (methodFilter !== "All Methods") {
      filtered = filtered.filter((item) =>
        item.payment_method?.includes(methodFilter)
      );
    }

    const revenue = filtered.reduce(
      (acc, curr) => acc + (parseFloat(curr.total_price) || 0),
      0
    );

    const distMap = filtered.reduce((acc, curr) => {
      const method = (curr.payment_method || "Umum").split(" ")[0];
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.keys(distMap).map((key, index) => ({
      name: key,
      value: distMap[key],
      color: ["#00A99D", "#FF4D4D", "#FACC15", "#0EA5E9"][index % 4],
    }));

    setReportData({
      totalRevenue: revenue,
      transactionCount: filtered.length,
      history: filtered,
      distribution: chartData,
    });
  }, [salesData, dateRange, methodFilter]);

  useEffect(() => {
    fetchPaymentAnalytics();
  }, []);

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-4">
          {/* TOMBOL BACK KE MENU UTAMA REPORTS */}
          <Link
            href="/dashboard/reports"
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm group"
            title="Back to Reports"
          >
            <span className="text-slate-400 group-hover:text-slate-600 font-bold">
              ←
            </span>
          </Link>

          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
              Reports ›{" "}
              <span className="text-slate-400 font-bold">Payments Report</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Real-time overview of all sales transactions.
            </p>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex gap-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm items-end">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Start Date
          </label>
          <input
            type="date"
            className="block w-full bg-slate-50 border-none rounded-xl text-xs font-bold p-3 outline-none focus:ring-2 focus:ring-teal-500/20"
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            End Date
          </label>
          <input
            type="date"
            className="block w-full bg-slate-50 border-none rounded-xl text-xs font-bold p-3 outline-none focus:ring-2 focus:ring-teal-500/20"
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
          />
        </div>
        <div className="space-y-2 flex-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Payment Method
          </label>
          <select
            className="block w-full bg-slate-50 border-none rounded-xl text-xs font-bold p-3 outline-none cursor-pointer"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option>All Methods</option>
            <option>Cash</option>
            <option>Debit</option>
            <option>QRIS</option>
            <option>Credit</option>
          </select>
        </div>
        <button
          onClick={fetchPaymentAnalytics}
          className="bg-slate-800 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition"
        >
          Refresh Data
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total Revenue
          </p>
          <h2 className="text-3xl font-black text-slate-800">
            Rp {reportData.totalRevenue.toLocaleString()}
          </h2>
          <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
            ▲ LIVE UPDATING
          </p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Transactions
          </p>
          <h2 className="text-3xl font-black text-slate-800">
            {reportData.transactionCount}
          </h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase">
            Sales Count
          </p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Avg. Per Sale
          </p>
          <h2 className="text-3xl font-black text-slate-800">
            Rp{" "}
            {reportData.transactionCount > 0
              ? Math.round(
                  reportData.totalRevenue / reportData.transactionCount
                ).toLocaleString()
              : 0}
          </h2>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-2 text-center flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Status
          </p>
          <h2 className="text-2xl font-black text-[#00A99D]">SUCCESS</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 flex flex-col items-center">
          <h3 className="font-black text-slate-800 mb-10 self-start uppercase text-xs tracking-widest">
            Distribution
          </h3>
          <div className="h-[280px] w-full">
            {reportData.distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.distribution}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {reportData.distribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 text-sm italic">
                No data
              </div>
            )}
          </div>
        </div>

        {/* TABLE - TRANSACTION LOG */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 overflow-hidden">
          <h3 className="font-black text-slate-800 mb-8 uppercase text-xs tracking-widest">
            Transaction Log
          </h3>
          <div className="overflow-y-auto max-h-[450px] custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="pb-5">Transaction ID</th>
                  <th className="pb-5">Customer</th>
                  <th className="pb-5">Date & Time</th>
                  <th className="pb-5 text-center">Method</th>
                  <th className="pb-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold">
                {reportData.history.length > 0 ? (
                  reportData.history.map((trx) => (
                    <tr
                      key={trx.id}
                      className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition"
                    >
                      <td className="py-6 text-slate-800 font-black tracking-tighter uppercase">
                        TRX-{trx.id.substring(0, 8)}
                      </td>
                      <td className="py-6 text-slate-600 font-bold">
                        {trx.customer_name || "Umum"}
                      </td>
                      <td className="py-6 text-slate-400 font-medium text-xs">
                        {new Date(trx.created_at).toLocaleDateString("id-ID")}{" "}
                        {new Date(trx.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-6 text-center">
                        <span className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase bg-slate-100 text-slate-500">
                          {trx.payment_method || "Umum"}
                        </span>
                      </td>
                      <td className="py-6 text-right text-slate-800 font-black">
                        Rp {parseFloat(trx.total_price || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-20 text-center text-slate-300 italic"
                    >
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
