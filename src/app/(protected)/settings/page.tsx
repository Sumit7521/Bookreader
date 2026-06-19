"use client";

import { useState } from "react";
import { useSettings } from "@/components/providers/SettingsProvider";
import { updateSettingsAction, updateProfilePictureAction } from "@/actions/settings";
import { getCloudinarySignatureAction } from "@/actions/upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, User as UserIcon, Monitor, Moon, Sun, BookOpen } from "lucide-react";
import { Label } from "@/components/ui/label";
import Image from "next/image";

const ACCENT_COLORS = [
  { name: "Amber", value: "#f59e0b" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Purple", value: "#a855f7" },
  { name: "Stone", value: "#78716c" },
];

export default function SettingsPage() {
  const settings = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveSettings = async (updates: any) => {
    setIsSaving(true);
    settings.updateLocalSettings(updates);
    await updateSettingsAction(updates);
    setIsSaving(false);
  };

  const uploadToCloudinary = async (file: File) => {
    const sigRes = await getCloudinarySignatureAction();
    if (!sigRes.success || !sigRes.signature || !sigRes.timestamp || !sigRes.apiKey) {
      throw new Error(sigRes.error || "Failed to get upload signature");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sigRes.apiKey);
    formData.append("timestamp", sigRes.timestamp.toString());
    formData.append("signature", sigRes.signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${sigRes.cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    
    // Apply Cloudinary optimization
    const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
    return optimizedUrl;
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingProfile(true);
    try {
      const url = await uploadToCloudinary(file);
      settings.updateLocalSettings({ profilePicture: url });
      await updateProfilePictureAction(url);
    } catch (error) {
      console.error(error);
      alert("Failed to upload profile picture");
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const url = await uploadToCloudinary(file);
      await handleSaveSettings({ backgroundImage: url });
    } catch (error) {
      console.error(error);
      alert("Failed to upload background");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">Settings</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2">Customize your reading and writing workspace.</p>
      </div>

      <Card className="border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
          <CardDescription>Update your avatar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0">
              {settings.profilePicture ? (
                <Image src={settings.profilePicture} alt="Profile" fill className="object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-stone-400" />
              )}
              {isUploadingProfile && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div>
              <input type="file" id="profile-upload" className="hidden" accept="image/*" onChange={handleProfileUpload} disabled={isUploadingProfile} />
              <Label htmlFor="profile-upload" className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950 disabled:pointer-events-none disabled:opacity-50 bg-stone-900 text-stone-50 hover:bg-stone-900/90 h-9 px-4 py-2 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-50/90 shadow">
                <Upload className="w-4 h-4 mr-2" />
                Upload Picture
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Appearance</CardTitle>
          <CardDescription>Customize how the app looks on your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          <div className="space-y-3">
            <Label className="text-base font-semibold">Theme</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: "light", label: "Light", icon: Sun, class: "bg-white border-stone-200 text-stone-900" },
                { id: "dark", label: "Dark", icon: Moon, class: "bg-stone-950 border-stone-800 text-stone-300" },
                { id: "sepia", label: "Sepia", icon: BookOpen, class: "bg-[#f4ecd8] border-[#e4d9c0] text-[#5c4b37]" },
                { id: "system", label: "System", icon: Monitor, class: "bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSaveSettings({ theme: t.id })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${settings.theme === t.id ? "border-[var(--accent-color)] shadow-md ring-1 ring-[var(--accent-color)]" : t.class} hover:opacity-80`}
                >
                  <t.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Accent Color</Label>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleSaveSettings({ accentColor: color.value })}
                  className={`w-10 h-10 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${settings.accentColor === color.value ? "ring-2 ring-offset-2 ring-stone-900 dark:ring-stone-100" : ""}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Font Family</Label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: "sans", label: "Inter (Sans)", fontClass: "font-sans" },
                { id: "serif", label: "Georgia (Serif)", fontClass: "font-serif" },
                { id: "mono", label: "SF Mono", fontClass: "font-mono" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleSaveSettings({ fontFamily: f.id })}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${f.fontClass} ${settings.fontFamily === f.id ? "border-[var(--accent-color)] bg-amber-50 dark:bg-stone-900 text-[var(--accent-color)]" : "border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Background Image</Label>
            <div className="flex gap-4 items-center">
              <input type="file" id="bg-upload" className="hidden" accept="image/*" onChange={handleBgUpload} />
              <Label htmlFor="bg-upload" className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-stone-200 bg-white hover:bg-stone-100 hover:text-stone-900 h-9 px-4 py-2 dark:border-stone-800 dark:bg-stone-950 dark:hover:bg-stone-800 dark:hover:text-stone-50">
                <Upload className="w-4 h-4 mr-2" />
                Upload Background
              </Label>
              {settings.backgroundImage && (
                <Button variant="ghost" onClick={() => handleSaveSettings({ backgroundImage: "" })} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                  Remove
                </Button>
              )}
            </div>
            {settings.backgroundImage && (
              <div className="mt-4 relative w-full h-40 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800">
                <Image src={settings.backgroundImage} alt="Background" fill className="object-cover" />
              </div>
            )}
          </div>

        </CardContent>
      </Card>
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-stone-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center text-sm font-medium animate-in slide-in-from-bottom-2">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
}
