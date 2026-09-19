import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Building2, 
  ShieldCheck, 
  Check, 
  X, 
  KeyRound,
  LogOut
} from 'lucide-react';
import { UserSession } from '../types/bpjs';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onUpdateUser: (newUser: UserSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser
}) => {
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [faskesName, setFaskesName] = useState(currentUser.faskesName);
  const [faskesCode, setFaskesCode] = useState(currentUser.faskesCode);
  const [pin, setPin] = useState('****');

  if (!isOpen) return null;

  const presets = [
    { name: 'dr. Widodo', role: 'Dokter Penanggung Jawab Pelayanan (DPJP)', faskesName: 'Klinik Pratama Rawat Inap Sehat', faskesCode: '0112B001' },
    { name: 'Siti Rahmawati, S.Kom', role: 'Petugas IT & Bridging JKN', faskesName: 'RSUD Kabupaten Sehat', faskesCode: '0112R001' },
    { name: 'Bambang Irawan', role: 'Verifikator Klaim BPJS Kesehatan', faskesName: 'Kantor Cabang BPJS Utama', faskesCode: '0100C001' }
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    setName(p.name);
    setRole(p.role);
    setFaskesName(p.faskesName);
    setFaskesCode(p.faskesCode);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      role,
      faskesName,
      faskesCode
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Autentikasi Pengguna & Sesi Faskes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Keamanan akses data bridging & identitas operator
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Account Switcher */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">
            Pilih Profil Cepat
          </label>
          <div className="space-y-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                  name === p.name
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 font-bold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <p className="font-bold">{p.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{p.role}</p>
                </div>
                {name === p.name && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Operator
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Fasilitas Kesehatan (Faskes)
            </label>
            <div className="relative">
              <input
                type="text"
                value={faskesName}
                onChange={(e) => setFaskesName(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                required
              />
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kode Faskes BPJS
              </label>
              <input
                type="text"
                value={faskesCode}
                onChange={(e) => setFaskesCode(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                PIN Keamanan
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
            >
              Simpan & Masuk
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
