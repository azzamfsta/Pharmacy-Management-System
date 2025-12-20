"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function SalesReportPage() {
  const [salesHistory, setSalesHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("All Methods");

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("sales")
        .select("*")
        .order("created_at", { ascending: true });

      if (startDate) {
        query = query.gte("created_at", `${startDate}T00:00:00`);
      }
      if (endDate) {
        query = query.lte("created_at", `${endDate}T23:59:59`);
      }

      if (selectedPaymentMethod !== "All Methods") {
        query = query.ilike("payment_method", `%${selectedPaymentMethod}%`);
      }

      const { data: sales, error: salesError } = await query;

      if (salesError) throw salesError;

      const revenue = (sales || []).reduce(
        (acc, curr) => acc + (parseFloat(curr.total_price) || 0),
        0
      );
      setTotalRevenue(revenue);

      setSalesHistory([...(sales || [])].reverse());
      processChartData(sales || []);
    } catch (err) {
      console.error("Error filtering sales:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data) => {
    const grouped = data.reduce((acc, curr) => {
      const date = new Date(curr.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const formatted = Object.keys(grouped).map((key) => ({
      date: key,
      sales: grouped[key],
    }));
    setChartData(formatted);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500 bg-[#F8FAFC] min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-4">
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
              <span className="text-slate-400 font-bold">Sales Report</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Financial and volume sales report by payment method.
            </p>
          </div>
        </div>
      </div>

      {/* FILTER ROW & TOTAL REVENUE */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-end">
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border-none p-3 rounded-xl text-xs font-bold outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 border-none p-3 rounded-xl text-xs font-bold outline-none"
            />
          </div>
          <div className="flex gap-4">
            <select
              className="flex-1 bg-slate-50 border-none p-3 rounded-xl text-xs font-bold outline-none cursor-pointer"
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            >
              <option value="All Methods">All Payment Methods</option>
              <option value="Cash">Cash (Tunai)</option>
              <option value="Debit">Debit Card</option>
              <option value="QRIS">Digital Wallet (QRIS)</option>
              <option value="Credit">Credit Card</option>
            </select>
            <button
              onClick={fetchData}
              className="bg-slate-800 text-white px-6 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition h-[45px]"
            >
              Update
            </button>
          </div>
        </div>

        <div className="bg-[#00A99D] p-6 rounded-[32px] shadow-lg shadow-teal-100 text-white space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
            Total Revenue
          </p>
          <h2 className="text-xl font-black tracking-tighter">
            Rp {totalRevenue.toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 space-y-8">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
            Sales Transactions Volume
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: "bold" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: "bold" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "15px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#0EA5E9"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MODIFIKASI: Filtered History List */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 space-y-6 overflow-hidden">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-4">
            Filtered History
          </h3>

          <div className="space-y-6 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
            {salesHistory.length > 0 ? (
              salesHistory.map((trx) => (
                <div
                  key={trx.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-[#00A99D] uppercase tracking-widest">
                      {trx.payment_method || "N/A"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(trx.created_at).toLocaleDateString("en-GB")}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                      {trx.customer_name || "UMUM"}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Rp {Number(trx.total_price).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-300 text-xs italic py-10">
                No transactions
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
