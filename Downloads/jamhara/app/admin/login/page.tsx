"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("بيانات الدخول غير صحيحة");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="a-login">
      <div className="a-login-card">
        <div className="a-login-logo">
          <span
            style={{
              fontFamily: "var(--font-cairo)",
              fontWeight: 900,
              fontSize: "1.6rem",
              color: "#1A1E35",
            }}
          >
            جمهرة
          </span>
          <p style={{ color: "#6B7280", fontSize: ".85rem", marginTop: 4 }}>لوحة التحكم</p>
        </div>
        <form onSubmit={handleLogin}>
          <label className="a-label">البريد الإلكتروني</label>
          <input
            className="a-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            autoComplete="email"
          />
          <label className="a-label" style={{ marginTop: 14 }}>
            كلمة المرور
          </label>
          <input
            className="a-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && (
            <p style={{ color: "#DC2626", fontSize: ".82rem", marginTop: 10 }}>{error}</p>
          )}
          <button
            className="a-btn"
            type="submit"
            disabled={loading}
            style={{ marginTop: 20, width: "100%" }}
          >
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
