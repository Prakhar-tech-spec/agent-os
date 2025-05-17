import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Card from "@/components/Card";
import StatRow from "@/components/StatRow";
import SankeyChart from "@/components/SankeyChart";
import BarChart from "@/components/BarChart";
import AttendanceChart from "@/components/AttendanceChart";
import { ArrowUp, Calendar, Check, Clock, Edit, Eye, MessageSquare, Phone, Plus, Search, Trash, Pencil, X } from "lucide-react";
import { employeesData, workforceData, satisfactionData, attendanceData } from "@/data/mockData";
import { createClient } from '@supabase/supabase-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const supabaseUrl = 'https://nfmfejumgxlhftnohefy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbWZlanVtZ3hsaGZ0bm9oZWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NDM1MDEsImV4cCI6MjA2MjMxOTUwMX0.O3Hm1EBTjnUArZmI_Lu12G7wbwHY8EFDsY_O9SBSrUo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("Attendance");
  const months = ["January", "February", "March", "April", "May", "June"];
  const [currentMonth, setCurrentMonth] = useState(0);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [toolSearch, setToolSearch] = useState("");
  const [sortByUsage, setSortByUsage] = useState(true);
  const [tools, setTools] = useState([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState({ monthly: 25000, quarterly: 0, yearly: 0 });
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [showDeleteNoteModal, setShowDeleteNoteModal] = useState(false);
  const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('due_date', { ascending: true });
      if (!error) setTasks(data || []);
    };
    if (user?.id) fetchTasks();
    // Real-time subscription
    const channel = supabase.channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!user?.id) return;
      setLoadingSchedules(true);
      const { data, error } = await supabase.from('schedules').select('*').eq('user_id', user.id).order('date', { ascending: true }).order('time', { ascending: true });
      if (!error) setSchedules(data || []);
      setLoadingSchedules(false);
    };
    if (user?.id) fetchSchedules();
    // Real-time subscription
    const channel = supabase.channel('public:schedules')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, () => {
        fetchSchedules();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const fetchTools = async () => {
      if (!user?.id) return;
      setLoadingTools(true);
      const { data, error } = await supabase.from('tools').select('*').eq('user_id', user.id);
      if (!error) setTools(data || []);
      setLoadingTools(false);
    };
    if (user?.id) fetchTools();
    // Real-time subscription
    const channel = supabase.channel('public:tools')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tools' }, () => {
        fetchTools();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase.from('finances').select('*').eq('user_id', user.id).eq('type', 'expense');
      if (!error) setExpenses(data || []);
    };
    if (user?.id) fetchExpenses();
    // Real-time subscription
    const channel = supabase.channel('public:finances')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finances' }, () => {
        fetchExpenses();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase.from('goals').select('*').eq('user_id', user.id).single();
      if (!error && data) setGoals({ monthly: data.monthly, quarterly: data.quarterly, yearly: data.yearly });
    };
    if (user?.id) fetchGoals();
  }, [user]);

  // Helper to check if a meeting is today
  const isToday = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const filteredTools = tools
    .filter(tool => tool.name.toLowerCase().includes(toolSearch.toLowerCase()))
    .sort((a, b) => sortByUsage ? (b.usageCount || 0) - (a.usageCount || 0) : (a.usageCount || 0) - (b.usageCount || 0));

  const pinnedTools = tools.filter(tool => tool.pinned);

  const handleToolVisit = async (tool) => {
    const newUsageCount = (tool.usageCount || 0) + 1;
    const newLastUsed = new Date().toISOString();
    await supabase.from('tools').update({ usageCount: newUsageCount, lastUsed: newLastUsed }).eq('id', tool.id);
    setTools(prev => prev.map(t => t.id === tool.id ? { ...t, usageCount: newUsageCount, lastUsed: newLastUsed } : t));
  };

  // Helper: get month name from date string
  function getMonthName(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { month: 'long' });
  }

  const allExpenseMonths = Array.from(new Set(expenses.map(e => getMonthName(e.date)))).filter(Boolean);
  const monthlyExpensesData = allExpenseMonths.map(month => {
    const monthExpenses = expenses.filter(e => getMonthName(e.date) === month);
    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      label: month,
      percentage: Math.round((total / (goals.monthly || 25000)) * 100),
    };
  });

  // Fetch notes from Supabase
  useEffect(() => {
    if (!user?.id) return;
    setLoadingNotes(true);
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error) setNotes(data || []);
      setLoadingNotes(false);
    };
    fetchNotes();
    // Real-time subscription
    const channel = supabase.channel('public:notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, fetchNotes)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Add note
  const handleAddNote = async () => {
    if (!newNote.trim() || !user?.id) return;
    const { data, error } = await supabase
      .from('notes')
      .insert([{ text: newNote.trim(), user_id: user.id }])
      .select()
      .single();
    if (!error && data) setNotes(prev => [data, ...prev]);
    setNewNote("");
  };

  // Edit note
  const handleEditNote = async (id, text) => {
    if (!text.trim()) return;
    const { data, error } = await supabase
      .from('notes')
      .update({ text })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) setNotes(prev => prev.map(n => n.id === id ? data : n));
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  // Delete note
  const handleDeleteNote = (id) => {
    setPendingDeleteNoteId(id);
    setShowDeleteNoteModal(true);
  };

  const confirmDeleteNote = async () => {
    if (!pendingDeleteNoteId) return;
    const { error } = await supabase.from('notes').delete().eq('id', pendingDeleteNoteId);
    if (!error) setNotes(prev => prev.filter(n => n.id !== pendingDeleteNoteId));
    setShowDeleteNoteModal(false);
    setPendingDeleteNoteId(null);
  };

  const cancelDeleteNote = () => {
    setShowDeleteNoteModal(false);
    setPendingDeleteNoteId(null);
  };

  return (
    <div className="relative min-h-screen bg-neutral-100">
      <div className="relative z-10 min-h-screen px-6 py-4">
        <Header activeTab="Overview" />
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold mb-2 text-neutral-900">Dashboard</h1>
              <p className="text-neutral-500">
                Your central hub for insights, tasks, and analytics to manage your business efficiently.
              </p>
            </div>
            <button className="flex items-center bg-black text-white px-5 py-2 rounded-xl space-x-2 shadow-lg font-bold hover:bg-neutral-800 transition">
              <Plus size={16} />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
        <div className="w-full max-w-full mx-auto bg-white rounded-3xl p-6">
          <div className="grid grid-cols-4 gap-6 mb-8">
            {/* Workforce Insights */}
            <Card
              title="Upcoming Tasks"
              className="bg-white rounded-2xl border border-neutral-200 col-span-1"
              titleClassName="font-semibold text-xl flex flex-row items-center text-neutral-900"
              onExpand={() => { window.location.href = '/tasks'; }}
            >
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {tasks
                  .filter(task => ["Pending", "Assigned", "On Going"].includes(task.status))
                  .sort((a, b) => {
                    const aTime = a.due_date ? new Date(a.due_date).getTime() : 0;
                    const bTime = b.due_date ? new Date(b.due_date).getTime() : 0;
                    return aTime - bTime;
                  })
                  .map(task => (
                    <div key={task.id} className="flex flex-col border-b last:border-b-0 border-neutral-100 pb-2 last:pb-0">
                      <span className="font-medium text-neutral-800 truncate">{task.name}</span>
                      <span className="text-xs text-neutral-500">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                      <span className="text-xs text-neutral-400">Status: {task.status}</span>
                    </div>
                  ))}
                {tasks.filter(task => ["Pending", "Assigned", "On Going"].includes(task.status)).length === 0 && (
                  <span className="text-neutral-400 text-sm">No upcoming tasks</span>
                )}
              </div>
            </Card>
            
            {/* Employee Movement */}
            <Card title="Expense Overview" className="bg-white rounded-2xl border border-neutral-200 col-span-2" titleClassName="font-semibold text-xl flex flex-row items-center text-neutral-900" onExpand={() => { window.location.href = '/smart-finances'; }}>
              <div className="h-[220px] w-full flex items-center justify-center">
                <BarChart data={monthlyExpensesData} />
              </div>
            </Card>
            
            {/* Employee Satisfaction */}
            <Card title="Upcoming Schedules" className="bg-white rounded-2xl border border-neutral-200 col-span-1" titleClassName="font-semibold text-xl flex flex-row items-center text-neutral-900" onExpand={() => { window.location.href = '/schedule'; }}>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {loadingSchedules ? (
                  <div className="flex flex-col items-center justify-center h-32 text-neutral-400">
                    <Clock className="w-8 h-8 mb-2 animate-spin" />
                    <div className="text-base font-medium">Loading schedules...</div>
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-neutral-400">
                    <Clock className="w-8 h-8 mb-2" />
                    <div className="text-base font-medium">No schedules found.</div>
                  </div>
                ) : (
                  schedules.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl p-3 flex flex-col gap-1 border ${isToday(item.date) ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white border-[#ffd700]' : 'bg-gradient-to-br from-[#f5f4f6] to-[#e1e0e6] border-[#d1d6e2] text-neutral-900'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-base font-semibold opacity-90 truncate" title={item.title}>{item.title}</span>
                          <span className={`text-sm font-medium flex items-center truncate ${isToday(item.date) ? 'text-white/90' : 'text-neutral-600'}`} title={item.purpose}>
                            <span className="mr-2" style={{ fontSize: 16, lineHeight: 1 }}>•</span>{item.purpose}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-medium ${isToday(item.date) ? 'text-white/90' : 'text-neutral-500'}`}> 
                          <Clock size={14} className="opacity-90" />
                          <span>{item.time} ({item.duration})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {item.attendees && item.attendees.split(',').slice(0,2).map((name, idx) => (
                          <div key={idx} className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white ${isToday(item.date) ? 'bg-white/80 text-orange-600' : 'bg-white/80 text-[#f68c5d]'}`}>
                            {name.trim().charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {item.attendees && item.attendees.split(',').length > 2 && (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white ${isToday(item.date) ? 'bg-white/80 text-orange-600' : 'bg-white/80 text-[#f68c5d]'}`}>
                            +{item.attendees.split(',').length - 2}
                          </div>
                        )}
                        {item.attendees && (
                          <span className={`ml-2 text-xs font-medium ${isToday(item.date) ? 'text-white/90' : 'text-neutral-700'}`}>{item.attendees.split(',').length} participants</span>
                        )}
                  </div>
                </div>
                  ))
                )}
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div className="col-span-3">
              <Card title="Pinned Tools" showExpandIcon={true} onExpand={() => { window.location.href = '/employees'; }} className="overflow-visible bg-white rounded-2xl border border-neutral-200 min-h-[420px]" titleClassName="font-semibold text-xl flex flex-row items-center text-neutral-900">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-semibold text-neutral-900">Pinned Tools</div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                        <input 
                          type="text" 
                        placeholder="Search tools"
                        value={toolSearch}
                        onChange={e => setToolSearch(e.target.value)}
                          className="w-64 rounded-lg bg-neutral-50 pl-10 pr-4 py-2 text-sm border border-neutral-200 text-black" 
                        />
                    </div>
                  </div>
                  {loadingTools ? (
                    <div className="text-center text-neutral-400 py-6">Loading tools...</div>
                  ) : pinnedTools.length === 0 ? (
                    <div className="text-center text-neutral-400 py-6">No pinned tools found.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {pinnedTools
                        .filter(tool => tool.name.toLowerCase().includes(toolSearch.toLowerCase()))
                        .map(tool => (
                          <div
                            key={tool.id}
                            className="backdrop-blur-md bg-white/60 border border-neutral-200 rounded-2xl shadow-lg flex flex-col items-center justify-between p-4 min-h-[170px] transition-transform duration-200 hover:scale-[1.04] hover:shadow-2xl cursor-pointer"
                            style={{ margin: 0 }}
                          >
                            <div className="flex items-center justify-between w-full mb-2">
                              {tool.icon ? (
                                <img src={tool.icon} alt={tool.name} className="w-8 h-8 object-contain rounded-lg bg-white/80 border border-neutral-100" />
                              ) : tool.url ? (
                                <img
                                  src={`https://www.google.com/s2/favicons?sz=128&domain=${tool.url}`}
                                  alt={tool.name}
                                  className="w-8 h-8 object-contain rounded-lg bg-white/80 border border-neutral-100"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-neutral-200 flex items-center justify-center text-lg font-bold text-neutral-400">{tool.name.charAt(0)}</div>
                              )}
                            </div>
                            <div className="w-full text-center mb-1">
                              <span className="text-lg font-bold text-neutral-900 truncate block" title={tool.name}>{tool.name}</span>
                            </div>
                            {tool.description && (
                              <div className="w-full text-xs text-neutral-600 text-center mb-2 truncate" title={tool.description}>{tool.description}</div>
                            )}
                            <div className="flex items-center justify-center w-full gap-2 mt-auto">
                              {tool.url && (
                                <a
                                  href={tool.url.startsWith('http') ? tool.url : `https://${tool.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 bg-black text-white text-center rounded-xl py-2 font-semibold shadow hover:bg-neutral-800 transition text-xs"
                                  style={{ fontSize: 13 }}
                                  onClick={() => handleToolVisit(tool)}
                                >
                                  Visit
                                </a>
                              )}
                            </div>
                          </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
            <Card title="Notes" className="bg-white rounded-2xl border border-neutral-200 col-span-1" titleClassName="font-semibold text-xl flex flex-row items-center text-neutral-900">
              <div className="flex flex-col h-full">
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-base bg-white"
                    placeholder="Add a new note..."
                    onKeyDown={e => { if (e.key === 'Enter') handleAddNote(); }}
                  />
                  <button
                    className="bg-black text-white rounded-lg px-3 py-2 font-bold hover:bg-neutral-800 transition"
                    onClick={handleAddNote}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ minHeight: 120, maxHeight: 220 }}>
                  {loadingNotes ? (
                    <div className="text-neutral-400 text-center py-8">Loading notes...</div>
                  ) : notes.length === 0 ? (
                    <div className="text-neutral-400 text-center py-8">No notes yet.</div>
                  ) : (
                    notes.map(note => (
                      <div key={note.id} className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 group">
                        {editingNoteId === note.id ? (
                          <>
                            <input
                              type="text"
                              value={editingNoteText}
                              onChange={e => setEditingNoteText(e.target.value)}
                              className="flex-1 rounded-lg border border-neutral-200 px-2 py-1 text-base bg-white"
                              onKeyDown={e => { if (e.key === 'Enter') handleEditNote(note.id, editingNoteText); }}
                              autoFocus
                            />
                            <button className="ml-2 text-green-600 hover:text-green-800" onClick={() => handleEditNote(note.id, editingNoteText)}><Check size={18} /></button>
                            <button className="ml-1 text-neutral-400 hover:text-red-500" onClick={() => { setEditingNoteId(null); setEditingNoteText(""); }}><X size={18} /></button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-neutral-900 text-base">{note.text}</span>
                            <button className="ml-2 text-neutral-400 hover:text-blue-600" onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.text); }}><Pencil size={16} /></button>
                            <button className="ml-1 text-neutral-400 hover:text-red-500" onClick={() => handleDeleteNote(note.id)}><Trash size={16} /></button>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <Dialog open={showDeleteNoteModal} onOpenChange={setShowDeleteNoteModal}>
                  <DialogContent className="bg-white rounded-3xl w-full max-w-md px-8 py-6 mx-auto border-none">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-neutral-900 mb-4">Delete Note</DialogTitle>
                    </DialogHeader>
                    <p className="text-base text-gray-700 mb-4">
                      Are you sure you want to delete this note? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        className="w-full bg-black text-white rounded-2xl py-2 font-bold text-lg mt-2 shadow hover:bg-neutral-800 transition border-none"
                        onClick={cancelDeleteNote}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="w-full bg-red-600 text-white rounded-2xl py-2 font-bold text-lg mt-2 shadow hover:bg-red-700 transition border-none"
                        onClick={confirmDeleteNote}
                      >
                        Delete
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
