"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link"; // Import Link untuk tombol navigasi

export default function EditMedicinePage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    medicine_id: "",
    group_name: "",
    stock: "",
    price: "",
    how_to_use: "",
    side_effects: "",
  });

  useEffect(() => {
    const fetchMedicine = async () => {
      const { data, error } = await supabase
        .from("medicines")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) setFormData(data);
    };
    fetchMedicine();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("medicines")
      .update({
        name: formData.name,
        medicine_id: formData.medicine_id,
        group_name: formData.group_name,
        stock: parseInt(formData.stock),
        price: parseFloat(formData.price),
        how_to_use: formData.how_to_use,
        side_effects: formData.side_effects,
      })
      .eq("id", id);

    if (!error) {
      alert("Details updated successfully!");
      router.push(`/dashboard/inventory/details/${id}`);
    } else {
      alert("Failed to update: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        {/* TOMBOL BACK KE VIEW DETAILS */}
        <Link
          href={`/dashboard/inventory/details/${id}`}
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm group"
          title="Back to Details"
        >
          <span className="text-slate-400 group-hover:text-slate-600 font-bold">
            ←
          </span>
        </Link>

        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
          Edit Medicine Details
        </h1>
      </div>

      <form
        onSubmit={handleUpdate}
        className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-8"
      >
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Medicine Name
            </label>
            <input
              type="text"
              className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A99D]/20 font-bold text-slate-700"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Medicine ID
            </label>
            <input
              type="text"
              className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A99D]/20 font-bold text-slate-700"
              value={formData.medicine_id}
              onChange={(e) =>
                setFormData({ ...formData, medicine_id: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Medicine Group
            </label>
            <input
              type="text"
              className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A99D]/20 font-bold text-slate-700"
              value={formData.group_name}
              onChange={(e) =>
                setFormData({ ...formData, group_name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Unit Price (Rp)
            </label>
            <input
              type="number"
              className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A99D]/20 font-black text-[#00A99D]"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Stock Quantity
            </label>
            <input
              type="number"
              className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00A99D]/20 font-bold text-slate-700"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
            How to Use
          </label>
          <textarea
            rows="4"
            className="w-full border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#00A99D]/20 font-medium text-slate-600"
            value={formData.how_to_use}
            onChange={(e) =>
              setFormData({ ...formData, how_to_use: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Side Effects
          </label>
          <textarea
            rows="4"
            className="w-full border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#00A99D]/20 font-medium text-slate-600"
            value={formData.side_effects}
            onChange={(e) =>
              setFormData({ ...formData, side_effects: e.target.value })
            }
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#00A99D] hover:bg-[#008f85] text-white px-10 py-3.5 rounded-xl font-black shadow-lg transition-all cursor-pointer uppercase text-xs tracking-widest"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/inventory/details/${id}`)}
            className="text-slate-400 font-black px-6 hover:text-slate-600 transition uppercase text-xs tracking-widest cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
