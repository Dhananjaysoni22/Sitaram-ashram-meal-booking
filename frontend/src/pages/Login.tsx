import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosClient.post("/auth/login", { username, pin });
      const { user, token } = response.data.data;
      login(user, token);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "लॉगिन विफल (Login Failed)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#8a5022] to-[#603512] p-4">
      <div className="w-full max-w-md bg-[#fdfbf6] rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#d4995c]"></div>

        <div className="text-center mb-8">
          <p className="text-[#a36329] font-bold text-sm mb-1 tracking-wider">
            ॥ श्रीसीताराम ॥
          </p>
          <h1 className="text-3xl font-extrabold text-[#5c3716] mb-2">
            आश्रम भोजन व्यवस्था
          </h1>
          <p className="text-gray-500 text-xs font-medium flex items-center justify-center">
            <span className="mr-1">🔒</span> केवल अधिकृत आश्रम संचालनकर्ताओं
            हेतु
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-bold text-center rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#5c3716] mb-1">
              उपयोगकर्ता नाम (Username)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="उपयोगकर्ता नाम"
              required
              className="w-full bg-white border border-[#e6d9c9] focus:border-[#a36329] focus:ring focus:ring-[#a36329]/20 rounded-xl px-4 py-3 text-sm transition-all outline-none text-[#333]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#5c3716] mb-1">
              सुरक्षा PIN (Security PIN)
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              required
              className="w-full bg-white border border-[#e6d9c9] focus:border-[#a36329] focus:ring focus:ring-[#a36329]/20 rounded-xl px-4 py-3 text-sm transition-all outline-none text-[#333]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#a36329] hover:bg-[#8b5321] text-white rounded-xl text-base font-bold transition-all shadow-[0_4px_14px_0_rgba(163,99,41,0.39)] disabled:opacity-70"
            >
              {loading ? "कृपया प्रतीक्षा करें..." : "सुरक्षित प्रवेश"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
