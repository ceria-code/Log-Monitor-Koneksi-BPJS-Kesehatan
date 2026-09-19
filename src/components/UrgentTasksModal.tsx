import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  CheckCircle, 
  Circle, 
  AlertCircle, 
  Clock, 
  Send, 
  X,
  Volume2
} from 'lucide-react';
import { UrgentTask } from '../types/bpjs';

interface UrgentTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: UrgentTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<UrgentTask, 'id'>) => void;
  onTestPushNotification: () => void;
}

export const UrgentTasksModal: React.FC<UrgentTasksModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onToggleTask,
  onAddTask,
  onTestPushNotification
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<UrgentTask['category']>('Klaim BPJS');
  const [priority, setPriority] = useState<UrgentTask['priority']>('Mendesak');
  const [deadline, setDeadline] = useState('Hari ini, 16:00 WIB');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      title: title.trim(),
      category,
      priority,
      deadline,
      isCompleted: false,
      notes,
      assignee: 'dr. Widodo'
    });
    setTitle('');
    setNotes('');
    setShowAddForm(false);
  };

  const pendingCount = tasks.filter(t => !t.isCompleted).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Pengingat Tugas Mendesak & Push Notifikasi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {pendingCount} tugas memerlukan tindakan segera faskes
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

        {/* Quick Test Push Notification Button */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              Uji Notifikasi Suara & Push Desktop Real-Time
            </span>
          </div>
          <button
            id="btn-test-push-notification"
            type="button"
            onClick={onTestPushNotification}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Notifikasi</span>
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                task.isCompleted
                  ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                  : task.priority === 'Mendesak'
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
              >
                {task.isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-bold ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                    {task.title}
                  </p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    task.priority === 'Mendesak'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.deadline}
                  </span>
                  <span>•</span>
                  <span>{task.category}</span>
                </div>
                {task.notes && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 italic">
                    "{task.notes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Form Toggle */}
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengingat Tugas Mendesak</span>
          </button>
        ) : (
          <form onSubmit={handleSubmitNew} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Judul Tugas
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Kirim Berkas Klaim Susulan BPJS"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Klaim BPJS">Klaim BPJS</option>
                  <option value="Sertifikat SSL">Sertifikat SSL</option>
                  <option value="Antrean RS">Antrean RS</option>
                  <option value="Iuran Peserta">Iuran Peserta</option>
                  <option value="Sinkronisasi Data">Sinkronisasi Data</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Batas Waktu (Deadline)
                </label>
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="Hari ini, 17:00 WIB"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Simpan Tugas
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
