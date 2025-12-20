"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isShortageModalOpen, setIsShortageModalOpen] = useState(false);
  const [shortageItems, setShortageItems] = useState([]);

  const [data, setData] = useState({
    revenue: 0,
    medicinesCount: 0,
    groupsCount: 0,
    shortageCount: 0,
    qtySold: 0,
    invoices: 0,
    status: "Good",
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Ambil Data Penjualan
      const { data: sales } = await supabase
        .from("sales")
        .select("total_price, quantity");

      const totalRevenue =
        sales?.reduce(
          (acc, curr) => acc + (parseFloat(curr.total_price) || 0),
          0
        ) || 0;
      const totalQtySold =
        sales?.reduce((acc, curr) => acc + (parseInt(curr.quantity) || 0), 0) ||
        0;

      // 2. Ambil Data Obat (Pastikan ID diambil untuk navigasi restock)
      const { data: medicines } = await supabase
        .from("medicines")
        .select("id, name, stock, group_name"); //

      const totalMeds = medicines?.length || 0;
      const lowStockItems = medicines?.filter((m) => m.stock < 10) || [];
      const shortage = lowStockItems.length;

      // 3. Ambil Data Group
      const { count: groupCount } = await supabase
        .from("medicine_groups")
        .select("*", { count: "exact", head: true });

      setShortageItems(lowStockItems);

      let currentStatus = "Good";
      if (shortage > 5) {
        currentStatus = "Critical";
      } else if (shortage > 1) {
        currentStatus = "Warnings";
      }

      setData({
        revenue: totalRevenue,
        medicinesCount: totalMeds,
        groupsCount: groupCount || 0,
        shortageCount: shortage,
        qtySold: totalQtySold,
        invoices: sales?.length || 0,
        status: currentStatus,
      });
    } catch (err) {
      console.error("Dashboard error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Critical":
        return "border-red-600 text-red-600";
      case "Warnings":
        return "border-orange-500 text-orange-500";
      default:
        return "border-emerald-500 text-emerald-600";
    }
  };

  const stats = [
    {
      title: "Inventory Status",
      value: data.status,
      color: getStatusColor(data.status),
      icon: data.status === "Good" ? "🛡️" : "⚠️",
      sub: null,
      link: null,
    },
    {
      title: "Revenue",
      value: `Rp ${data.revenue.toLocaleString()}`,
      color: "border-amber-400",
      icon: "💰",
      sub: "View Detailed Report",
      link: "/dashboard/reports/payments",
    },
    {
      title: "Medicines Available",
      value: data.medicinesCount,
      color: "border-sky-500",
      icon: "💊",
      sub: "Visit Inventory",
      link: "/dashboard/inventory/list",
    },
    {
      title: "Medicine Shortage",
      value: data.shortageCount.toString().padStart(2, "0"),
      color: data.shortageCount > 0 ? "border-red-500" : "border-slate-200",
      icon: "🚨",
      sub: "Resolve Now",
      link: "#",
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 min-h-screen bg-[#F8FAFC]">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight uppercase">
            Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            A quick data overview of the inventory.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`bg-white p-7 rounded-[32px] shadow-sm border border-slate-200/60 border-b-[6px] ${
              s.color.split(" ")[0]
            } hover:shadow-xl hover:-translate-y-1 transition duration-300 text-center relative group`}
          >
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition">
              {s.icon}
            </div>
            <h3
              className={`text-2xl font-black tracking-tighter ${
                s.color.split(" ")[1] || "text-slate-800"
              }`}
            >
              {loading ? "..." : s.value}
            </h3>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mt-1 mb-6">
              {s.title}
            </p>
            {s.sub && (
              <button
                onClick={() => (i === 3 ? setIsShortageModalOpen(true) : null)}
                className="w-full"
              >
                {i === 3 ? (
                  <div className="w-full py-3 bg-red-50 text-red-600 text-[9px] font-black rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition uppercase tracking-widest cursor-pointer">
                    {s.sub} <span className="text-lg">›</span>
                  </div>
                ) : (
                  <Link
                    href={s.link}
                    className="w-full py-3 bg-slate-50 text-slate-500 text-[9px] font-black rounded-xl flex items-center justify-center gap-2 group-hover:bg-teal-50 group-hover:text-teal-600 transition uppercase tracking-widest"
                  >
                    {s.sub} <span className="text-lg">›</span>
                  </Link>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* FIXED MODAL: MENYESUAIKAN DENGAN DESIGN PAGE INVENTORY */}
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

              {/* Tabel Konten Sama Persis dengan Inventory */}
              <div className="border border-slate-100 rounded-[24px] overflow-hidden shadow-sm bg-white">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="p-5">Medicine Name</th>
                      <th className="p-5 text-center">Stock</th>
                      <th className="p-5 text-center">Status</th>
                      <th className="p-5 text-center">Action</th>
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
                            <Link
                              href={`/dashboard/inventory/edit/${item.id}`}
                              className="bg-[#00A99D] text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-[#008f85] transition flex items-center justify-center gap-2 mx-auto w-fit shadow-md shadow-teal-100"
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

      {/* Bagian Bawah Dashboard Tetap Sama */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <h3 className="font-black text-slate-700 uppercase text-xs tracking-widest">
              Inventory
            </h3>
            <Link
              href="/dashboard/inventory"
              className="text-[9px] text-blue-500 font-black hover:underline uppercase tracking-widest"
            >
              Go to Inventory »
            </Link>
          </div>
          <div className="p-12 grid grid-cols-2 gap-4 divide-x divide-slate-100">
            <div className="text-center">
              <p className="text-5xl font-black text-slate-800 tracking-tighter">
                {loading ? ".." : data.medicinesCount}
              </p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-3">
                Total no of Medicines
              </p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black text-slate-800 tracking-tighter">
                {loading ? ".." : data.groupsCount}
              </p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-3">
                Medicine Groups
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <h3 className="font-black text-slate-700 uppercase text-xs tracking-widest">
              Quick Report
            </h3>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
              Real-time stats
            </p>
          </div>
          <div className="p-12 grid grid-cols-2 gap-4 divide-x divide-slate-100">
            <div className="text-center">
              <p className="text-5xl font-black text-slate-800 tracking-tighter">
                {loading ? ".." : data.qtySold.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-3">
                Qty Medicines Sold
              </p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black text-slate-800 tracking-tighter">
                {loading ? ".." : data.invoices}
              </p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-3">
                Invoices Generated
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
