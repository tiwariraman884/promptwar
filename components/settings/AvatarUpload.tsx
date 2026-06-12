"use client";

import { useRef, useState } from "react";

interface AvatarUploadProps {
  currentAvatar: string; // base64 data URL or ""
  name: string; // for initials fallback
  onUpload: (dataUrl: string) => void;
  onRemove: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
}

export function AvatarUpload({ currentAvatar, name, onUpload, onRemove }: AvatarUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  function processFile(file: File) {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      // Compress via canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 256;
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          const ratio = Math.min(maxSize / w, maxSize / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/jpeg", 0.85);
        onUpload(compressed);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  }

  return (
    <div className="flex items-center gap-5">
      {/* Avatar preview */}
      <div
        className={`
          relative h-20 w-20 shrink-0 rounded-full overflow-hidden
          border-2 transition-all duration-200
          ${dragOver
            ? "border-[#52B788] border-dashed scale-105 shadow-lg shadow-[#52B788]/20"
            : "border-[#D1FAE5] dark:border-white/10"
          }
        `}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload profile photo"
      >
        {currentAvatar ? (
          <img src={currentAvatar} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#2D6A4F] text-white text-2xl font-bold">
            {getInitials(name)}
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition cursor-pointer group">
          <svg className="opacity-0 group-hover:opacity-100 transition text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-xl border border-[#52B788]/40 px-4 py-2 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F0FDF4] dark:hover:bg-white/5 transition"
        >
          {currentAvatar ? "Change photo" : "Upload photo"}
        </button>
        {currentAvatar && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl border border-red-200 dark:border-red-900/40 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            Remove photo
          </button>
        )}
        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        <p className="text-[11px] text-[#6B7C6E] dark:text-white/40">
          JPG, PNG or GIF. Max 2MB.
        </p>
      </div>
    </div>
  );
}
