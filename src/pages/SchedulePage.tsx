import React from "react";
import Header from "@/components/Header";
// import { meetingsData } from "@/data/mockData"; // Remove mock data import
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, Search, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from '@/lib/supabaseClient';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { usePlan } from '@/hooks/usePlan';
import { toast } from '@/hooks/use-toast';

const SchedulePage = () => {
  const [viewMode, setViewMode] = useState("Timeline");
  const [currentMonth, setCurrentMonth] = useState(0);
  const months = ["January", "February", "March", "April", "May", "June"];
  const timeSlots = [
    "09:00 am", "10:00 am", "11:00 am", "12:00 pm",
    "01:00 pm", "02:00 pm", "03:00 pm", "04:00 pm", "05:00 pm"
  ];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    duration: "15 min",
    customDuration: "",
    repeat: "None",
    customRepeat: "",
    attendees: "",
    location: "",
    link: "",
    purpose: ""
  });
  const [formError, setFormError] = useState<{ title?: string; date?: string; time?: string; duration?: string; purpose?: string }>({});
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [openScheduleMenu, setOpenScheduleMenu] = useState<string | null>(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dateViewMode, setDateViewMode] = useState<'today' | 'week' | 'month'>('month');
  const [animatingMenuKey, setAnimatingMenuKey] = useState<string | null>(null);
  const [menuAnimationState, setMenuAnimationState] = useState<'entering' | 'entered' | 'exiting' | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [user, setUser] = useState(null);
  const { plan } = usePlan();

  // Handle form input
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Helper to count schedules for the current month
  const schedulesThisMonth = schedules.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Plan limit enforcement
    if (plan === 'starter' && schedulesThisMonth >= 50 && !editingId) {
      toast({ title: 'Plan limit reached please upgrade' });
      return;
    }
    let errors: { title?: string; date?: string; time?: string; duration?: string; purpose?: string } = {};
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.purpose || !form.purpose.trim()) errors.purpose = "Purpose is required";
    if (!form.date) errors.date = "Date required";
    if (!form.time) errors.time = "Time required";
    if (!form.duration && !form.customDuration) errors.duration = "Duration required";
    setFormError(errors);
    if (Object.keys(errors).length > 0) return;
    if (editingId) {
      // Update existing schedule
      const { error } = await supabase.from('schedules').update({
        title: form.title,
        purpose: form.purpose,
        date: form.date,
        time: form.time,
        duration: form.duration === "Custom" ? form.customDuration : form.duration,
        repeat: form.repeat,
        custom_repeat: form.customRepeat,
        attendees: form.attendees,
        location: form.location,
        link: form.link,
        user_id: user?.id,
      }).eq('id', editingId);
      if (error) {
        setFormError({ title: 'Failed to update schedule. Please try again.' });
        return;
      }
    } else {
      // Insert new schedule
      const { error } = await supabase.from('schedules').insert([
        {
          title: form.title,
          purpose: form.purpose,
          date: form.date,
          time: form.time,
          duration: form.duration === "Custom" ? form.customDuration : form.duration,
          repeat: form.repeat,
          custom_repeat: form.customRepeat,
          attendees: form.attendees,
          location: form.location,
          link: form.link,
          user_id: user?.id,
        }
      ]);
      if (error) {
        setFormError({ title: 'Failed to add schedule. Please try again.' });
        return;
      }
    }
    setShowModal(false);
    setEditingId(null);
    setForm({ title: "", purpose: "", date: "", time: "", duration: "15 min", customDuration: "", repeat: "None", customRepeat: "", attendees: "", location: "", link: "" });
    setFormError({});
    fetchSchedules();
  };

  // Fetch schedules from Supabase
  const fetchSchedules = async () => {
    setLoadingSchedules(true);
    const { data, error } = await supabase.from('schedules').select('*').eq('user_id', user?.id).order('date', { ascending: true }).order('time', { ascending: true });
    setSchedules(data || []);
    setLoadingSchedules(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  useEffect(() => {
    if (user?.id) fetchSchedules();
  }, [user]);

  // No meetings data, so show empty state
  // const meetingsData = [];

  // Helper to check if a meeting is today
  const isToday = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // Delete schedule
  const handleDeleteSchedule = async (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const getDayIndex = (dateStr) => new Date(dateStr).getDay();
  const getTimeIndex = (timeStr) => timeSlots.findIndex(slot => slot === timeStr);

  const handleEditSchedule = (item) => {
    setForm({
      title: item.title || "",
      purpose: item.purpose || "",
      date: item.date || "",
      time: item.time || "",
      duration: ["15 min", "30 min", "1 hour", "2 hours"].includes(item.duration) ? item.duration : "Custom",
      customDuration: ["15 min", "30 min", "1 hour", "2 hours"].includes(item.duration) ? "" : item.duration || "",
      repeat: item.repeat || "None",
      customRepeat: item.custom_repeat || "",
      attendees: item.attendees || "",
      location: item.location || "",
      link: item.link || ""
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      setDeletingScheduleId(deleteTargetId);
      const { error } = await supabase.from('schedules').delete().eq('id', deleteTargetId);
      setDeletingScheduleId(null);
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      if (!error) {
        fetchSchedules();
      } else {
        alert('Failed to delete schedule.');
      }
    }
  };

  // Helper to get start/end of week
  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }
  function getEndOfWeek(date) {
    const d = getStartOfWeek(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 6);
  }

  // Helper to compare only date parts
  function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }
  function isInWeek(date, weekStart, weekEnd) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return d >= weekStart && d <= weekEnd;
  }

  // Always use today for filtering
  const today = new Date();
  const weekStart = new Date(getStartOfWeek(today).getFullYear(), getStartOfWeek(today).getMonth(), getStartOfWeek(today).getDate());
  const weekEnd = new Date(getEndOfWeek(today).getFullYear(), getEndOfWeek(today).getMonth(), getEndOfWeek(today).getDate());

  // Filter schedules for current period (robust date comparison)
  const filteredSchedules = schedules.filter(item => {
    const itemDate = new Date(item.date);
    if (dateViewMode === 'today') {
      return isSameDay(itemDate, today);
    } else if (dateViewMode === 'week') {
      return isInWeek(itemDate, weekStart, weekEnd);
    } else {
      return itemDate.getFullYear() === today.getFullYear() && itemDate.getMonth() === today.getMonth();
    }
  });

  // Timeline should always show current week
  const timelineWeekStart = new Date(getStartOfWeek(today).getFullYear(), getStartOfWeek(today).getMonth(), getStartOfWeek(today).getDate());
  const timelineWeekEnd = new Date(getEndOfWeek(today).getFullYear(), getEndOfWeek(today).getMonth(), getEndOfWeek(today).getDate());
  const timelineSchedules = schedules.filter(item => {
    const itemDate = new Date(item.date);
    return isInWeek(itemDate, timelineWeekStart, timelineWeekEnd);
  });

  // Get unique, sorted meeting times for the current week
  const timelineTimes = Array.from(new Set(timelineSchedules.map(ev => ev.time))).sort((a, b) => {
    // Sort times as HH:MM
    return a.localeCompare(b);
  });

  // Label for current period
  let periodLabel = '';
  if (dateViewMode === 'today') {
    periodLabel = 'Today';
  } else if (dateViewMode === 'week') {
    periodLabel = 'This Week';
  } else {
    periodLabel = 'This Month';
  }

  // Handler for marking a meeting as completed
  const handleCompleteSchedule = async (id: string) => {
    setCompletingId(id);
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    setCompletingId(null);
    if (!error) {
      fetchSchedules();
    } else {
      alert('Failed to mark as completed.');
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-100">
      <div className="relative z-10 min-h-screen px-6 py-4">
        <Header activeTab="Schedule" />
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold mb-2 text-neutral-900">Schedule</h1>
              <p className="text-neutral-500">
                Schedule with events: onboarding, sync meetings, and project kick-offs
              </p>
            </div>
            <button
              className="flex items-center bg-black text-white px-5 py-2 rounded-xl space-x-2 shadow-lg font-bold hover:bg-neutral-800 transition"
              onClick={() => setShowModal(true)}
            >
              <Plus size={16} />
              <span>New Schedule</span>
            </button>
          </div>
        </div>
        <div className="w-full max-w-full mx-auto bg-white rounded-3xl p-6 border border-neutral-200">
          {/* Timeline filters row */}
          <div className="flex justify-start space-x-6 px-8 pt-6 pb-2">
              <button
              className={`text-lg font-normal transition-colors duration-150 pb-2 ${viewMode === "Timeline" ? "text-black border-b-4 border-black" : "text-neutral-500"}`}
                onClick={() => setViewMode("Timeline")}
                style={{ minWidth: 80 }}
              >
                Timeline
              </button>
              <button
              className={`text-lg font-normal transition-colors duration-150 pb-2 ${viewMode === "Kanban" ? "text-black border-b-4 border-black" : "text-neutral-500"}`}
                onClick={() => setViewMode("Kanban")}
                style={{ minWidth: 80 }}
              >
                Kanban
              </button>
              <button
              className={`text-lg font-normal transition-colors duration-150 pb-2 ${viewMode === "List" ? "text-black border-b-4 border-black" : "text-neutral-500"}`}
                onClick={() => setViewMode("List")}
                style={{ minWidth: 80 }}
              >
                List
              </button>
            </div>
          {/* Today label and Day/Week/Month/month-selector in a row */}
          {viewMode === "Timeline" && (
            <div className="flex justify-between items-center px-8 mb-2">
              <div className="text-2xl font-normal flex flex-row items-center text-neutral-900">
                Today: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            <div className="flex items-center gap-2">
              <button
                className={`px-5 py-1.5 rounded-full text-sm font-bold transition-colors duration-150 ${dateViewMode === 'today' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700'}`}
                onClick={() => setDateViewMode('today')}
              >
                Today
              </button>
              <button
                className={`px-5 py-1.5 rounded-full text-sm font-bold transition-colors duration-150 ${dateViewMode === 'week' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700'}`}
                onClick={() => setDateViewMode('week')}
              >
                This Week
              </button>
              <button
                className={`px-5 py-1.5 rounded-full text-sm font-bold transition-colors duration-150 ${dateViewMode === 'month' ? 'bg-black text-white' : 'bg-white text-neutral-700 border border-neutral-300'}`}
                onClick={() => setDateViewMode('month')}
              >
                This Month
              </button>
            </div>
          </div>
          )}
          {/* Add vertical space between filter bar and main content card */}
          <div className="h-2" />
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white rounded-3xl shadow-sm overflow-hidden border border-neutral-200">
              <div className="p-6">
                {loadingSchedules ? (
                  <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
                    <Calendar className="w-12 h-12 mb-4 animate-spin" />
                    <div className="text-lg font-semibold">Loading schedules...</div>
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
                    <Calendar className="w-12 h-12 mb-4" />
                    <div className="text-lg font-semibold">No meetings or events scheduled.</div>
                    <div className="text-sm">Add a new schedule to get started.</div>
                  </div>
                ) : (
                  viewMode === "Timeline" ? (
                    <div className="overflow-x-auto">
                      <div className="flex">
                        {/* Time header row */}
                        <div className="flex flex-col w-24 mr-2">
                          <div className="h-10"></div>
                          {daysOfWeek.map((day, dayIdx) => (
                            <div key={day} className="text-lg font-normal text-neutral-500 flex items-center justify-center h-20 border-b border-neutral-200">{day}</div>
                        ))}
                        </div>
                        <div className="flex-1">
                          <div className="flex">
                        {timelineTimes.map((slot) => (
                              <div key={slot} className="text-lg text-neutral-500 text-center py-2 w-32 border-r border-neutral-200 h-10 flex items-center justify-center">{slot}</div>
                        ))}
                          </div>
                          <div className="flex">
                            {timelineTimes.map((slot, slotIdx) => (
                              <div key={slot} className="flex flex-col">
                                {daysOfWeek.map((day, dayIdx) => {
                                  const event = timelineSchedules.find(ev => getDayIndex(ev.date) === dayIdx && ev.time === slot);
                                  const isEventToday = isToday(event?.date || '');
                              return (
                                    <div key={day} className="h-20 flex items-center justify-center border-b border-neutral-200">
                                  {event && (
                                        <div
                                          className={`rounded-full shadow flex items-center px-5 py-2 min-w-[160px] max-w-[220px] ${isEventToday ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' : 'bg-white text-neutral-900'}`}
                                          style={{ border: isEventToday ? '2px solid #ffd700' : '1.5px solid #e1e0e6', position: 'relative', gap: 8 }}
                                        >
                                          <div className="flex flex-col mr-3">
                                            <span className="font-semibold text-base leading-tight truncate" style={{ maxWidth: 120 }}>{event.title}</span>
                                            <span className={`text-xs ${isEventToday ? 'text-white/90' : 'text-neutral-500'}`}>{event.purpose}</span>
                                          </div>
                                          <div className="flex items-center ml-auto">
                                            {event.attendees && event.attendees.split(',').slice(0,3).map((name, idx) => (
                                              <div key={idx} className={`w-6 h-6 rounded-full ${isEventToday ? 'bg-white/80 text-orange-500' : 'bg-neutral-200 text-neutral-700'} flex items-center justify-center font-bold text-xs border-2 border-white -ml-1 first:ml-0`}>
                                                {name.trim().charAt(0).toUpperCase()}
                                              </div>
                                            ))}
                                            {event.attendees && event.attendees.split(',').length > 3 && (
                                              <div className={`w-6 h-6 rounded-full ${isEventToday ? 'bg-white/80 text-orange-500' : 'bg-neutral-200 text-neutral-700'} flex items-center justify-center font-bold text-xs border-2 border-white -ml-1`}>
                                                +{event.attendees.split(',').length - 3}
                                              </div>
                                            )}
                                          </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                      </div>
                    </div>
                  ) : viewMode === "Kanban" ? (
                    // Kanban View
                    <div className="overflow-x-auto">
                      <div className="flex gap-6 min-w-full">
                        {daysOfWeek.map((day, dayIdx) => {
                          // Get all meetings for this day in the current week
                          const dayMeetings = timelineSchedules.filter(ev => getDayIndex(ev.date) === dayIdx);
                          return (
                            <div key={day} className="flex-1 min-w-[220px] bg-white rounded-2xl p-3">
                              <div className="text-lg font-bold mb-2 text-neutral-700 text-center">{day}</div>
                              <div className="flex flex-col gap-4">
                                {dayMeetings.length === 0 ? (
                                  <div className="text-neutral-400 text-center text-sm">No meetings</div>
                                ) : (
                                  dayMeetings.map((item, i) => (
                                    <div
                                      key={item.id}
                                      className="rounded-[2.2rem] p-5 flex flex-col gap-3 relative"
                                      style={{
                                        background: isToday(item.date)
                                          ? 'linear-gradient(135deg, #fbb040 0%, #f68c5d 60%, #b85c2c 100%)'
                                          : 'linear-gradient(135deg, #f5f4f6 0%, #e1e0e6 100%)',
                                        color: isToday(item.date) ? '#fff' : '#222',
                                        border: isToday(item.date) ? '2.5px solid #ffd700' : '1.5px solid #e1e0e6',
                                        overflow: 'hidden',
                                        minWidth: 210,
                                        maxWidth: 270,
                                        margin: '0 auto',
                                      }}
                                    >
                                      {isToday(item.date) && (
                                        <div style={{
                                          pointerEvents: 'none',
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          width: '100%',
                                          height: '100%',
                                          zIndex: 0,
                                          opacity: 0.13,
                                          background: `linear-gradient(120deg, #fffbe6 0%, #ffd700 100%)`,
                                          borderRadius: '2.2rem',
                                        }} />
                                      )}
                                      <div className="flex flex-col gap-1 relative z-10">
                                        <span className="text-base font-bold opacity-90 mb-1" style={{letterSpacing: 0.2}}>{item.title}</span>
                                        <span className="text-lg font-extrabold flex items-center mb-1">
                                          <span className="mr-2" style={{ fontSize: 20, lineHeight: 1 }}>•</span>{item.purpose}
                                        </span>
                                        <div className="flex items-center gap-2 text-sm font-medium mb-1">
                                          <Clock size={16} className="opacity-90" />
                                          <span>{item.time} ({item.duration})</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                          {item.attendees && item.attendees.split(',').slice(0,1).map((name, idx) => (
                                            <div key={idx} className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#f68c5d] font-bold text-lg border-2 border-white">
                                              {name.trim().charAt(0).toUpperCase()}
                                            </div>
                                          ))}
                                          {item.attendees && (
                                            <span className="ml-1 text-base font-semibold" style={{ color: isToday(item.date) ? '#fff' : '#f68c5d' }}>{item.attendees.split(',').length} participant{item.attendees.split(',').length > 1 ? 's' : ''}</span>
                                          )}
                                        </div>
                            </div>
                                      {item.link && (
                                        <a
                                          href={item.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex flex-row items-center justify-center gap-2 bg-black text-white rounded-2xl w-full px-6 py-3 mt-4 font-bold shadow hover:bg-gray-900 transition whitespace-nowrap"
                                          style={{ fontSize: 18, whiteSpace: 'nowrap' }}
                                        >
                                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#2563EB"/><path d="M8.5 9.5C8.5 8.67157 9.17157 8 10 8H14C14.8284 8 15.5 8.67157 15.5 9.5V14.5C15.5 15.3284 14.8284 16 14 16H10C9.17157 16 8.5 15.3284 8.5 14.5V9.5Z" fill="white"/><path d="M17.5 10.5V13.5C17.5 13.7761 17.2761 14 17 14C16.7239 14 16.5 13.7761 16.5 13.5V10.5C16.5 10.2239 16.7239 10 17 10C17.2761 10 17.5 10.2239 17.5 10.5Z" fill="white"/></svg>
                                          Go to zoom link
                                        </a>
                                      )}
                                </div>
                                  ))
                              )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    // List View (Table Format)
                    <div className="overflow-x-auto" style={{ maxHeight: '600px' }}>
                      {filteredSchedules.length === 0 ? (
                        <div className="text-neutral-400 text-center text-base">No meetings found.</div>
                      ) : (
                        <table className="min-w-full bg-white rounded-2xl overflow-hidden">
                          <thead>
                            <tr className="bg-neutral-100 text-neutral-700 text-left">
                              <th className="px-4 py-3 font-semibold">Title</th>
                              <th className="px-4 py-3 font-semibold">Purpose</th>
                              <th className="px-4 py-3 font-semibold">Date</th>
                              <th className="px-4 py-3 font-semibold">Time</th>
                              <th className="px-4 py-3 font-semibold">Duration</th>
                              <th className="px-4 py-3 font-semibold">Attendees</th>
                              <th className="px-4 py-3 font-semibold">Link</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSchedules.map((item, i) => (
                              <tr key={item.id} className={i % 2 === 0 ? 'bg-neutral-100' : 'bg-neutral-200'}>
                                <td className="px-4 py-3 font-medium text-neutral-900">{item.title}</td>
                                <td className="px-4 py-3 text-neutral-700">{item.purpose}</td>
                                <td className="px-4 py-3 text-neutral-700">{item.date}</td>
                                <td className="px-4 py-3 text-neutral-700">{item.time}</td>
                                <td className="px-4 py-3 text-neutral-700">{item.duration}</td>
                                <td className="px-4 py-3 text-neutral-700">
                                  {item.attendees ? (
                                    <div className="flex items-center gap-1">
                                      {item.attendees.split(',').slice(0,2).map((name, idx) => (
                                        <div key={idx} className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-[#f68c5d] font-bold text-base border-2 border-neutral-300">
                                          {name.trim().charAt(0).toUpperCase()}
                                        </div>
                                      ))}
                                      {item.attendees.split(',').length > 2 && (
                                        <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-[#f68c5d] font-bold text-base border-2 border-neutral-300">
                                          +{item.attendees.split(',').length - 2}
                          </div>
                                      )}
                                      <span className="ml-2 text-sm font-medium text-neutral-700">{item.attendees.split(',').length}</span>
                                    </div>
                                  ) : (
                                    <span className="text-neutral-400">—</span>
                          )}
                                </td>
                                <td className="px-4 py-3">
                                  {item.link ? (
                                    <a
                                      href={item.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 bg-black text-white rounded-lg px-3 py-1.5 font-semibold shadow hover:bg-gray-900 transition text-sm"
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#2563EB"/><path d="M8.5 9.5C8.5 8.67157 9.17157 8 10 8H14C14.8284 8 15.5 8.67157 15.5 9.5V14.5C15.5 15.3284 14.8284 16 14 16H10C9.17157 16 8.5 15.3284 8.5 14.5V9.5Z" fill="white"/><path d="M17.5 10.5V13.5C17.5 13.7761 17.2761 14 17 14C16.7239 14 16.5 13.7761 16.5 13.5V10.5C16.5 10.2239 16.7239 10 17 10C17.2761 10 17.5 10.2239 17.5 10.5Z" fill="white"/></svg>
                                      Link
                            </a>
                                  ) : (
                                    <span className="text-neutral-400">—</span>
                          )}
                                </td>
                              </tr>
                      ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-neutral-200">
              <div className="p-6 border-b border-neutral-100">
                {/* Schedule list heading and filters */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-normal flex flex-row items-center">Schedule list</h2>
                    {/* Optionally add more controls here */}
                  </div>
                  {/* ...existing day-of-week and date filters can go here in the future... */}
                </div>
                {loadingSchedules ? (
                  <div className="flex flex-col items-center justify-center h-32 text-neutral-400">
                    <Clock className="w-8 h-8 mb-2 animate-spin" />
                    <div className="text-base font-medium">Loading meetings...</div>
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-neutral-400">
                    <Clock className="w-8 h-8 mb-2" />
                    <div className="text-base font-medium">No meetings found.</div>
                  </div>
                ) : (
                  <div className="relative" style={{ height: '540px', overflowY: 'auto', paddingTop: 0, paddingBottom: 32 }}>
                    {filteredSchedules.map((item, i) => {
                      const menuKey = `${item.id}-schedulelist`;
                      const kanbanMenuKey = `${item.id}-kanban`;
                      const offset = i * 44; // px, increased for more gap
                      const z = 10 + i;
                      return (
                        <div
                          key={item.id}
                          style={{
                            position: 'sticky',
                            top: `${offset}px`,
                            zIndex: z,
                            transition: 'top 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.2s',
                            width: '100%',
                            marginBottom: 12,
                          }}
                        >
                          {isToday(item.date) ? (
                            <div
                              className="rounded-[2rem] p-3 flex flex-col gap-2"
                              style={{
                                background: `linear-gradient(135deg, #fbb040 0%, #f68c5d 60%, #b85c2c 100%)`,
                                color: '#fff',
                                position: 'relative',
                                overflow: 'hidden',
                                border: '1.5px solid #ffd700',
                                boxShadow: '0 4px 24px 0 rgba(184, 92, 44, 0.18), inset 0 2px 16px 0 rgba(255, 215, 0, 0.13)',
                              }}
                            >
                              <div style={{ position: 'relative', zIndex: 1 }}>
                                <div className="flex items-center justify-between">
                                  <div className="text-xl font-semibold flex items-center">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-base font-semibold opacity-90">{item.title}</span>
                                      <span className="text-lg font-semibold flex items-center">
                                        <span className="mr-2" style={{ fontSize: 20, lineHeight: 1 }}>•</span>{item.purpose}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="relative flex items-center gap-1">
                                    <button
                                      className="p-1 rounded-full bg-white/80 hover:bg-green-500 text-green-600 hover:text-white transition border border-white shadow-sm"
                                      style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                      onClick={() => handleCompleteSchedule(item.id)}
                                      disabled={completingId === item.id}
                                      aria-label="Mark as Completed"
                                      title="Mark as Completed"
                                    >
                                      {completingId === item.id ? (
                                        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"/>
                                          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                                        </svg>
                                      ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                          <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      )}
                                    </button>
                                    <button
                                      className="p-1 rounded-full text-white/80 hover:text-white"
                                      onClick={() => {
                                        if (openScheduleMenu === menuKey) {
                                          setMenuAnimationState('exiting');
                                          setTimeout(() => {
                                            setOpenScheduleMenu(null);
                                            setMenuAnimationState(null);
                                          }, 200);
                                        } else {
                                          setOpenScheduleMenu(menuKey);
                                          setMenuAnimationState('entering');
                                          setTimeout(() => setMenuAnimationState('entered'), 10);
                                        }
                                      }}
                                    >
                                      <MoreVertical size={22} />
                                    </button>
                                    {(openScheduleMenu === menuKey || menuAnimationState === 'exiting') && (
                                      <div
                                        className={`absolute right-0 mt-2 w-32 bg-white border border-neutral-200 rounded-2xl shadow-lg z-20 transition-all duration-200 ease-out
                                          ${menuAnimationState === 'entering' ? 'opacity-0 translate-y-2 scale-95 pointer-events-none' : ''}
                                          ${menuAnimationState === 'entered' ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : ''}
                                          ${menuAnimationState === 'exiting' ? 'opacity-0 translate-y-2 scale-95 pointer-events-none' : ''}`}
                                        style={{ willChange: 'opacity, transform' }}
                                      >
                                        <button
                                          className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg flex items-center gap-2"
                                          onClick={() => { handleEditSchedule(item); setOpenScheduleMenu(null); }}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-100 rounded-lg flex items-center gap-2"
                                          onClick={() => { setOpenScheduleMenu(null); handleDeleteSchedule(item.id); }}
                                          disabled={deletingScheduleId === item.id}
                                        >
                                          {deletingScheduleId === item.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {/* Time and participants row */}
                                <div className="flex items-center justify-between mt-1">
                                  <div className="flex items-center gap-1 text-base font-medium">
                                    <Clock size={16} className="opacity-90" />
                                    <span>{item.time} ({item.duration})</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {item.attendees && item.attendees.split(',').slice(0,2).map((name, idx) => (
                                      <div key={idx} className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-[#f68c5d] font-bold text-base border-2 border-white">
                                        {name.trim().charAt(0).toUpperCase()}
                                      </div>
                                    ))}
                                    {item.attendees && item.attendees.split(',').length > 2 && (
                                      <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-[#f68c5d] font-bold text-base border-2 border-white">
                                        +{item.attendees.split(',').length - 2}
                        </div>
                        )}
                        {item.attendees && (
                                      <span className="ml-2 text-sm font-medium text-white/90">{item.attendees.split(',').length} participants</span>
                                    )}
                                  </div>
                                </div>
                                {item.link && (
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-row items-center justify-center gap-2 bg-black text-white rounded-2xl w-full px-6 py-3 mt-4 font-bold shadow hover:bg-gray-900 transition whitespace-nowrap"
                                    style={{ fontSize: 18, whiteSpace: 'nowrap' }}
                                  >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#2563EB"/><path d="M8.5 9.5C8.5 8.67157 9.17157 8 10 8H14C14.8284 8 15.5 8.67157 15.5 9.5V14.5C15.5 15.3284 14.8284 16 14 16H10C9.17157 16 8.5 15.3284 8.5 14.5V9.5Z" fill="white"/><path d="M17.5 10.5V13.5C17.5 13.7761 17.2761 14 17 14C16.7239 14 16.5 13.7761 16.5 13.5V10.5C16.5 10.2239 16.7239 10 17 10C17.2761 10 17.5 10.2239 17.5 10.5Z" fill="white"/></svg>
                                    Go to zoom link
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div
                              className="rounded-[2rem] p-3 flex flex-col gap-2"
                              style={{
                                background: 'linear-gradient(135deg, #f5f4f6 0%, #e1e0e6 100%)',
                                border: '2px solid #d1d6e2',
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="text-xl font-semibold flex items-center">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-base font-semibold opacity-90">{item.title}</span>
                                    <span className="text-lg font-semibold flex items-center">
                                      <span className="mr-2" style={{ fontSize: 20, lineHeight: 1 }}>•</span>{item.purpose}
                                    </span>
                                  </div>
                                </div>
                                <div className="relative flex items-center gap-1">
                                  <button
                                    className="p-1 rounded-full bg-white/80 hover:bg-green-500 text-green-600 hover:text-white transition border border-white shadow-sm"
                                    style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={() => handleCompleteSchedule(item.id)}
                                    disabled={completingId === item.id}
                                    aria-label="Mark as Completed"
                                    title="Mark as Completed"
                                  >
                                    {completingId === item.id ? (
                                      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"/>
                                        <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                                      </svg>
                                    ) : (
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                        )}
                                  </button>
                                  <button
                                    className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                                    onClick={() => {
                                      if (openScheduleMenu === menuKey) {
                                        setMenuAnimationState('exiting');
                                        setTimeout(() => {
                                          setOpenScheduleMenu(null);
                                          setMenuAnimationState(null);
                                        }, 200);
                                      } else {
                                        setOpenScheduleMenu(menuKey);
                                        setMenuAnimationState('entering');
                                        setTimeout(() => setMenuAnimationState('entered'), 10);
                                      }
                                    }}
                                  >
                                    <MoreVertical size={20} />
                                  </button>
                                  {(openScheduleMenu === menuKey || menuAnimationState === 'exiting') && (
                                    <div
                                      className={`absolute right-0 mt-2 w-32 bg-white border border-neutral-200 rounded-2xl shadow-lg z-20 transition-all duration-200 ease-out
                                        ${menuAnimationState === 'entering' ? 'opacity-0 translate-y-2 scale-95 pointer-events-none' : ''}
                                        ${menuAnimationState === 'entered' ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : ''}
                                        ${menuAnimationState === 'exiting' ? 'opacity-0 translate-y-2 scale-95 pointer-events-none' : ''}`}
                                      style={{ willChange: 'opacity, transform' }}
                                    >
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg flex items-center gap-2"
                                        onClick={() => { handleEditSchedule(item); setOpenScheduleMenu(null); }}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-100 rounded-lg flex items-center gap-2"
                                        onClick={() => { setOpenScheduleMenu(null); handleDeleteSchedule(item.id); }}
                                        disabled={deletingScheduleId === item.id}
                                      >
                                        {deletingScheduleId === item.id ? 'Deleting...' : 'Delete'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* Time and participants row */}
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-1 text-base font-medium">
                                  <Clock size={16} className="opacity-90" />
                                  <span>{item.time} ({item.duration})</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {item.attendees && item.attendees.split(',').slice(0,2).map((name, idx) => (
                                    <div key={idx} className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-[#f68c5d] font-bold text-base border-2 border-white">
                                      {name.trim().charAt(0).toUpperCase()}
                                    </div>
                                  ))}
                                  {item.attendees && item.attendees.split(',').length > 2 && (
                                    <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-[#f68c5d] font-bold text-base border-2 border-white">
                                      +{item.attendees.split(',').length - 2}
                                    </div>
                        )}
                                  {item.attendees && (
                                    <span className="ml-2 text-sm font-medium text-neutral-700">{item.attendees.split(',').length} participants</span>
                                  )}
                                </div>
                              </div>
                        {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex flex-row items-center justify-center gap-2 bg-black text-white rounded-2xl w-full px-6 py-3 mt-4 font-bold shadow hover:bg-gray-900 transition whitespace-nowrap"
                                  style={{ fontSize: 18, whiteSpace: 'nowrap' }}
                                >
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#2563EB"/><path d="M8.5 9.5C8.5 8.67157 9.17157 8 10 8H14C14.8284 8 15.5 8.67157 15.5 9.5V14.5C15.5 15.3284 14.8284 16 14 16H10C9.17157 16 8.5 15.3284 8.5 14.5V9.5Z" fill="white"/><path d="M17.5 10.5V13.5C17.5 13.7761 17.2761 14 17 14C16.7239 14 16.5 13.7761 16.5 13.5V10.5C16.5 10.2239 16.7239 10 17 10C17.2761 10 17.5 10.2239 17.5 10.5Z" fill="white"/></svg>
                                  Go to zoom link
                          </a>
                        )}
                      </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* New Schedule Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-neutral-100 rounded-[3rem] shadow-2xl w-full max-w-4xl px-8 py-6 mx-auto border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-neutral-900 mb-4">New Schedule</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-left text-base font-semibold mb-2 text-neutral-800">Title <span className="text-red-500">*</span></label>
              <input
                name="title"
                value={form.title}
                onChange={handleInput}
                  className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
                placeholder="e.g. Call with John (buyer)"
                required
              />
              {formError.title && <div className="text-red-500 text-xs mt-1">{formError.title}</div>}
            </div>
              <div className="flex-1">
                <label className="block text-left text-base font-semibold mb-2 text-neutral-800">Purpose <span className="text-red-500">*</span></label>
                <input
                  name="purpose"
                  value={form.purpose || ''}
                  onChange={handleInput}
                  className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
                  placeholder="e.g. Discuss project goals"
                  required
                />
                {formError.purpose && <div className="text-red-500 text-xs mt-1">{formError.purpose}</div>}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-left text-base font-semibold mb-2 text-neutral-800">Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleInput}
                  className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
                  required
                />
                {formError.date && <div className="text-red-500 text-xs mt-1">{formError.date}</div>}
              </div>
              <div className="flex-1">
                <label className="block text-left text-base font-semibold mb-2 text-neutral-800">Time <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleInput}
                  className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
                  required
                />
                {formError.time && <div className="text-red-500 text-xs mt-1">{formError.time}</div>}
              </div>
              <div className="flex-1">
                <label className="block text-left text-base font-semibold mb-2 text-neutral-800">Duration <span className="text-red-500">*</span></label>
                <Select value={form.duration} onValueChange={val => setForm(f => ({ ...f, duration: val }))}>
                  <SelectTrigger className="bg-white w-full rounded-2xl border border-neutral-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-orange-200 transition">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15 min">15 min</SelectItem>
                    <SelectItem value="30 min">30 min</SelectItem>
                    <SelectItem value="1 hour">1 hour</SelectItem>
                    <SelectItem value="2 hours">2 hours</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {form.duration === "Custom" && (
                  <input
                    name="customDuration"
                    value={form.customDuration}
                    onChange={handleInput}
                    className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition mt-2"
                    placeholder="Enter custom duration (optional)"
                  />
                )}
                {formError.duration && <div className="text-red-500 text-xs mt-1">{formError.duration}</div>}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-left text-base font-semibold mb-2 text-neutral-800">Repeat? <span className="text-gray-400">(optional)</span></label>
              <select
                name="repeat"
                value={form.repeat}
                onChange={handleInput}
                  className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
              >
                <option value="None">None</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Custom">Custom</option>
              </select>
              {form.repeat === "Custom" && (
                <input
                  name="customRepeat"
                  value={form.customRepeat}
                  onChange={handleInput}
                    className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition mt-2"
                    placeholder="Describe custom repeat (optional)"
                />
              )}
            </div>
              <div className="flex-1">
                <label className="block text-left text-base font-semibold mb-2 text-neutral-800">Attendees <span className="text-gray-400">(optional)</span></label>
              <input
                name="attendees"
                value={form.attendees}
                onChange={handleInput}
                  className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
                  placeholder="Add emails or names, comma separated (optional)"
              />
            </div>
              <div className="flex-1">
                <label className="block text-left text-base font-semibold mb-2 text-neutral-800">Location <span className="text-gray-400">(optional)</span></label>
              <input
                name="location"
                value={form.location}
                onChange={handleInput}
                  className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
                  placeholder="e.g. Zoom, Office, or custom link (optional)"
              />
            </div>
              <div className="flex-1">
                <label className="block text-left text-base font-semibold mb-2 text-neutral-800">Meeting Link <span className="text-gray-400">(optional)</span></label>
              <input
                name="link"
                value={form.link}
                onChange={handleInput}
                  className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
                  placeholder="e.g. Zoom or Google Meet link (optional)"
                type="url"
              />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white rounded-2xl py-2 font-bold text-lg mt-2 shadow hover:bg-neutral-800 transition border-none"
            >
              Add Schedule
            </button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete Schedule Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-white rounded-3xl w-full max-w-md px-8 py-6 mx-auto border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-neutral-900 mb-4">Delete Schedule</DialogTitle>
          </DialogHeader>
          <p className="text-base text-gray-700 mb-4">
            Are you sure you want to delete this schedule? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="w-full bg-black text-white rounded-2xl py-2 font-bold text-lg mt-2 shadow hover:bg-neutral-800 transition border-none"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="w-full bg-red-600 text-white rounded-2xl py-2 font-bold text-lg mt-2 shadow hover:bg-red-700 transition border-none"
              onClick={confirmDelete}
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SchedulePage;
