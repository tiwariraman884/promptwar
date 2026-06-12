"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import { SettingsDB } from "@/lib/settings-db";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { AvatarUpload } from "@/components/settings/AvatarUpload";
import { PasswordStrength } from "@/components/settings/PasswordStrength";
import { showSettingsToast } from "@/components/settings/SettingsToast";
import { IconArrowLeft, IconEye, IconEyeOff } from "@/components/icons/EcoIcons";

export default function EditAccountPage() {
  const { profile, updateProfile } = useSettings();

  // Form state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  // Password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  // Danger zone
  const [dangerOpen, setDangerOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync form with profile
  useEffect(() => {
    setName(profile.name);
    setUsername(profile.username);
    setEmail(profile.email);
    setPhone(profile.phone);
    setBio(profile.bio);
  }, [profile]);

  // Validation helpers
  function validateField(field: string, value: string): string {
    switch (field) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name too short";
        if (value.trim().length > 50) return "Name too long (max 50)";
        return "";
      case "username":
        if (value && !/^[a-zA-Z0-9_]{3,20}$/.test(value)) return "3-20 chars, letters/numbers/underscore";
        return "";
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
        return "";
      case "phone":
        if (value && !/^\+?[\d\s-]{7,15}$/.test(value.replace(/\s/g, ""))) return "Invalid phone number";
        return "";
      case "bio":
        if (value.length > 200) return `${value.length}/200 characters`;
        return "";
      default:
        return "";
    }
  }

  function handleFieldBlur(field: string, value: string) {
    const err = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err }));
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();

    // Validate all
    const newErrors: Record<string, string> = {};
    newErrors.name = validateField("name", name);
    newErrors.username = validateField("username", username);
    newErrors.email = validateField("email", email);
    newErrors.phone = validateField("phone", phone);
    newErrors.bio = validateField("bio", bio);

    const hasErrors = Object.values(newErrors).some(Boolean);
    setErrors(newErrors);
    if (hasErrors) {
      showSettingsToast("Please fix the errors below", "error");
      return;
    }

    setSaving(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));
    updateProfile({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      lastLogin: new Date().toISOString(),
    });
    setSaving(false);
    showSettingsToast("Profile updated successfully");
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw) return showSettingsToast("Enter your current password", "error");
    if (newPw.length < 8) return showSettingsToast("Password must be at least 8 characters", "error");
    if (newPw !== confirmPw) return showSettingsToast("Passwords do not match", "error");

    setChangingPw(true);
    await new Promise((r) => setTimeout(r, 800));

    // Verify current password if one exists
    if (profile.passwordHash) {
      const valid = await SettingsDB.verifyPassword(currentPw, profile.passwordHash);
      if (!valid) {
        setChangingPw(false);
        return showSettingsToast("Current password is incorrect", "error");
      }
    }

    const hash = await SettingsDB.hashPassword(newPw);
    updateProfile({ passwordHash: hash });
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setChangingPw(false);
    showSettingsToast("Password updated successfully");
  }

  function handleAvatarUpload(dataUrl: string) {
    updateProfile({ avatar: dataUrl });
    showSettingsToast("Profile photo updated");
  }

  function handleAvatarRemove() {
    updateProfile({ avatar: "" });
    showSettingsToast("Profile photo removed");
  }

  function handleDeleteAccount() {
    SettingsDB.deleteAccount();
    setDeleteModal(false);
    showSettingsToast("Account deleted. Redirecting…");
    setTimeout(() => (window.location.href = "/"), 1500);
  }

  function handleExportData() {
    const data = SettingsDB.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `greenstep-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSettingsToast("Data exported successfully");
  }

  const createdDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—";
  const lastLogin = profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="min-h-screen bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-white pb-28 md:pb-8">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Back */}
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:underline">
          <IconArrowLeft size={16} /> Settings
        </Link>

        <h1 className="text-2xl font-bold">Profile & Account</h1>

        {/* Avatar Section */}
        <SettingsCard title="Profile Photo" description="Click or drag to upload" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        }>
          <AvatarUpload
            currentAvatar={profile.avatar}
            name={profile.name || "Guest"}
            onUpload={handleAvatarUpload}
            onRemove={handleAvatarRemove}
          />
        </SettingsCard>

        {/* Personal Information */}
        <SettingsCard title="Personal Information" description="Your public profile details" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        }>
          <form onSubmit={handleProfileSave} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold mb-1.5">Full Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleFieldBlur("name", name)}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition bg-[#F8FAF5] dark:bg-[#1A2F2A] ${errors.name ? "border-red-400 focus:ring-red-300" : "border-[#52B788]/30 focus:ring-[#52B788]/30 focus:border-[#2D6A4F]"}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#6B7C6E]">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  onBlur={() => handleFieldBlur("username", username)}
                  placeholder="your_username"
                  className={`w-full rounded-xl border pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition bg-[#F8FAF5] dark:bg-[#1A2F2A] ${errors.username ? "border-red-400 focus:ring-red-300" : "border-[#52B788]/30 focus:ring-[#52B788]/30 focus:border-[#2D6A4F]"}`}
                />
              </div>
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleFieldBlur("email", email)}
                placeholder="you@example.com"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition bg-[#F8FAF5] dark:bg-[#1A2F2A] ${errors.email ? "border-red-400 focus:ring-red-300" : "border-[#52B788]/30 focus:ring-[#52B788]/30 focus:border-[#2D6A4F]"}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold mb-1.5">Phone <span className="text-[#6B7C6E] font-normal">(optional)</span></label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => handleFieldBlur("phone", phone)}
                placeholder="+91 98765 43210"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition bg-[#F8FAF5] dark:bg-[#1A2F2A] ${errors.phone ? "border-red-400 focus:ring-red-300" : "border-[#52B788]/30 focus:ring-[#52B788]/30 focus:border-[#2D6A4F]"}`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                onBlur={() => handleFieldBlur("bio", bio)}
                placeholder="Tell us about yourself…"
                rows={3}
                maxLength={200}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition resize-none bg-[#F8FAF5] dark:bg-[#1A2F2A] ${errors.bio ? "border-red-400 focus:ring-red-300" : "border-[#52B788]/30 focus:ring-[#52B788]/30 focus:border-[#2D6A4F]"}`}
              />
              <p className="mt-1 text-right text-xs text-[#6B7C6E] dark:text-white/40">{bio.length}/200</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[#2D6A4F] py-3 text-sm font-bold text-white hover:bg-[#1B4332] transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </form>
        </SettingsCard>

        {/* Password & Security */}
        <SettingsCard title="Password & Security" description="Keep your account secure" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        }>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 pr-11 text-sm focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#52B788]/30 transition"
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

            <div>
              <label className="block text-sm font-semibold mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 pr-11 text-sm focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#52B788]/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7C6E] hover:text-[#2D6A4F] dark:text-white/50 dark:hover:text-white transition"
                >
                  {showNew ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
              <PasswordStrength password={newPw} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition bg-[#F8FAF5] dark:bg-[#1A2F2A] ${
                  confirmPw && confirmPw !== newPw
                    ? "border-red-400 focus:ring-red-300"
                    : confirmPw && confirmPw === newPw
                    ? "border-emerald-400 focus:ring-emerald-300"
                    : "border-[#52B788]/30 focus:ring-[#52B788]/30"
                }`}
              />
              {confirmPw && confirmPw !== newPw && <p className="mt-1 text-xs text-red-500">Passwords don&apos;t match</p>}
              {confirmPw && confirmPw === newPw && <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">✓ Passwords match</p>}
            </div>

            <button
              type="submit"
              disabled={changingPw}
              className="w-full rounded-xl bg-[#2D6A4F] py-3 text-sm font-bold text-white hover:bg-[#1B4332] transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {changingPw ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Updating…
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </SettingsCard>

        {/* Account Info */}
        <SettingsCard title="Account Information" description="Read-only account details" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        }>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-[#6B7C6E] dark:text-white/40 uppercase tracking-wider mb-1">Account Created</p>
              <p className="text-sm font-medium">{createdDate}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#6B7C6E] dark:text-white/40 uppercase tracking-wider mb-1">Last Login</p>
              <p className="text-sm font-medium">{lastLogin}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#6B7C6E] dark:text-white/40 uppercase tracking-wider mb-1">Account ID</p>
              <p className="text-sm font-mono text-[#6B7C6E] dark:text-white/50">{profile.id?.slice(0, 8)}…</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportData}
            className="mt-4 rounded-xl border border-[#52B788]/30 px-4 py-2.5 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F0FDF4] dark:hover:bg-white/5 transition w-full"
          >
            📦 Export All Data
          </button>
        </SettingsCard>

        {/* Danger Zone */}
        <SettingsCard danger title="Danger Zone" description="Irreversible actions" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
        }>
          <button
            type="button"
            onClick={() => setDangerOpen((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-bold text-red-600 dark:text-red-400">Delete Account</span>
            <span className="text-red-400 text-xs">{dangerOpen ? "▲" : "▼"}</span>
          </button>
          {dangerOpen && (
            <div className="mt-4 pt-4 border-t border-red-100 dark:border-red-900/30">
              <p className="text-sm text-[#6B7C6E] dark:text-white/50 mb-4">
                Permanently delete your account and all data. This cannot be undone.
              </p>
              <button
                type="button"
                onClick={() => setDeleteModal(true)}
                className="rounded-xl border border-red-500 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                Delete my account
              </button>
            </div>
          )}
        </SettingsCard>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0B1815] p-6 shadow-2xl border border-red-200 dark:border-red-900/50">
            <h2 className="text-xl font-bold text-red-600 mb-2">Delete your GreenStep account?</h2>
            <p className="text-sm text-[#6B7C6E] dark:text-white/60 mb-5">
              This will permanently delete all your data. This cannot be undone.
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
