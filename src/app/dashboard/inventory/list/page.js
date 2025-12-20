"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function InventoryListPage() {
  const searchParams = useSearchParams();
  const initialGroupFilter = searchParams.get("group");
  const specialFilter = searchParams.get("filter");

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableGroups, setAvailableGroups] = useState([]);

  // State untuk Fitur Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(initialGroupFilter || "");

  // Fetch Data Awal
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Ambil list obat
        const { data: medData } = await supabase
          .from("medicines")
          .select("*")
          .order("name", { ascending: true });

        // Ambil list group untuk dropdown
        const { data: groupData } = await supabase
          .from("medicine_groups")
          .select("name");

        setMedicines(medData || []);
        setAvailableGroups(groupData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // LOGIKA FILTER DUA ARAH (SEARCH + GROUP)
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (med.medicine_id &&
        med.medicine_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGroup =
      selectedGroup === "" || med.group_name === selectedGroup;

    // Tambahan logika untuk filter 'uncategorized' dari dashboard
    if (specialFilter === "uncategorized") {
      return matchesSearch && (!med.group_name || med.group_name === "");
    }

    return matchesSearch && matchesGroup;
  });

  const handleDelete = async (id, name) => {
    if (confirm(`Hapus "${name}"?`)) {
      const { error } = await supabase.from("medicines").delete().eq("id", id);
      if (!error) setMedicines(medicines.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* TOMBOL BACK KE MENU UTAMA INVENTORY */}
          <Link
            href="/dashboard/inventory"
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm group"
            title="Back to Inventory"
          >
            <span className="text-slate-400 group-hover:text-slate-600 font-bold">
              ←
            </span>
          </Link>

          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">
              Inventory ›{" "}
              <span className="text-slate-500 font-bold">
                List of Medicines
              </span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              List of medicines available for sales.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/inventory/add"
          className="bg-[#FF4D4D] text-white px-6 py-2.5 rounded-lg font-black shadow-lg shadow-red-100 flex items-center gap-2 hover:bg-red-600 transition-all"
        >
          <span className="text-xl">+</span> Add New Item
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {/* FITUR SEARCH & SELECT GROUP BERFUNGSI */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-white">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search Medicine Inventory.."
              className="w-full bg-[#F8F9FA] border border-slate-200 p-2.5 pl-10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00A99D]/20 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3.5 top-3 opacity-30 font-bold">
              🔍
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-lg">⏳</span>
              <select
                className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer p-1"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">- All Groups -</option>
                {availableGroups.map((g, i) => (
                  <option key={i} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <th className="p-5 border-r border-slate-100">Medicine Name</th>
                <th className="p-5 border-r border-slate-100">Medicine ID</th>
                <th className="p-5 border-r border-slate-100">Group Name</th>
                <th className="p-5 border-r border-slate-100 text-right">
                  Price
                </th>
                <th className="p-5 border-r border-slate-100 text-center">
                  Stock
                </th>
                <th className="p-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600 font-bold">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredMedicines.length > 0 ? (
                filteredMedicines.map((med) => (
                  <tr
                    key={med.id}
                    className="border-b last:border-none hover:bg-slate-50/80 transition group"
                  >
                    <td className="p-5 text-slate-800 font-black">
                      {med.name}
                    </td>
                    <td className="p-5 text-slate-400 font-medium uppercase">
                      {med.medicine_id || "-"}
                    </td>
                    <td className="p-5">
                      <span
                        className={
                          med.group_name
                            ? "text-slate-500"
                            : "text-amber-500 italic"
                        }
                      >
                        {med.group_name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="p-5 text-right text-slate-800">
                      Rp {Number(med.price || 0).toLocaleString()}
                    </td>
                    <td className="p-5 text-center">
                      <span
                        className={`${
                          med.stock < 10 ? "text-red-500" : "text-slate-600"
                        }`}
                      >
                        {med.stock}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-4">
                        <Link
                          href={`/dashboard/inventory/details/${med.id}`}
                          className="text-[11px] font-black hover:text-[#00A99D] transition uppercase"
                        >
                          View Detail »
                        </Link>
                        <button
                          onClick={() => handleDelete(med.id, med.name)}
                          className="p-2 text-slate-300 hover:text-red-500 transition"
                          title="Delete Item"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-20 text-center text-slate-400 italic"
                  >
                    No matches found in inventory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <p>Showing {filteredMedicines.length} Results</p>
        </div>
      </div>
    </div>
  );
}
