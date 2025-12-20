"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function PurchasePOSPage() {
  const [customerName, setCustomerName] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("Cash (Tunai)");

  const [searchQuery, setSearchQuery] = useState("");
  const [inventory, setInventory] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [qty, setQty] = useState(1);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from("medicines")
        .select("id, name, price, stock, how_to_use")
        .gt("stock", 0)
        .order("name", { ascending: true });
      if (!error) setInventory(data || []);
    };
    fetchInventory();
  }, []);

  useEffect(() => {
    const searchMedicine = () => {
      if (searchQuery.length < 1) {
        setSearchResults(inventory.slice(0, 10));
        return;
      }
      const filtered = inventory
        .filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10);
      setSearchResults(filtered);
    };
    const debounce = setTimeout(searchMedicine, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, inventory]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrintIndividualPrescription = (item) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return alert("Pop-up diblokir!");

    const currentTime = new Date()
      .toLocaleString("id-ID", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      })
      .replace(/\./g, ":");

    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page { size: 8cm 5cm; margin: 0; }
            body { font-family: sans-serif; width: 8cm; height: 5cm; padding: 10px 15px; margin: 0; color: #000; box-sizing: border-box; display: flex; flex-direction: column; line-height: 1.1; }
            .header { text-align: center; font-size: 8px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 5px; }
            .info-row { display: flex; justify-content: space-between; font-size: 7px; margin-bottom: 2px; font-weight: bold; }
            .patient-name { font-size: 10px; font-weight: 900; margin: 2px 0; text-transform: uppercase; }
            .medicine-row { font-size: 10px; font-weight: 900; margin: 4px 0 2px 0; }
            .signa { font-size: 10px; font-weight: 900; margin: 2px 0; text-transform: uppercase; }
            .exp-section { font-size: 8px; font-weight: bold; margin-top: auto; padding-top: 2px; }
            .footer-warning { text-align: center; color: red; font-size: 7px; font-weight: 900; border-top: 1px dashed #ccc; padding-top: 2px; margin-top: 2px; }
          </style>
        </head>
        <body>
          <div class="header">PHARMGATE APOTEK @ SURABAYA<br/>Jl. Kesehatan Raya No. 123 | (031) 555-0123</div>
          <div class="info-row"><span>${currentTime}</span><span>ID: ${item.id
      .substring(0, 8)
      .toUpperCase()}</span></div>
          <div class="patient-name">Nama Pasien: ${
            customerName ? customerName.toUpperCase() : "................"
          }</div>
          <div class="medicine-row">[Qty]: ${
            item.qty
          } Unit ${item.name.toUpperCase()}</div>
          <div class="signa">${
            item.how_to_use
              ? item.how_to_use.toUpperCase()
              : "SESUAI PETUNJUK APOTEKER"
          }</div>
          <div class="exp-section">Exp Date: ( _____ / _____ / ________ )</div>
          <div class="footer-warning">HINDARI DARI JANGKAUAN ANAK - ANAK</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintInvoice = (invoiceData) => {
    const { customer, date, items, subtotal, tax, total, method } = invoiceData;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #334155; }
            .brand { color: #00A99D; font-size: 24px; font-weight: 900; margin-bottom: 5px; }
            .header-info { font-size: 12px; margin-bottom: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; padding: 12px 8px; border-bottom: 2px solid #f1f5f9; }
            td { padding: 12px 8px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
            .total-box { margin-top: 30px; border-top: 2px solid #00A99D; padding-top: 20px; text-align: right; }
            .total-row { display: flex; justify-content: flex-end; gap: 40px; margin-bottom: 8px; font-size: 14px; }
            .grand-total { font-size: 24px; font-weight: 900; color: #00A99D; margin-top: 10px; }
            .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="brand">➕ PHARMGATE</div>
          <div class="header-info">
            <p><strong>Apotek PharmGate Surabaya</strong><br/>Jl. Kesehatan Raya No. 123 | (031) 555-0123</p>
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
              <span><strong>Customer:</strong> ${customer || "Umum"}</span>
              <span><strong>Date:</strong> ${date} | <strong>Method:</strong> ${method}</span>
            </div>
          </div>
          <table>
            <thead><tr><th>Item Description</th><th>Qty</th><th style="text-align:right">Total Price</th></tr></thead>
            <tbody>
              ${items
                .map(
                  (i) =>
                    `<tr><td><strong>${i.name}</strong></td><td>${
                      i.qty
                    }</td><td style="text-align:right">Rp ${i.total.toLocaleString()}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>
          <div class="total-box">
            <div class="total-row"><span>Subtotal:</span><span>Rp ${subtotal.toLocaleString()}</span></div>
            <div class="total-row"><span>Tax (11%):</span><span>Rp ${tax.toLocaleString()}</span></div>
            <div class="grand-total">TOTAL DUE: Rp ${total.toLocaleString()}</div>
          </div>
          <div class="footer"><p>Terima kasih atas kunjungan Anda. Semoga lekas sembuh!</p></div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const addToCart = () => {
    if (!selectedMedicine) return;
    const currentPrice = selectedMedicine.price || 0;
    if (qty > selectedMedicine.stock) {
      alert("Stok tidak mencukupi!");
      return;
    }
    const existingItemIndex = cart.findIndex(
      (item) => item.id === selectedMedicine.id
    );
    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].qty += parseInt(qty);
      updatedCart[existingItemIndex].total =
        updatedCart[existingItemIndex].qty * currentPrice;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          ...selectedMedicine,
          qty: parseInt(qty),
          total: currentPrice * parseInt(qty),
        },
      ]);
    }
    setSearchQuery("");
    setSelectedMedicine(null);
    setQty(1);
    setShowDropdown(false);
  };

  // --- FITUR BARU: FUNGSI HAPUS ITEM DARI KERANJANG ---
  const removeFromCart = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const tax = subtotal * 0.11;
  const totalDue = subtotal + tax;

  const handleCompleteTransaction = async () => {
    if (cart.length === 0) return;
    try {
      const transactionData = {
        customer: customerName,
        date: transactionDate,
        items: [...cart],
        subtotal,
        tax,
        total: totalDue,
        method: paymentMethod,
      };
      for (const item of cart) {
        await supabase.from("sales").insert([
          {
            medicine_id: item.id,
            quantity: item.qty,
            total_price: item.total,
            payment_method: paymentMethod,
            customer_name: customerName || "Umum",
          },
        ]);
        await supabase
          .from("medicines")
          .update({ stock: item.stock - item.qty })
          .eq("id", item.id);
      }
      alert("Transaksi Berhasil!");
      if (confirm("Cetak struk belanja?")) handlePrintInvoice(transactionData);
      setCart([]);
      setCustomerName("");
      window.location.reload();
    } catch (err) {
      alert("Gagal memproses transaksi: " + err.message);
    }
  };

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-500">
      <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
        New Purchase Transaction (POS)
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              👤 Customer Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter Customer Name"
                className="w-full bg-slate-50 border p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00A99D]/20"
              />
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full bg-slate-50 border p-3 rounded-xl text-sm outline-none"
              />
            </div>
          </div>
          <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              💊 Add Medicine
            </h3>
            <div className="flex gap-4 relative" ref={dropdownRef}>
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  placeholder="Search medicine..."
                  className="w-full bg-slate-50 border p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00A99D]/20"
                />

                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-2xl mt-1 overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {searchResults.map((med) => (
                        <div
                          key={med.id}
                          onClick={() => {
                            setSelectedMedicine(med);
                            setSearchQuery(med.name);
                            setShowDropdown(false);
                          }}
                          className="p-4 hover:bg-emerald-50 cursor-pointer flex justify-between items-center transition group border-b border-slate-50 last:border-0"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 group-hover:text-[#00A99D]">
                              {med.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              Stock: {med.stock}
                            </span>
                          </div>
                          <span className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-full">
                            Rp {Number(med.price || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-24 bg-slate-50 border p-3 rounded-xl text-sm font-bold"
                min="1"
              />
              <button
                onClick={addToCart}
                className="bg-[#00A99D] text-white px-8 py-3 rounded-xl font-black text-sm transition shadow-lg shadow-teal-100 hover:bg-teal-600"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-8 flex flex-col h-fit sticky top-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
            Current Items
          </p>
          <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {cart.length > 0 ? (
              cart.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 p-3 bg-slate-50/50 rounded-2xl border border-slate-50 relative group"
                >
                  {/* MODIFIKASI: TOMBOL HAPUS (DELETE) */}
                  <button
                    onClick={() => removeFromCart(i)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                    title="Remove Item"
                  >
                    ✕
                  </button>

                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-700">
                      {item.name} x{item.qty}
                    </span>
                    <span className="text-[#00A99D]">
                      Rp {item.total.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePrintIndividualPrescription(item)}
                    className="text-[9px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-800 flex items-center gap-1 self-start"
                  >
                    📄 Print Prescription
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-300 italic text-center py-4">
                Belum ada item.
              </p>
            )}
          </div>
          <div className="border-t border-dashed border-slate-100 pt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold text-slate-700 outline-none"
              >
                <option>Cash (Tunai)</option>
                <option>Debit Card</option>
                <option>Digital Wallet (QRIS)</option>
                <option>Credit Card</option>
              </select>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-black text-slate-800">
                TOTAL DUE:
              </span>
              <span className="text-2xl font-black text-[#00A99D]">
                Rp {totalDue.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={handleCompleteTransaction}
            className="mt-8 w-full bg-[#00A99D] text-white py-5 rounded-[22px] font-black text-sm shadow-xl hover:bg-teal-600 transition-all uppercase tracking-widest"
          >
            ✓ Complete Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
