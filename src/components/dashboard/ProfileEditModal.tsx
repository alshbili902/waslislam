import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, X, Check, Camera, MapPin, Mail } from 'lucide-react';
import { UserProfile } from '../../types';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSave: (updates: Partial<UserProfile>) => Promise<void>;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [city, setCity] = useState(user?.city || 'مكة المكرمة');
  const [country, setCountry] = useState(user?.country || 'المملكة العربية السعودية');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  useModalScrollLock(isOpen, {
    onClose,
    closeOnEsc: true,
  });

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        city: city.trim(),
        country: country.trim(),
        bio: bio.trim() || undefined,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm wasl-modal-overlay animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-emerald-950 rounded-3xl shadow-2xl border border-emerald-900/10 dark:border-emerald-800/60 overflow-hidden flex flex-col max-h-[min(88dvh,calc(100dvh-3rem))] wasl-modal-overlay"
      >
        <div className="sticky top-0 z-20 shrink-0 p-5 border-b border-slate-100 dark:border-emerald-900/60 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-md flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white font-amiri">
            تَعْدِيلُ المَلَفِّ الشَّخْصِي
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto wasl-modal-scrollable">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 p-0.5 shadow-md shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full rounded-[14px] object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-[14px] bg-emerald-900 flex items-center justify-center text-amber-300 font-bold text-2xl font-amiri">
                  {fullName ? fullName[0] : 'و'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                رابط الصورة الرمزية
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                dir="ltr"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white text-right"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              اسم العميل
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: عبدالرحمن الشبيلي"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                المدينة
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                الدولة
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              اسم المستخدم (معرّف الحساب الثابت)
            </label>
            <input
              type="text"
              disabled
              value={user?.username ? `@${user.username}` : ''}
              dir="ltr"
              className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl bg-slate-100 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-800/40 text-emerald-800 dark:text-amber-300 text-right cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              اسم المستخدم هو معرّفك الدائم المعتمد للدخول إلى المنصة
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer transition-all"
            >
              {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
