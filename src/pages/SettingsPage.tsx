import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, Bell, Shield, Palette, LogOut,
  ChevronRight, Moon, Sun, Check
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SettingsPageProps {
  onClose: () => void;
}

type Section = "profile" | "notifications" | "appearance" | "privacy";

const ACCENT_COLORS = [
  { name: "Violet", class: "bg-violet-500", value: "violet" },
  { name: "Blue", class: "bg-blue-500", value: "blue" },
  { name: "Emerald", class: "bg-emerald-500", value: "emerald" },
  { name: "Rose", class: "bg-rose-500", value: "rose" },
  { name: "Amber", class: "bg-amber-500", value: "amber" },
  { name: "Cyan", class: "bg-cyan-500", value: "cyan" },
];

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const { profile, updateUserProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile({ displayName, bio });
      toast({ title: "Profile saved!" });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const navItems = [
    { id: "profile", icon: User, label: "Profile" },
    { id: "appearance", icon: Palette, label: "Appearance" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "privacy", icon: Shield, label: "Privacy & Security" },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <h2 className="font-semibold text-lg flex-1">Settings</h2>
        <motion.button whileHover={{ scale: 1.1 }} onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar nav */}
        <div className="w-52 border-r border-border flex flex-col p-3 gap-1 bg-sidebar/50">
          {profile && (
            <div className="flex flex-col items-center p-4 mb-2">
              <AvatarWithStatus
                photoURL={profile.photoURL}
                displayName={profile.displayName}
                uid={profile.uid}
                size="lg"
                online
                showStatus
              />
              <p className="font-semibold text-sm mt-2 text-center">{profile.displayName}</p>
              <p className="text-xs text-muted-foreground">@{profile.username}</p>
            </div>
          )}

          {navItems.map(({ id, icon: Icon, label }) => (
            <motion.button
              key={id}
              onClick={() => setActiveSection(id)}
              whileHover={{ x: 2 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                activeSection === id
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {activeSection === id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </motion.button>
          ))}

          <div className="mt-auto">
            <motion.button
              onClick={logout}
              whileHover={{ x: 2 }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeSection === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-base font-semibold">Profile Information</h3>

                {/* Avatar display (read-only — Storage not available on free plan) */}
                <div className="flex items-center gap-4">
                  {profile && (
                    <AvatarWithStatus
                      photoURL={profile.photoURL}
                      displayName={profile.displayName}
                      uid={profile.uid}
                      size="xl"
                      showStatus={false}
                    />
                  )}
                  <div>
                    <p className="font-medium">{profile?.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.photoURL
                        ? "Profile photo from Google"
                        : "Avatar auto-generated from your name"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Display Name</label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      autoComplete="name"
                      className="bg-muted/50 border-border rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell people about yourself..."
                      className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none h-24 placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Email</label>
                    <Input
                      value={profile?.email || ""}
                      disabled
                      className="bg-muted/30 border-border rounded-xl h-11 opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 h-11"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </motion.div>
            )}

            {activeSection === "appearance" && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-base font-semibold">Appearance</h3>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">Theme</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(["light", "dark"] as const).map((t) => (
                      <motion.button
                        key={t}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => t !== theme && toggleTheme()}
                        className={cn(
                          "relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                          theme === t ? "border-primary bg-primary/10" : "border-border bg-muted/30"
                        )}
                      >
                        {t === "dark" ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                        <span className="text-sm font-medium capitalize">{t}</span>
                        {theme === t && (
                          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">Accent Color</p>
                  <div className="flex gap-3 flex-wrap">
                    {ACCENT_COLORS.map((color) => (
                      <motion.button
                        key={color.value}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                          "w-8 h-8 rounded-full",
                          color.class,
                          "ring-2 ring-offset-2 ring-offset-background ring-transparent hover:ring-current transition-all"
                        )}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-base font-semibold">Notifications</h3>
                {["Message notifications", "Group notifications", "Mention alerts", "Sound effects", "Desktop notifications"].map((item) => (
                  <div key={item} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <span className="text-sm">{item}</span>
                    <motion.div whileTap={{ scale: 0.9 }} className="w-11 h-6 rounded-full bg-primary relative cursor-pointer">
                      <motion.div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow" animate={{ x: 20 }} />
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSection === "privacy" && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-base font-semibold">Privacy & Security</h3>
                {["Show read receipts", "Show online status", "Show last seen", "Allow message reactions"].map((item) => (
                  <div key={item} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <span className="text-sm">{item}</span>
                    <motion.div whileTap={{ scale: 0.9 }} className="w-11 h-6 rounded-full bg-primary relative cursor-pointer">
                      <motion.div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow" animate={{ x: 20 }} />
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
