"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { loginUserDb, registerUserDb } from "@/lib/actions";

export function AuthModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (tab === "login") {
        const res = await loginUserDb(email.trim(), password);
        if (res.success && res.data) {
          login(res.data);
          onClose();
        } else {
          setError(res.error || "Đăng nhập thất bại");
        }
      } else {
        if (!name.trim()) {
          setError("Vui lòng nhập họ tên.");
          setLoading(false);
          return;
        }
        const res = await registerUserDb(name.trim(), email.trim(), password);
        if (res.success && res.data) {
          login(res.data);
          onClose();
        } else {
          setError(res.error || "Đăng ký thất bại");
        }
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-2xl transition duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-subtle hover:bg-muted hover:text-ink transition"
          type="button"
        >
          ✕
        </button>

        {/* Logo / Header */}
        <div className="flex flex-col items-center gap-1.5 mb-6 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-black text-white">
            D7
          </span>
          <h2 className="text-xl font-black text-ink mt-2">
            Chào mừng độc giả
          </h2>
          <p className="text-xs text-subtle">
            Đăng nhập để bình luận, đánh giá và lưu lịch sử đọc
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex rounded-lg bg-muted p-1 mb-5">
          <button
            onClick={() => {
              setTab("login");
              setError("");
            }}
            className={`flex-1 rounded-md py-1.5 text-xs font-bold transition ${
              tab === "login"
                ? "bg-surface text-primary shadow-sm"
                : "text-subtle hover:text-ink"
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => {
              setTab("register");
              setError("");
            }}
            className={`flex-1 rounded-md py-1.5 text-xs font-bold transition ${
              tab === "register"
                ? "bg-surface text-primary shadow-sm"
                : "text-subtle hover:text-ink"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "register" && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-subtle">
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm font-semibold text-ink placeholder-slate-400 transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-subtle">
              Địa chỉ Email
            </label>
            <input
              type="email"
              placeholder="docgia@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm font-semibold text-ink placeholder-slate-400 transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-subtle">
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm font-semibold text-ink placeholder-slate-400 transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 text-sm font-black text-white hover:bg-primary/95 transition shadow-md hover:-translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading
              ? "Đang xử lý..."
              : tab === "login"
                ? "Đăng nhập"
                : "Đăng ký thành viên"}
          </button>
        </form>
      </div>
    </div>
  );
}
