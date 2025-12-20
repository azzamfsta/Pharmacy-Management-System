"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Proses login ke Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert("Login Gagal: " + error.message);
      setLoading(false);
    } else {
      console.log("Login sukses, mengarahkan...");
      // Pindah ke dashboard jika sukses
      router.push("/dashboard");
      router.refresh(); // Memastikan middleware mendeteksi session baru
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100">
        <div className="flex justify-center mb-4">
          <div className="bg-teal-600 text-white w-12 h-12 flex items-center justify-center rounded-full font-bold text-xl">
            ➕
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-800">PharmGate</h1>
        <p className="text-slate-500 mb-8 mt-2 text-sm">
          Login to Your Account
        </p>

        <form onSubmit={handleLogin} className="space-y-5 text-left">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Username / Email
            </label>
            <input
              type="email"
              placeholder="subash@gmail.com"
              className="w-full border p-3 rounded-lg mt-1 focus:ring-2 focus:ring-teal-500 outline-none transition"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border p-3 rounded-lg mt-1 focus:ring-2 focus:ring-teal-500 outline-none transition"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-teal-600 text-white p-3 rounded-lg font-bold hover:bg-teal-700 transition flex items-center justify-center gap-2 ${
              loading ? "opacity-50" : ""
            }`}
          >
            {loading ? "Mengecek..." : "➜ Sign In"}
          </button>
        </form>
        <p className="mt-8 text-[10px] text-slate-400 font-medium">
          PharmGate Management System v 1.1.2
        </p>
      </div>
    </div>
  );
}
