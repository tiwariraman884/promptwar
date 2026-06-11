"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconEye, IconEyeOff } from "@/components/icons/EcoIcons";

function Toast({ message, type = "success" }: { message: string; type?: "success" | "error" }) {
  if (!message) return null;
  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-full px-6 py-3 text-sm font-bold text-white shadow-lg animate-in fade-in slide-in-from-top-4 ${
        type === "error" ? "bg-red-600" : "bg-[#2D6A4F]"
      }`}
    >
      {message}
    </div>
  );
}

function StrengthBar({ password }: { password: string }) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;

  const labels = ["", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["", "bg-red-500", "bg-amber-400", "bg-yellow-400", "bg-[#2D6A4F]"];

  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= score ? colors[score] : "bg-gray-200 dark:bg-white/10"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-semibold ${score <= 1 ? "text-red-500" : score === 2 ? "text-amber-500" : score === 3 ? "text-yellow-600" : "text-[#2D6A4F]"}`}>
        {labels[score]}
      </p>
    </div>
  );
}

export default function EditAccountPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Load user data from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("eco_user");
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user.name) setName(user.name);
        if (user.email) setEmail(user.email);
      } catch { /* ignore */ }
    }
  }, []);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 3500);
  }

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return showToast("Name cannot be empty.", "error");
    // Save back to localStorage
    const raw = localStorage.getItem("eco_user");
    let user: Record<string, string> = {};
    if (raw) { try { user = JSON.parse(raw); } catch { /* ignore */ } }
    user.name = name.trim();
    localStorage.setItem("eco_user", JSON.stringify(user));
    showToast("✓ Profile updated");
  }

  function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw) return showToast("Enter your current password.", "error");
    if (newPw.length < 8) return showToast("New password must be at least 8 characters.", "error");
    if (newPw !== confirmPw) return showToast("Passwords do not match.", "error");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    showToast("✓ Password updated");
  }

  function handleDeleteAccount() {
    localStorage.removeItem("eco_user");
    setDeleteModal(false);
    showToast("Account deleted. Redirecting…");
    setTimeout(() => (window.location.href = "/"), 1500);
  }

  return (
    <div className="min-h-screen bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-white">
      <Toast message={toast} type={toastType} />

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:underline"
        >
          <IconArrowLeft size={16} /> Back
        </Link>

        <h1 className="text-2xl font-bold">Edit Account</h1>

        {/* Profile Information */}
        <section className="rounded-2xl border border-[#D1FAE5] dark:border-white/10 bg-white dark:bg-[#111C18] p-6">
          <h2 className="text-base font-bold mb-5">Profile Information</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative h-20 w-20 shrink-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2D6A4F] text-white text-2xl font-bold">
                {name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast("Photo upload coming soon")}
              className="rounded-xl border border-[#52B788]/40 px-4 py-2 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F0FDF4] dark:hover:bg-white/5 transition"
            >
              Change photo
            </button>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Email</label>
              <div className="flex items-center gap-3">
                <input
                  type="email"
                  readOnly
                  value={email || "user@example.com"}
                  className="flex-1 rounded-xl border border-[#52B788]/30 bg-[#F8FAF5]/60 dark:bg-[#1A2F2A]/60 px-4 py-2.5 text-sm opacity-70 cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => showToast("Email change link sent!")}
                  className="shrink-0 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:underline"
                >
                  Change
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Phone Number <span className="text-[#6B7C6E] font-normal">(optional)</span></label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#2D6A4F] py-3 text-sm font-bold text-white hover:bg-[#1B4332] transition"
            >
              Save Profile
            </button>
          </form>
        </section>

        {/* Password & Security */}
        <section className="rounded-2xl border border-[#D1FAE5] dark:border-white/10 bg-white dark:bg-[#111C18] p-6">
          <h2 className="text-base font-bold mb-5">Password &amp; Security</h2>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-sm font-semibold mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 pr-11 text-sm focus:border-[#2D6A4F] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7C6E] hover:text-[#2D6A4F] dark:text-white/50 dark:hover:text-white transition"
                >
                  {showCurrent ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-semibold mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 pr-11 text-sm focus:border-[#2D6A4F] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7C6E] hover:text-[#2D6A4F] dark:text-white/50 dark:hover:text-white transition"
                >
                  {showNew ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
              <StrengthBar password={newPw} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-semibold mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#2D6A4F] py-3 text-sm font-bold text-white hover:bg-[#1B4332] transition"
            >
              Update Password
            </button>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="rounded-2xl border-2 border-red-200 dark:border-red-900/50 bg-white dark:bg-[#111C18] overflow-hidden">
          <button
            type="button"
            onClick={() => setDangerOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <span className="font-bold text-red-600">Danger Zone</span>
            <span className="text-red-400 text-sm">{dangerOpen ? "▲" : "▼"}</span>
          </button>
          {dangerOpen && (
            <div className="border-t border-red-100 dark:border-red-900/30 px-6 py-5">
              <p className="text-sm text-[#6B7C6E] dark:text-white/60 mb-4">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
              <button
                type="button"
                onClick={() => setDeleteModal(true)}
                className="rounded-xl border border-red-500 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                Delete account
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0B1815] p-6 shadow-2xl border border-red-200 dark:border-red-900/50">
            <h2 className="text-xl font-bold text-red-600 mb-2">Delete your GreenStep account?</h2>
            <p className="text-sm text-[#6B7C6E] dark:text-white/60 mb-5">
              This will permanently delete your footprint data, groups, and offset history. This cannot be undone.
            </p>
            <label className="block text-sm font-semibold mb-2">
              Type <span className="font-mono text-red-600">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="mb-4 w-full rounded-xl border border-red-200 dark:border-red-900/40 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none"
              placeholder="DELETE"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setDeleteModal(false); setDeleteConfirm(""); }}
                className="flex-1 rounded-xl border border-[#D1FAE5] dark:border-white/10 py-2.5 text-sm font-semibold hover:bg-[#F0FDF4] dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirm !== "DELETE"}
                onClick={handleDeleteAccount}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Permanently delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
