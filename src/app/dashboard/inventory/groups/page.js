"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function MedicineGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Modal (Hanya Group Name)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fungsi mengambil data grup
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data: masterGroups, error: groupError } = await supabase
        .from("medicine_groups")
        .select("*")
        .order("name", { ascending: true });

      const { data: medicinesData } = await supabase
        .from("medicines")
        .select("group_name");

      if (groupError) throw groupError;

      const counts =
        medicinesData?.reduce((acc, curr) => {
          const name = curr.group_name;
          if (name && name.trim() !== "") {
            acc[name] = (acc[name] || 0) + 1;
          } else {
            acc["Uncategorized"] = (acc["Uncategorized"] || 0) + 1;
          }
          return acc;
        }, {}) || {};

      let formatted =
        masterGroups?.map((g) => ({
          id: g.id,
          name: g.name,
          count: counts[g.name] || 0,
          isMaster: true,
        })) || [];

      if (counts["Uncategorized"] > 0) {
        formatted.push({
          name: "Uncategorized",
          count: counts["Uncategorized"],
          isMaster: false,
        });
      }

      setGroups(formatted);
    } catch (error) {
      console.error("Gagal memuat data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Simpan (Hanya menyimpan nama grup)
  const handleSaveGroup = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await supabase
      .from("medicine_groups")
      .insert([{ name: newGroupName }]);

    if (error) {
      alert("Gagal menambah grup: " + error.message);
    } else {
      setIsModalOpen(false);
      setNewGroupName("");
      fetchGroups();
    }
    setIsSaving(false);
  };

  const handleDeleteGroup = async (group) => {
    if (group.count > 0) {
      alert(
        `Grup "${group.name}" tidak bisa dihapus karena masih digunakan oleh ${group.count} obat.`
      );
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus grup "${group.name}"?`)) {
      const { error } = await supabase
        .from("medicine_groups")
        .delete()
        .eq("name", group.name);
      if (error) alert(error.message);
      else fetchGroups();
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="relative space-y-6 animate-in fade-in duration-500">
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
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
              Inventory ›{" "}
              <span className="text-slate-500 font-bold">
                Medicine Groups ({groups.length})
              </span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Monitoring kategori obat.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#FF4D4D] hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-black transition shadow-lg cursor-pointer flex items-center gap-2"
        >
          <span className="text-xl">+</span> Add New Group
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
              <th className="p-5 border-r border-slate-100">Group Name</th>
              <th className="p-5 border-r border-slate-100">No of Medicines</th>
              <th className="p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-600 font-bold">
            {loading ? (
              <tr>
                <td colSpan="3" className="p-10 text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              groups.map((group, index) => (
                <tr
                  key={index}
                  className={`border-b last:border-none hover:bg-slate-50/80 transition ${
                    !group.isMaster ? "bg-amber-50/30" : ""
                  }`}
                >
                  <td className="p-5">
                    <span
                      className={
                        !group.isMaster
                          ? "text-amber-600 italic"
                          : "text-slate-800 font-black"
                      }
                    >
                      {group.name} {!group.isMaster && "(Needs Action)"}
                    </span>
                  </td>
                  <td className="p-5 font-medium text-slate-500">
                    {group.count}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-6">
                      {/* MODIFIKASI: Menggunakan encodeURIComponent untuk menangani karakter khusus */}
                      <Link
                        href={
                          group.isMaster
                            ? `/dashboard/inventory/list?group=${encodeURIComponent(
                                group.name
                              )}`
                            : `/dashboard/inventory/list?filter=uncategorized`
                        }
                        className="text-[11px] font-black text-slate-800 hover:text-[#00A99D] transition group"
                      >
                        View Medicines{" "}
                        <span className="text-lg leading-none group-hover:translate-x-1 transition">
                          »
                        </span>
                      </Link>
                      {group.isMaster && (
                        <button
                          onClick={() => handleDeleteGroup(group)}
                          className="text-red-300 hover:text-red-600 transition cursor-pointer"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL POP-UP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#F8F9FB] rounded-3xl shadow-2xl p-8 space-y-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer text-xl"
            >
              ✕
            </button>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                Add New Medicine Group
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Buat kategori baru untuk inventaris.
              </p>
            </div>
            <form onSubmit={handleSaveGroup} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Contoh: Analgesic, Diabetes, dsb."
                  className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition shadow-sm"
                  required
                />
              </div>
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-[#00A99D] hover:bg-[#008f85] text-white py-3.5 rounded-xl font-black text-sm transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    "Saving..."
                  ) : (
                    <>
                      <span className="text-lg">✓</span> Save Medicine Group
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full text-slate-500 font-black text-sm cursor-pointer hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
