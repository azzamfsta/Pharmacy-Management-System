"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link untuk tombol back

export default function AddMedicinePage() {
  const [formData, setFormData] = useState({
    name: "",
    medicine_id: "",
    group_name: "",
    stock: "",
    price: "",
    how_to_use: "",
    side_effects: "",
  });

  const [availableGroups, setAvailableGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingGroups, setFetchingGroups] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data, error } = await supabase
          .from("medicine_groups")
          .select("name")
          .order("name", { ascending: true });

        if (error) throw error;
        setAvailableGroups(data || []);
      } catch (error) {
        console.error("Gagal memuat grup:", error.message);
      } finally {
        setFetchingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.group_name) {
      alert("Silakan pilih grup obat terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("medicines").insert([
        {
          name: formData.name,
          medicine_id: formData.medicine_id,
          group_name: formData.group_name,
          stock: parseInt(formData.stock),
          price: parseFloat(formData.price),
          how_to_use: formData.how_to_use,
          side_effects: formData.side_effects,
        },
      ]);

      if (error) throw error;

      alert("Obat berhasil ditambahkan!");
      router.push("/dashboard/inventory/list");
    } catch (error) {
      alert("Gagal menambah obat: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-500">
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

        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Inventory ›{" "}
            <span className="text-slate-500 font-bold">Add New Item</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            *All fields are mandatory, except mentioned as (optional).
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-8"
      >
        <div className="grid grid-cols-2 gap-8">
          {/* Medicine Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Medicine Name
            </label>
            <input
              type="text"
              className="w-full border border-slate-200 p-3.5 rounded-xl bg-slate-50/30 outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition font-bold text-slate-700"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          {/* Medicine ID */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Medicine ID
            </label>
            <input
              type="text"
              className="w-full border border-slate-200 p-3.5 rounded-xl bg-slate-50/30 outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition font-bold text-slate-700"
              value={formData.medicine_id}
              onChange={(e) =>
                setFormData({ ...formData, medicine_id: e.target.value })
              }
              required
            />
          </div>

          {/* Medicine Group */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Medicine Group
            </label>
            <select
              className="w-full border border-slate-200 p-3.5 rounded-xl bg-slate-50/30 outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition font-bold text-slate-700 cursor-pointer"
              value={formData.group_name}
              onChange={(e) =>
                setFormData({ ...formData, group_name: e.target.value })
              }
              required
            >
              <option value="" disabled>
                {fetchingGroups ? "Loading groups..." : "- Select Group -"}
              </option>
              {availableGroups.map((group, index) => (
                <option key={index} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Price (IDR)
            </label>
            <input
              type="number"
              className="w-full border border-slate-200 p-3.5 rounded-xl bg-slate-50/30 outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition font-bold text-slate-700"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Quantity in Number
            </label>
            <input
              type="number"
              className="w-full border border-slate-200 p-3.5 rounded-xl bg-slate-50/30 outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition font-bold text-slate-700"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* How to Use */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
            How to Use
          </label>
          <textarea
            rows="4"
            className="w-full border border-slate-200 p-4 rounded-xl bg-slate-50/30 outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition font-medium text-slate-600"
            value={formData.how_to_use}
            onChange={(e) =>
              setFormData({ ...formData, how_to_use: e.target.value })
            }
          ></textarea>
        </div>

        {/* Side Effects */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Side Effects
          </label>
          <textarea
            rows="4"
            className="w-full border border-slate-200 p-4 rounded-xl bg-slate-50/30 outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition font-medium text-slate-600"
            value={formData.side_effects}
            onChange={(e) =>
              setFormData({ ...formData, side_effects: e.target.value })
            }
          ></textarea>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || fetchingGroups}
            className="bg-[#FF4D4D] hover:bg-red-600 text-white px-10 py-3.5 rounded-xl font-black transition shadow-lg shadow-red-100 disabled:bg-slate-300 disabled:shadow-none cursor-pointer uppercase text-xs tracking-widest"
          >
            {loading ? "Saving..." : "Save Details"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/inventory/list")}
            className="px-10 py-3.5 text-slate-400 font-black hover:text-slate-600 transition uppercase text-xs tracking-widest cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
