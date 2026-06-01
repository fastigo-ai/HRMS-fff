import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  Clock,
  Search,
  Tag,
  Shield,
  X
} from 'lucide-react';
import { DatabaseService } from '../../services/api';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HolidayCalendar({ canEdit = false, triggerToast }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'mandatory' | 'optional'
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({ date: '', name: '', description: '', isOptional: false });
  const [submitting, setSubmitting] = useState(false);

  // ─── Load holidays from backend ───────────────────────────────────────────
  const loadHolidays = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getHolidays();
      setHolidays(data || []);
    } catch (err) {
      triggerToast?.('Failed to load holidays.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHolidays(); }, []);

  // ─── Calendar grid helpers ─────────────────────────────────────────────────
  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    // leading empty cells
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  // Build a set of holiday date strings for this month for O(1) lookup
  const holidayMap = useMemo(() => {
    const map = {};
    holidays.forEach(h => {
      const hDate = new Date(h.date);
      const key = `${hDate.getFullYear()}-${hDate.getMonth()}-${hDate.getDate()}`;
      map[key] = h;
    });
    return map;
  }, [holidays]);

  const getCellHoliday = (day) => {
    if (!day) return null;
    return holidayMap[`${viewYear}-${viewMonth}-${day}`] || null;
  };

  const isToday = (day) =>
    day &&
    today.getDate() === day &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;

  // ─── Navigate months ───────────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // ─── Filter upcoming / side list ──────────────────────────────────────────
  const filteredHolidays = useMemo(() => {
    return holidays
      .filter(h => {
        const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = filterType === 'all'
          ? true
          : filterType === 'optional' ? h.isOptional : !h.isOptional;
        return matchSearch && matchType;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [holidays, searchQuery, filterType]);

  const upcomingHolidays = filteredHolidays.filter(h => new Date(h.date) >= today);
  const pastHolidays    = filteredHolidays.filter(h => new Date(h.date) < today);

  // ─── Add holiday ───────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.date || !form.name.trim()) {
      triggerToast?.('Date and holiday name are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await DatabaseService.addHoliday(form);
      await loadHolidays();
      setShowAddModal(false);
      setForm({ date: '', name: '', description: '', isOptional: false });
      triggerToast?.(`Holiday "${form.name}" added successfully!`);
    } catch (err) {
      triggerToast?.(err.message || 'Failed to add holiday.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete holiday ────────────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    setDeletingId(id);
    try {
      await DatabaseService.deleteHoliday(id);
      setHolidays(prev => prev.filter(h => h._id !== id));
      triggerToast?.(`Holiday "${name}" removed.`);
    } catch (err) {
      triggerToast?.(err.message || 'Failed to delete holiday.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Format helpers ────────────────────────────────────────────────────────
  const fmtDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const daysUntil = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - today) / 86400000);
    if (diff === 0) return 'Today!';
    if (diff === 1) return 'Tomorrow';
    if (diff < 0) return `${Math.abs(diff)}d ago`;
    return `in ${diff} days`;
  };

  // ─── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-80" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-100 dark:bg-slate-900 rounded-2xl" />
          <div className="h-96 bg-slate-100 dark:bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PartyPopper className="w-6 h-6 text-indigo-500" />
            Holiday Calendar
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {canEdit ? 'Manage company-wide public holidays and optional observances.' : 'View upcoming company holidays and plan your schedule.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Role badge */}
          {canEdit ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> HR Edit Access
            </span>
          ) : (
            <span className="px-3 py-1.5 text-[10px] font-extrabold text-slate-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl uppercase tracking-wider">
              View Only
            </span>
          )}

          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow shadow-indigo-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              Add Holiday
            </button>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Holidays', value: holidays.length, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
          { label: 'Upcoming', value: upcomingHolidays.length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Mandatory', value: holidays.filter(h => !h.isOptional).length, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-900' },
          { label: 'Optional', value: holidays.filter(h => h.isOptional).length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-1`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
            <span className={`text-2xl font-extrabold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Main grid: Calendar + List ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Calendar view (left 2/3) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5">

          {/* Month navigator */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h3>
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <button onClick={prevMonth} className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }}
                className="px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                Today
              </button>
              <button onClick={nextMonth} className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2">{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((day, idx) => {
              const hol = getCellHoliday(day);
              const todayCell = isToday(day);

              let cellClass = 'h-14 rounded-xl p-1.5 flex flex-col items-start justify-between text-xs transition cursor-default ';
              let numClass = 'w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ';

              if (!day) {
                return <div key={idx} className="h-14" />;
              }

              if (hol) {
                if (hol.isOptional) {
                  cellClass += 'bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/60';
                  numClass += 'bg-amber-500 text-white';
                } else {
                  cellClass += 'bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60';
                  numClass += 'bg-indigo-600 text-white';
                }
              } else if (todayCell) {
                cellClass += 'bg-slate-900 dark:bg-white border border-slate-900 dark:border-white';
                numClass += 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white';
              } else {
                cellClass += 'bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800';
                numClass += 'text-slate-700 dark:text-slate-300';
              }

              return (
                <div key={idx} className={cellClass} title={hol ? `${hol.name}${hol.isOptional ? ' (Optional)' : ''}` : ''}>
                  <span className={numClass}>{day}</span>
                  {hol && (
                    <span className={`text-[8px] font-bold leading-tight truncate w-full ${hol.isOptional ? 'text-amber-700 dark:text-amber-400' : 'text-indigo-700 dark:text-indigo-400'}`}>
                      {hol.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 pt-3 border-t border-slate-50 dark:border-slate-900">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-600" />
              <span className="text-[10px] font-semibold text-slate-500">Mandatory Holiday</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500" />
              <span className="text-[10px] font-semibold text-slate-500">Optional Holiday</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-900 dark:bg-white" />
              <span className="text-[10px] font-semibold text-slate-500">Today</span>
            </div>
          </div>
        </div>

        {/* Holiday list panel (right 1/3) */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4 min-h-0 overflow-hidden">
          
          {/* Search + filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search holidays..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
              />
            </div>
            <div className="flex gap-1.5">
              {['all', 'mandatory', 'optional'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg capitalize transition ${
                    filterType === type
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 min-h-0">
            {upcomingHolidays.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Upcoming ({upcomingHolidays.length})
                </p>
                <div className="space-y-2">
                  {upcomingHolidays.map(h => (
                    <HolidayCard key={h._id} h={h} canEdit={canEdit} deletingId={deletingId} onDelete={handleDelete} fmtDate={fmtDate} daysUntil={daysUntil} />
                  ))}
                </div>
              </div>
            )}

            {pastHolidays.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-3">
                  Past
                </p>
                <div className="space-y-2 opacity-60">
                  {pastHolidays.slice(-5).reverse().map(h => (
                    <HolidayCard key={h._id} h={h} canEdit={canEdit} deletingId={deletingId} onDelete={handleDelete} fmtDate={fmtDate} daysUntil={daysUntil} isPast />
                  ))}
                </div>
              </div>
            )}

            {filteredHolidays.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-xs text-slate-400 font-semibold">
                  {searchQuery ? 'No holidays match your search.' : 'No holidays added yet.'}
                </p>
                {canEdit && !searchQuery && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    + Add first holiday
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Holiday Modal (HR only) ── */}
      {canEdit && showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/20 p-6 space-y-5 animate-fade-in">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Add New Holiday</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">This will apply company-wide for all employees.</p>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setForm({ date: '', name: '', description: '', isOptional: false }); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Holiday Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Holiday Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Diwali, Christmas, Independence Day..."
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Description <span className="text-slate-400">(optional)</span></label>
                <textarea
                  rows="2"
                  placeholder="Brief note about this holiday..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white leading-normal resize-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.isOptional}
                    onChange={e => setForm(f => ({ ...f, isOptional: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 dark:bg-slate-800 peer-checked:bg-amber-500 rounded-full transition" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Optional / Restricted Holiday</span>
                  <p className="text-[10px] text-slate-400">Employee can choose to avail or work on this day.</p>
                </div>
              </label>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setForm({ date: '', name: '', description: '', isOptional: false }); }}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow shadow-indigo-600/20 transition"
                >
                  {submitting ? 'Adding...' : 'Add Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Holiday Card sub-component ─────────────────────────────────────────────
function HolidayCard({ h, canEdit, deletingId, onDelete, fmtDate, daysUntil, isPast = false }) {
  const isOptional = h.isOptional;
  const pillClass = isOptional
    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
    : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60';
  const dotClass = isOptional ? 'bg-amber-500' : 'bg-indigo-600';

  return (
    <div className={`flex items-start justify-between gap-2 p-3 rounded-xl border transition ${
      isPast
        ? 'border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20'
        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:shadow-sm'
    }`}>
      <div className="flex items-start gap-2.5 min-w-0">
        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotClass}`} />
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{h.name}</p>
          <p className="text-[10px] text-slate-400 font-medium">{fmtDate(h.date)}</p>
          {h.description && (
            <p className="text-[10px] text-slate-400 italic truncate mt-0.5">"{h.description}"</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${pillClass}`}>
              {isOptional ? 'Optional' : 'Mandatory'}
            </span>
            {!isPast && (
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                {daysUntil(h.date)}
              </span>
            )}
          </div>
        </div>
      </div>

      {canEdit && (
        <button
          onClick={() => onDelete(h._id, h.name)}
          disabled={deletingId === h._id}
          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition shrink-0 disabled:opacity-40"
          title="Delete holiday"
        >
          {deletingId === h._id
            ? <span className="block w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
            : <Trash2 className="w-3.5 h-3.5" />
          }
        </button>
      )}
    </div>
  );
}
