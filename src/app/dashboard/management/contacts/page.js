"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ContactManagementPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State untuk melacak apakah sedang mode Edit atau Add
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    contact_person: "",
    supplier_name: "",
    phone: "",
    email: "",
    address: "",
  });

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("supplier_name", { ascending: true });

    if (!error) setContacts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // FUNGSI UNTUK MEMBUKA MODAL EDIT
  const handleEdit = (contact) => {
    setEditId(contact.supplier_id);
    setFormData({
      contact_person: contact.contact_person || "",
      supplier_name: contact.supplier_name || "",
      phone: contact.phone || "",
      email: contact.email || "",
      address: contact.address || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      // LOGIKA UPDATE
      const { error } = await supabase
        .from("suppliers")
        .update(formData)
        .eq("supplier_id", editId);

      if (!error) {
        alert("Contact updated successfully!");
        setIsModalOpen(false);
        setEditId(null);
        fetchContacts();
      } else {
        alert("Error updating contact: " + error.message);
      }
    } else {
      // LOGIKA INSERT BARU
      const { error } = await supabase.from("suppliers").insert([formData]);

      if (!error) {
        alert("Contact added successfully!");
        setIsModalOpen(false);
        setFormData({
          contact_person: "",
          supplier_name: "",
          phone: "",
          email: "",
          address: "",
        });
        fetchContacts();
      } else {
        alert("Error adding contact: " + error.message);
      }
    }
  };

  const handleDelete = async (supplierId) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this contact?"
    );
    if (!confirmDelete) return;
    const { error } = await supabase
      .from("suppliers")
      .delete()
      .eq("supplier_id", supplierId);
    if (!error) {
      alert("Contact deleted successfully!");
      fetchContacts();
    } else {
      alert("Error deleting contact: " + error.message);
    }
  };

  // PENCARIAN BERDASARKAN SEMUA VARIABEL
  const filteredContacts = contacts.filter((contact) => {
    const s = searchTerm.toLowerCase();
    return (
      contact.contact_person?.toLowerCase().includes(s) ||
      contact.supplier_name?.toLowerCase().includes(s) ||
      contact.phone?.toLowerCase().includes(s) ||
      contact.email?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight uppercase">
            Contact Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your pharmacy suppliers and business partners.
          </p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setFormData({
              contact_person: "",
              supplier_name: "",
              phone: "",
              email: "",
              address: "",
            });
            setIsModalOpen(true);
          }}
          className="bg-[#00A99D] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-600 transition shadow-lg flex items-center gap-2 cursor-pointer"
        >
          <span>+</span> Add New Contact
        </button>
      </div>

      {/* SEARCH BAR (Identik dengan header) */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search by contact person, company, phone, or email..."
          className="w-full bg-[#F8F9FA] border border-slate-200 p-3 pl-12 rounded-xl text-sm outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D] transition-all font-medium text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="absolute left-4 top-3 text-slate-400 font-bold text-lg">
          🔍
        </span>
      </div>

      {/* CONTACT LIST TABLE */}
      <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="p-6">Contact Person</th>
              <th className="p-6">Supplier Name</th>
              <th className="p-6">Phone</th>
              <th className="p-6">Email</th>
              <th className="p-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm font-bold text-slate-600 divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-10 text-center animate-pulse">
                  Loading...
                </td>
              </tr>
            ) : filteredContacts.length > 0 ? (
              filteredContacts.map((contact, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 text-slate-800 font-black uppercase">
                    {contact.contact_person}
                  </td>
                  <td className="p-6 text-slate-500 font-medium">
                    {contact.supplier_name || "-"}
                  </td>
                  <td className="p-6 text-[#00A99D] font-black">
                    {contact.phone}
                  </td>
                  <td className="p-6 text-slate-400 font-medium lowercase">
                    {contact.email || "-"}
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="text-[10px] uppercase font-black text-blue-500 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(contact.supplier_id)}
                        className="text-[10px] uppercase font-black text-red-500 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="p-10 text-center italic text-slate-300"
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden relative animate-in zoom-in-95">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
                  {editId ? "Edit Contact" : "Add Contact"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-800 text-xl cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                    Contact Person
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Full Name"
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-[#00A99D] text-sm font-bold"
                    value={formData.contact_person}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_person: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                    Supplier Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Company Name"
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-[#00A99D] text-sm font-bold"
                    value={formData.supplier_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supplier_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                      Phone
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="08..."
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-[#00A99D] text-sm font-bold"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="mail@example.com"
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-[#00A99D] text-sm font-bold"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                    Address
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Full Address..."
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-[#00A99D] text-sm font-bold"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <div className="pt-4 border-t border-slate-50 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#00A99D] text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-teal-600 transition-all cursor-pointer"
                  >
                    Save Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 bg-slate-100 text-slate-400 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
