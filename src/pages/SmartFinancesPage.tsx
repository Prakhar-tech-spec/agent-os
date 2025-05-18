import Header from "@/components/Header";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Table } from "@/components/ui/table";
import BarChart from "@/components/BarChart";
import StatRow from "@/components/StatRow";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { supabase } from '@/lib/supabaseClient';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { usePlan } from '@/hooks/usePlan';
import { toast } from '@/hooks/use-toast';

// Types
type Closing = { id?: string; client: string; address: string; date?: string; closing_date?: string; commission: number; status: string };
type Expense = { id?: string; category: string; amount: number; tag?: string; date?: string; expense_date?: string };
type Reminder = { id?: string; label: string; due: string };
const todayStr = new Date().toISOString().slice(0, 10);

export default function SmartFinancesPage() {
  const [expenseInput, setExpenseInput] = useState({ category: "", amount: "", date: todayStr });
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [tagged, setTagged] = useState({});
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseTag, setExpenseTag] = useState("");
  const [closingsState, setClosingsState] = useState<Closing[]>([]);
  const [remindersState, setRemindersState] = useState<Reminder[]>([]);
  const [newClosing, setNewClosing] = useState({ client: "", address: "", date: todayStr, commission: "", status: "Upcoming" });
  const [newGoal, setNewGoal] = useState({ monthly: "", quarterly: "", yearly: "" });
  const [newReminder, setNewReminder] = useState({ label: "", due: todayStr });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; type: 'closing' | 'expense' | 'reminder' } | null>(null);
  const [goals, setGoals] = useState({ monthly: 0, quarterly: 0, yearly: 0 });
  const [goalsId, setGoalsId] = useState<string | null>(null);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);
  const [user, setUser] = useState(null);
  const [showResetGoalsModal, setShowResetGoalsModal] = useState(false);
  const { plan } = usePlan();
  const [showExportModal, setShowExportModal] = useState(false);

  // Stable fetchData for real-time
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('finances')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching finances:', error);
      return;
    }
    const mapClosing = (item: any): Closing => ({
      id: item.id,
      client: item.client,
      address: item.address,
      date: item.closing_date,
      commission: item.commission,
      status: item.status
    });
    const mapExpense = (item: any): Expense => ({
      id: item.id,
      category: item.category,
      amount: item.amount,
      tag: item.tag,
      date: item.expense_date
    });
    const mapReminder = (item: any): Reminder => ({
      id: item.id,
      label: item.label,
      due: item.due
    });
    setClosingsState(data.filter((item) => item.type === 'closing').map(mapClosing));
    setExpenseList(data.filter((item) => item.type === 'expense').map(mapExpense));
    setRemindersState(data.filter((item) => item.type === 'reminder').map(mapReminder));
  };

  // Fetch finances from Supabase in real time, only when user is loaded
  useEffect(() => {
    if (!user?.id) return;
    fetchData();
    // Real-time subscription using channel
    const channel = supabase.channel('public:finances')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finances' }, () => {
        fetchData();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Fetch user and goals on mount
  useEffect(() => {
    const fetchUserAndGoals = async () => {
      setGoalsLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      userIdRef.current = userId;
      if (!userId) {
        setGoalsLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (data) {
        setGoals({ monthly: data.monthly, quarterly: data.quarterly, yearly: data.yearly });
        setGoalsId(data.id);
      }
      setGoalsLoading(false);
    };
    fetchUserAndGoals();
  }, []);

  useEffect(() => {
    // Get session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      userIdRef.current = session?.user?.id ?? null;
    });
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      userIdRef.current = session?.user?.id ?? null;
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Helper to close modals after successful add
  const closeExpenseModal = () => setShowExpenseModal(false);
  const closeClosingModal = () => setShowClosingModal(false);
  const closeReminderModal = () => setShowReminderModal(false);

  const addExpense = async () => {
    if (!expenseInput.category || !expenseInput.amount || !expenseInput.date) return;
    const { data, error } = await supabase.from('finances').insert([{
      type: 'expense',
      category: expenseInput.category,
      amount: Number(expenseInput.amount),
      tag: expenseTag,
      expense_date: expenseInput.date,
      user_id: user?.id,
    }]).select().single();
    if (!error && data) {
      // Optimistically add the new expense to the state for instant UI update
      setExpenseList(prev => [
        {
          id: data.id,
          category: data.category,
          amount: data.amount,
          tag: data.tag,
          date: data.expense_date
        },
        ...prev
      ]);
      setExpenseInput({ category: "", amount: "", date: todayStr });
      setExpenseTag("");
      closeExpenseModal();
    }
  };

  // Calculate snapshot
  const pendingIncome = closingsState.filter(c => (c.status === "Pending" || c.status === "Upcoming")).reduce((sum, c) => sum + c.commission, 0);
  const closedIncome = closingsState.filter(c => c.status === "Closed").reduce((sum, c) => sum + c.commission, 0);
  const expensesLogged = expenseList.reduce((sum, e) => sum + e.amount, 0);
  const estimatedProfit = pendingIncome + closedIncome - expensesLogged;

  // Add Closing
  const addClosing = async () => {
    if (!newClosing.client || !newClosing.address || !newClosing.date || !newClosing.commission) return;
    const { data, error } = await supabase.from('finances').insert([
      {
      type: 'closing',
      client: newClosing.client,
      address: newClosing.address,
      closing_date: newClosing.date,
      commission: Number(newClosing.commission),
      status: newClosing.status,
      user_id: user?.id,
      }
    ]).select().single();
    if (!error && data) {
      // Optimistically add the new closing to the state for instant UI update
      setClosingsState(prev => [{
        id: data.id,
        client: data.client,
        address: data.address,
        date: data.closing_date,
        commission: data.commission,
        status: data.status
      }, ...prev]);
      setNewClosing({ client: "", address: "", date: todayStr, commission: "", status: "Upcoming" });
      closeClosingModal();
    }
  };

  // Set Goals (now saves to Supabase)
  const saveGoals = async () => {
    if (!newGoal.monthly || !newGoal.quarterly || !newGoal.yearly) return;
    const userId = user?.id;
    if (!userId) {
      alert("You must be logged in to set goals.");
      return;
    }
    setGoalsLoading(true);
    const upsertPayload: any = {
      user_id: userId,
      monthly: Number(newGoal.monthly),
      quarterly: Number(newGoal.quarterly),
      yearly: Number(newGoal.yearly),
    };
    if (goalsId) {
      upsertPayload.id = goalsId;
    }
    const { data, error } = await supabase
      .from('goals')
      .upsert([
        upsertPayload
      ], { onConflict: 'user_id' })
      .select();
    const updatedGoal = Array.isArray(data) ? data[0] : data;
    if (error) {
      console.error('Supabase upsert error:', error);
    }
    if (!error && updatedGoal) {
      setGoals({ monthly: updatedGoal.monthly, quarterly: updatedGoal.quarterly, yearly: updatedGoal.yearly });
      setGoalsId(updatedGoal.id);
    setNewGoal({ monthly: "", quarterly: "", yearly: "" });
    setShowGoalModal(false);
      // Fetch the latest goals from Supabase to ensure UI is up to date
      const { data: freshGoals, error: fetchError } = await supabase.from('goals').select('*').eq('user_id', userId).single();
      if (!fetchError && freshGoals) {
        setGoals({ monthly: freshGoals.monthly, quarterly: freshGoals.quarterly, yearly: freshGoals.yearly });
        setGoalsId(freshGoals.id);
      }
    }
    setGoalsLoading(false);
  };

  // Add Reminder
  const addReminder = async () => {
    if (!newReminder.label || !newReminder.due) return;
    const { data, error } = await supabase.from('finances').insert([{
      type: 'reminder',
      label: newReminder.label,
      due: newReminder.due,
      user_id: user?.id,
    }]).select().single();
    if (!error && data) {
      // Optimistically add the new reminder to the state for instant UI update
      setRemindersState(prev => [
        {
          id: data.id,
          label: data.label,
          due: data.due
        },
        ...prev
      ]);
      setNewReminder({ label: "", due: todayStr });
      closeReminderModal();
    }
  };

  // Helper: get month name from date string
  function getMonthName(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { month: 'long' });
  }

  // Get unique months from closings and expenses
  const allMonths = Array.from(new Set([
    ...closingsState.map(c => getMonthName(c.date)),
    ...expenseList.map(e => getMonthName(e.date))
  ])).filter(Boolean);

  // Build dynamic commission and expense data per month
  const monthlyData = allMonths.map(month => {
    // Expected: sum of all commissions for closings in this month (not Lost)
    const expected = closingsState.filter(c => getMonthName(c.date) === month && c.status !== 'Lost').reduce((sum, c) => sum + c.commission, 0);
    // Received: sum of all commissions for Closed closings in this month
    const received = closingsState.filter(c => getMonthName(c.date) === month && c.status === 'Closed').reduce((sum, c) => sum + c.commission, 0);
    // Expenses: sum of all expenses for this month only
    const expenses = expenseList.filter(e => getMonthName(e.date) === month).reduce((sum, e) => sum + e.amount, 0);
    return {
      month,
      expected,
      received,
      expenses,
    };
  });

  const expectedTotal = monthlyData.reduce((sum, d) => sum + d.expected, 0);
  const receivedTotal = monthlyData.reduce((sum, d) => sum + d.received, 0);
  const expensesTotal = expenseList.reduce((sum, e) => sum + e.amount, 0);

  // Group expenses by month using their date
  const monthlyExpensesData = allMonths.map(month => {
    const monthExpenses = expenseList.filter(e => getMonthName(e.date) === month);
    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      label: month,
      percentage: Math.round((total / (goals.monthly || 25000)) * 100),
    };
  });

  // Get current month name
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const expectedCurrentMonth = closingsState
    .filter(c => getMonthName(c.date) === currentMonth && c.status !== 'Lost')
    .reduce((sum, c) => sum + c.commission, 0);
  const receivedCurrentMonth = closingsState
    .filter(c => getMonthName(c.date) === currentMonth && c.status === 'Closed')
    .reduce((sum, c) => sum + c.commission, 0);

  // Delete handlers
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    // Optimistically remove from state for instant UI update
    if (pendingDelete.type === 'closing') {
      setClosingsState(prev => prev.filter(c => c.id !== pendingDelete.id));
    } else if (pendingDelete.type === 'expense') {
      setExpenseList(prev => prev.filter(e => e.id !== pendingDelete.id));
    } else if (pendingDelete.type === 'reminder') {
      setRemindersState(prev => prev.filter(r => r.id !== pendingDelete.id));
    }
    await supabase.from('finances').delete().eq('id', pendingDelete.id);
    setDeleteModalOpen(false);
    setPendingDelete(null);
  };
  const askDelete = (id: string, type: 'closing' | 'expense' | 'reminder') => {
    setPendingDelete({ id, type });
    setDeleteModalOpen(true);
  };

  const handleExport = () => toast({ title: 'Feature coming soon' });
  const handleAdvancedAnalytics = () => toast({ title: 'Feature coming soon' });

  return (
    <div className="relative min-h-screen bg-neutral-100">
      <div className="relative z-10 min-h-screen px-6 py-4">
        <Header activeTab="Smart Finances" />
        <div className="w-full mx-auto bg-white rounded-3xl p-6">
          <main>
            {/* Financial Snapshot Widget */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 flex flex-col items-center justify-center text-center border border-neutral-200">
                <div className="text-lg font-semibold text-neutral-700 mb-1">Pending Income</div>
                <div className="text-2xl font-bold text-neutral-900 mb-1">${pendingIncome.toLocaleString()}</div>
                <div className="text-xs text-neutral-400">From upcoming/active closings</div>
              </Card>
              <Card className="p-6 flex flex-col items-center justify-center text-center border border-neutral-200">
                <div className="text-lg font-semibold text-neutral-700 mb-1">Closed Income (This Month)</div>
                <div className="text-2xl font-bold text-neutral-900 mb-1">${closedIncome.toLocaleString()}</div>
                <div className="text-xs text-neutral-400">Already received</div>
              </Card>
              <Card className="p-6 flex flex-col items-center justify-center text-center border border-neutral-200">
                <div className="text-lg font-semibold text-neutral-700 mb-1">Expenses Logged</div>
                <div className="text-2xl font-bold text-neutral-900 mb-1">${expensesLogged.toLocaleString()}</div>
                <div className="text-xs text-neutral-400">Business expenses</div>
              </Card>
              <Card className="p-6 flex flex-col items-center justify-center text-center border border-neutral-200">
                <div className="text-lg font-semibold text-neutral-700 mb-1">Est. Profit</div>
                <div className="text-2xl font-bold text-neutral-900 mb-1">${estimatedProfit.toLocaleString()}</div>
                <div className="text-xs text-neutral-400">After expenses</div>
              </Card>
            </div>

            {/* Closing Tracker */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-neutral-900">Closing Tracker</h2>
                <Button onClick={() => {
                  setNewClosing({ client: "", address: "", date: todayStr, commission: "", status: "Upcoming" });
                  setShowClosingModal(true);
                }} className="bg-black text-white rounded-xl font-bold">Add Closing</Button>
              </div>
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-x-auto">
              <Table>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2">Client</th>
                    <th className="px-4 py-2">Property</th>
                    <th className="px-4 py-2">Expected Closing</th>
                    <th className="px-4 py-2">Commission</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Progress</th>
                      <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                    {closingsState.map((c) => (
                      <tr key={c.id} className="text-center group hover:bg-red-50/30 transition">
                      <td className="px-4 py-2 font-medium">{c.client}</td>
                      <td className="px-4 py-2">{c.address}</td>
                      <td className="px-4 py-2">{c.date}</td>
                      <td className="px-4 py-2">${c.commission.toLocaleString()}</td>
                      <td className="px-4 py-2">
                          <Select value={c.status} onValueChange={async val => {
                            // Update in Supabase
                            await supabase.from('finances').update({ status: val }).eq('id', c.id);
                            // Update local state for immediate feedback
                            const updated = [...closingsState];
                            updated.find(item => item.id === c.id)!.status = val;
                            setClosingsState(updated);
                          }}>
                            <SelectTrigger
                              className={
                                `bg-white min-w-[110px] border ` +
                                (c.status === 'Closed' ? 'border-green-400 bg-green-50 text-green-700' :
                                 c.status === 'Pending' ? 'border-yellow-400 bg-yellow-50 text-yellow-700' :
                                 c.status === 'Upcoming' ? 'border-blue-400 bg-blue-50 text-blue-700' :
                                 c.status === 'Lost' ? 'border-red-400 bg-red-50 text-red-700' :
                                 '')
                              }
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Upcoming">Upcoming</SelectItem>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Closed">Closed</SelectItem>
                              <SelectItem value="Lost">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                      </td>
                      <td className="px-4 py-2">
                          <Progress value={c.status === "Closed" ? 100 : c.status === "Pending" ? 60 : c.status === "Lost" ? 0 : 20} className="h-2" />
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => askDelete(c.id!, 'closing')}
                            className="p-1 rounded hover:bg-red-100 transition"
                            title="Delete Closing"
                          >
                            <Trash2 size={16} className="text-red-400 group-hover:text-red-600 transition" />
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              </div>
            </div>

            {/* Commission Forecast & Cash Flow */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <Card className="p-6 border border-neutral-200">
                <h2 className="text-xl font-bold mb-4 text-neutral-900">Commission Forecast</h2>
                <div className="mb-6">
                  <div className="font-semibold text-blue-600 mb-2">Expected</div>
                  <BarChart data={monthlyData.map(d => ({ label: d.month, percentage: Math.round((d.expected / (goals.monthly || 25000)) * 100) }))} />
                </div>
                <div>
                  <div className="font-semibold text-green-600 mb-2">Received</div>
                  <BarChart data={monthlyData.map(d => ({ label: d.month, percentage: Math.round((d.received / (goals.monthly || 25000)) * 100) }))} />
                </div>
                <div className="flex justify-between mt-4 text-sm text-gray-600">
                  <span>Expected: <span className="font-bold">${expectedCurrentMonth.toLocaleString()}</span></span>
                  <span>Received: <span className="font-bold">${receivedCurrentMonth.toLocaleString()}</span></span>
                </div>
              </Card>
              <Card className="p-6 border border-neutral-200">
                <h2 className="text-xl font-bold mb-4 text-neutral-900">Income vs. Expenses</h2>
                <div className="mb-6">
                  <div className="font-semibold text-blue-600 mb-2">Income</div>
                  <BarChart data={monthlyData.map(d => ({ label: d.month, percentage: Math.round((d.received / (goals.monthly || 25000)) * 100) }))} />
                </div>
                <div>
                  <div className="font-semibold text-red-500 mb-2">Expenses</div>
                  <BarChart data={monthlyExpensesData} />
                </div>
              </Card>
            </div>

            {/* Manual Expense Entry & Categorization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <Card className="p-6 border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-neutral-800">Add Expense</h2>
                  <Button onClick={() => {
                    setExpenseInput({ category: "", amount: "", date: todayStr });
                    setExpenseTag("");
                    setShowExpenseModal(true);
                  }}>Add Expense</Button>
                </div>

                <Table>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Tag</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseList.map((e) => (
                      <tr key={e.id} className="group hover:bg-red-50/30 transition">
                        <td className="px-4 py-2">{e.category}</td>
                        <td className="px-4 py-2">${e.amount.toLocaleString()}</td>
                        <td className="px-4 py-2">{e.date}</td>
                        <td className="px-4 py-2">
                          <Select value={e.tag || ""} onValueChange={val => {
                            const updated = [...expenseList];
                            updated.find(item => item.id === e.id)!.tag = val;
                            setExpenseList(updated);
                          }}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                              <SelectItem value="Fuel">Fuel</SelectItem>
                              <SelectItem value="Software">Software</SelectItem>
                              <SelectItem value="Meals">Meals</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => askDelete(e.id!, 'expense')}
                            className="p-1 rounded hover:bg-red-100 transition"
                            title="Delete Expense"
                          >
                            <Trash2 size={16} className="text-red-400 group-hover:text-red-600 transition" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {plan === 'pro' || plan === 'starter' ? (
                  <>
                    <Button className="mt-4" onClick={() => setShowExportModal(true)}>Export Report (PDF)</Button>
                    <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
                      <DialogContent className="bg-white rounded-3xl w-full max-w-md px-8 py-6 mx-auto border-none">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-neutral-900 mb-4">Export Options</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-4">
                          <Button className="w-full" variant="outline">Basic Data Export</Button>
                          {plan === 'pro' ? (
                            <Button className="w-full" variant="default">Advanced Data Export</Button>
                          ) : (
                            <Button className="w-full flex items-center justify-center gap-2" variant="default" disabled>
                              Advanced Data Export
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-400 text-black text-xs font-bold">Pro</span>
                            </Button>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="secondary" onClick={() => setShowExportModal(false)}>Cancel</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <Button className="mt-4" disabled onClick={() => toast({ title: 'Plan limit reached please upgrade' })}>Export Report (PDF)</Button>
                )}
              </Card>
              {/* Reminders & Alerts */}
              <Card className="p-6 border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-neutral-800">Reminders & Alerts</h2>
                  <Button onClick={() => {
                    setNewReminder({ label: "", due: todayStr });
                    setShowReminderModal(true);
                  }}>Add Reminder</Button>
                </div>
                <ul className="mb-4">
                  {remindersState.map((r) => (
                    <li key={r.id} className="flex justify-between items-center py-2 border-b border-gray-100 text-gray-700 group hover:bg-red-50/30 transition">
                      <span>{r.label}</span>
                      <span className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Due: {r.due}</span>
                        <button
                          onClick={() => askDelete(r.id!, 'reminder')}
                          className="p-1 rounded hover:bg-red-100 transition"
                          title="Delete Reminder"
                        >
                          <Trash2 size={16} className="text-red-400 group-hover:text-red-600 transition" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Goal Tracking */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">Goal Tracking</h2>
              <div className="flex gap-2">
              <Button onClick={() => setShowGoalModal(true)} className="bg-black text-white rounded-xl font-bold">Set Goals</Button>
                <Button onClick={() => setShowResetGoalsModal(true)} className="bg-red-600 text-white rounded-xl font-bold text-sm px-4 py-2 hover:bg-red-700 transition">Reset</Button>
              </div>
            </div>
            <div className="mb-10">
              <Card className="p-6 border border-neutral-200">
                <div className="mb-4">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">Monthly Target</div>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(100, (closedIncome / goals.monthly) * 100)} className="h-3 flex-1" />
                        <span className="text-xs font-semibold text-gray-600 min-w-[36px]">{Math.min(100, Math.round((closedIncome / goals.monthly) * 100))}%</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">${closedIncome.toLocaleString()} / ${goals.monthly.toLocaleString()}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">Quarterly Target</div>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(100, (closedIncome / goals.quarterly) * 100)} className="h-3 flex-1" />
                        <span className="text-xs font-semibold text-gray-600 min-w-[36px]">{Math.min(100, Math.round((closedIncome / goals.quarterly) * 100))}%</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">${closedIncome.toLocaleString()} / ${goals.quarterly.toLocaleString()}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">Yearly Target</div>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(100, (closedIncome / goals.yearly) * 100)} className="h-3 flex-1" />
                        <span className="text-xs font-semibold text-gray-600 min-w-[36px]">{Math.min(100, Math.round((closedIncome / goals.yearly) * 100))}%</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">${closedIncome.toLocaleString()} / ${goals.yearly.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Add Closing Modal */}
            <Dialog open={showClosingModal} onOpenChange={setShowClosingModal}>
              <DialogContent className="bg-white rounded-3xl w-full max-w-lg px-8 py-6 mx-auto border-none">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-neutral-900 mb-4">Add Closing</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); addClosing(); }}>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Client Name</label>
                    <Input placeholder="Client Name" value={newClosing.client} onChange={e => setNewClosing({ ...newClosing, client: e.target.value })} className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Property Address</label>
                    <Input placeholder="Property Address" value={newClosing.address} onChange={e => setNewClosing({ ...newClosing, address: e.target.value })} className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Expected Closing Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Input
                          readOnly
                          value={newClosing.date ? format(new Date(newClosing.date), 'yyyy-MM-dd') : ''}
                          placeholder="Select date"
                          className="bg-white cursor-pointer"
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newClosing.date ? new Date(newClosing.date) : undefined}
                          onSelect={date => {
                            setNewClosing({ ...newClosing, date: date ? date.toISOString() : '' });
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Commission Amount</label>
                    <Input placeholder="Commission Amount" type="number" value={newClosing.commission} onChange={e => setNewClosing({ ...newClosing, commission: e.target.value })} className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Status</label>
                    <Select value={newClosing.status} onValueChange={val => setNewClosing({ ...newClosing, status: val })}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                        <SelectItem value="Lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setShowClosingModal(false)}>Cancel</Button>
                    <Button type="submit">Add Closing</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Set Goals Modal */}
            <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
              <DialogContent className="bg-white rounded-3xl w-full max-w-lg px-8 py-6 mx-auto border-none">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-neutral-900 mb-4">Set Goals</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); saveGoals(); }}>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Monthly Target</label>
                    <Input placeholder="Monthly Target" type="number" value={newGoal.monthly} onChange={e => setNewGoal({ ...newGoal, monthly: e.target.value })} className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Quarterly Target</label>
                    <Input placeholder="Quarterly Target" type="number" value={newGoal.quarterly} onChange={e => setNewGoal({ ...newGoal, quarterly: e.target.value })} className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Yearly Target</label>
                    <Input placeholder="Yearly Target" type="number" value={newGoal.yearly} onChange={e => setNewGoal({ ...newGoal, yearly: e.target.value })} className="bg-white" />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setShowGoalModal(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Add Reminder Modal */}
            <Dialog open={showReminderModal} onOpenChange={setShowReminderModal}>
              <DialogContent className="bg-white rounded-3xl w-full max-w-lg px-8 py-6 mx-auto border-none">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-neutral-900 mb-4">Add Reminder</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); addReminder(); }}>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Label/Description</label>
                    <Input placeholder="Label/Description" value={newReminder.label} onChange={e => setNewReminder({ ...newReminder, label: e.target.value })} className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Due Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Input
                          readOnly
                          value={newReminder.due ? format(new Date(newReminder.due), 'yyyy-MM-dd') : ''}
                          placeholder="Select date"
                          className="bg-white cursor-pointer"
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newReminder.due ? new Date(newReminder.due) : undefined}
                          onSelect={date => {
                            setNewReminder({ ...newReminder, due: date ? date.toISOString() : '' });
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setShowReminderModal(false)}>Cancel</Button>
                    <Button type="submit">Add</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Add Expense Modal */}
            <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
              <DialogContent className="bg-white rounded-3xl w-full max-w-lg px-8 py-6 mx-auto border-none">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-neutral-900 mb-4">Add Expense</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={e => {
                  e.preventDefault();
                  if (!expenseInput.category || !expenseInput.amount || !expenseInput.date) return;
                  addExpense();
                }}>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Category</label>
                    <Input placeholder="Category (e.g. Fuel)" value={expenseInput.category} onChange={e => setExpenseInput({ ...expenseInput, category: e.target.value })} className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Amount</label>
                    <Input placeholder="Amount" type="number" value={expenseInput.amount} onChange={e => setExpenseInput({ ...expenseInput, amount: e.target.value })} className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Input
                          readOnly
                          value={expenseInput.date ? format(new Date(expenseInput.date), 'yyyy-MM-dd') : ''}
                          placeholder="Select date"
                          className="bg-white cursor-pointer"
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={expenseInput.date ? new Date(expenseInput.date) : undefined}
                          onSelect={date => {
                            setExpenseInput({ ...expenseInput, date: date ? date.toISOString() : '' });
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Tag</label>
                    <Select value={expenseTag} onValueChange={val => setExpenseTag(val)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select tag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Fuel">Fuel</SelectItem>
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="Meals">Meals</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setShowExpenseModal(false)}>Cancel</Button>
                    <Button type="submit">Add Expense</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
              <DialogContent className="bg-white rounded-3xl w-full max-w-md px-8 py-6 mx-auto border-none">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-neutral-900 mb-4">Delete {pendingDelete?.type === 'closing' ? 'Closing' : pendingDelete?.type === 'expense' ? 'Expense' : 'Reminder'}</DialogTitle>
                </DialogHeader>
                <p className="text-base text-gray-700 mb-4">
                  Are you sure you want to delete this {pendingDelete?.type}? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                  <Button type="button" className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete}>Delete</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Reset Goals Modal */}
            <Dialog open={showResetGoalsModal} onOpenChange={setShowResetGoalsModal}>
              <DialogContent className="bg-white rounded-3xl w-full max-w-md px-8 py-6 mx-auto border-none">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-neutral-900 mb-4">Reset Goals</DialogTitle>
                </DialogHeader>
                <p className="text-base text-gray-700 mb-4">
                  Are you sure you want to reset your goals? This will delete your monthly, quarterly, and yearly targets. This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="w-full bg-black text-white rounded-2xl py-2 font-bold text-lg mt-2 shadow hover:bg-neutral-800 transition border-none"
                    onClick={() => setShowResetGoalsModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="w-full bg-red-600 text-white rounded-2xl py-2 font-bold text-lg mt-2 shadow hover:bg-red-700 transition border-none"
                    onClick={async () => {
                      if (!user?.id) return;
                      setGoalsLoading(true);
                      await supabase.from('goals').delete().eq('user_id', user.id);
                      setGoals({ monthly: 0, quarterly: 0, yearly: 0 });
                      setGoalsId(null);
                      setGoalsLoading(false);
                      setShowResetGoalsModal(false);
                    }}
                  >
                    Reset
                  </button>
                </div>
              </DialogContent>
            </Dialog>

          </main>
        </div>
      </div>
    </div>
  );
} 