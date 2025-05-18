import Header from "@/components/Header";
import { ChevronDown, Edit, Filter, Plus, Search, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { employeesData, tasksData } from "@/data/mockData";
import { supabase } from '@/lib/supabaseClient';
import PenLogo from "@/assets/pen-logo.svg";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import { usePlan } from '@/hooks/usePlan';
import { toast } from '@/hooks/use-toast';

const TaskPage = () => {
  const [selectedStatus, setSelectedStatus] = useState("All");
  const statusTabs = ["All", "Assigned", "On Going", "Pending", "Complete"];
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    assignees: "",
    project: "",
    dueDate: "",
    priority: "",
    tags: "",
    status: "Assigned",
    completed: false
  });
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [search, setSearch] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({
    name: '',
    project: '',
    dueDate: '',
    priority: '',
    status: ''
  });
  const [user, setUser] = useState(null);
  const { plan } = usePlan();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSelect = (name: string, value: string) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const projectOptions = Array.from(new Set(tasksData.map(t => t.project.name)));

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
    if (!error) setTasks(data || []);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  useEffect(() => {
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

  // Edit handler: open modal with task data
  const handleEdit = (task) => {
    setForm({
      name: task.name || '',
      assignees: task.assignees || '',
      project: task.project || '',
      dueDate: task.due_date || '',
      priority: task.priority || '',
      tags: task.tags || '',
      status: task.status || 'Assigned',
      completed: !!task.completed
    });
    setEditId(task.id);
    setShowModal(true);
  };

  // Delete handler
  const handleDelete = async (id) => {
    setConfirmDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId) {
      await supabase.from('tasks').delete().eq('id', confirmDeleteId);
      fetchTasks();
      setConfirmDeleteId(null);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
    setShowDeleteModal(false);
  };

  // Helper to count tasks for the current month
  const tasksThisMonth = tasks.filter(t => {
    const d = new Date(t.due_date);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  // Update handleSubmit to handle both add and edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Plan limit enforcement
    if (plan === 'starter' && tasksThisMonth >= 50 && !editId) {
      toast({ title: 'Plan limit reached please upgrade' });
      return;
    }
    // Validation: required fields
    const errors = {
      name: form.name.trim() ? '' : 'Task name is required.',
      project: form.project.trim() ? '' : 'Project is required.',
      dueDate: form.dueDate.trim() ? '' : 'Due date is required.',
      priority: form.priority.trim() ? '' : 'Priority is required.',
      status: form.status.trim() ? '' : 'Status is required.'
    };
    setFormErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      return;
    }
    // If status is Complete, completed should be true
    const completedValue = form.status === 'Complete';
    if (editId) {
      // Update
      const { error } = await supabase.from('tasks').update({
        name: form.name,
        assignees: form.assignees,
        project: form.project,
        due_date: form.dueDate,
        priority: form.priority,
        tags: form.tags,
        status: form.status,
        completed: completedValue,
        user_id: user?.id,
      }).eq('id', editId);
      if (error) {
        alert('Failed to update task: ' + error.message);
      }
    } else {
      // Add
      const { error } = await supabase.from('tasks').insert([
        {
          name: form.name,
          assignees: form.assignees,
          project: form.project,
          due_date: form.dueDate,
          priority: form.priority,
          tags: form.tags,
          status: form.status || 'Assigned',
          completed: completedValue,
          user_id: user?.id,
        }
      ]);
      if (error) {
        alert('Failed to add task: ' + error.message);
      }
    }
    setForm({ name: '', assignees: '', project: '', dueDate: '', priority: '', tags: '', status: 'Assigned', completed: false });
    setFormErrors({ name: '', project: '', dueDate: '', priority: '', status: '' });
    setShowModal(false);
    setEditId(null);
    fetchTasks();
  };

  // Add completed checkbox handler
  const handleCompletedChange = async (task) => {
    const newCompleted = !task.completed;
    const newStatus = newCompleted ? 'Complete' : 'Assigned';
    await supabase.from('tasks').update({ completed: newCompleted, status: newStatus }).eq('id', task.id);
    fetchTasks();
  };

  return (
    <div className="relative min-h-screen bg-neutral-100">
      <div className="relative z-10 min-h-screen px-6 py-4">
        <Header activeTab="Task" />
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold mb-2 text-neutral-900">Project Task Summary</h1>
              <p className="text-neutral-500">
                4 tasks assigned, 4 in progress, with clear priorities and deadlines.
              </p>
            </div>
            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogTrigger asChild>
            <button
                  className="flex items-center bg-black text-white px-5 py-2 rounded-xl space-x-2 shadow-lg font-bold hover:bg-neutral-800 transition"
            >
              <Plus size={16} />
              <span>New Task</span>
            </button>
              </DialogTrigger>
              <DialogContent className="bg-white rounded-3xl px-8 py-6 mx-auto border-none">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-neutral-900 mb-4">New Task</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Task Name</label>
                    <Input name="name" value={form.name} onChange={handleInput} placeholder="Task name" className="bg-white" />
                    {formErrors.name && <div className="text-red-600 text-xs mt-1">{formErrors.name}</div>}
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Assignees</label>
                    <Input name="assignees" value={form.assignees} onChange={handleInput} placeholder="Assignees (comma separated)" className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Project</label>
                    <Input name="project" value={form.project} onChange={handleInput} placeholder="Project name" className="bg-white" />
                    {formErrors.project && <div className="text-red-600 text-xs mt-1">{formErrors.project}</div>}
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Due Date</label>
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Input
                          readOnly
                          value={form.dueDate ? format(new Date(form.dueDate), 'yyyy-MM-dd') : ''}
                          placeholder="Select date"
                          className="bg-white cursor-pointer"
                          onClick={() => setDatePickerOpen(true)}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.dueDate ? new Date(form.dueDate) : undefined}
                          onSelect={date => {
                            setForm(f => ({ ...f, dueDate: date ? date.toISOString() : '' }));
                            setDatePickerOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {formErrors.dueDate && <div className="text-red-600 text-xs mt-1">{formErrors.dueDate}</div>}
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Priority</label>
                    <Select value={form.priority} onValueChange={value => setForm(f => ({ ...f, priority: value }))}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.priority && <div className="text-red-600 text-xs mt-1">{formErrors.priority}</div>}
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Status</label>
                    <Select value={form.status} onValueChange={value => setForm(f => ({ ...f, status: value }))}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Assigned">Assigned</SelectItem>
                        <SelectItem value="On Going">On Going</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Complete">Complete</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.status && <div className="text-red-600 text-xs mt-1">{formErrors.status}</div>}
                  </div>
                  <div>
                    <label className="block text-left text-sm font-medium mb-1">Tags <span className="text-gray-400">(comma separated, optional)</span></label>
                    <Input name="tags" value={form.tags} onChange={handleInput} placeholder="e.g. UI/UX, Branding" className="bg-white" />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="bg-neutral-200 text-black rounded-xl font-bold">Cancel</Button>
                    <Button type="submit" className="bg-black text-white rounded-xl font-bold">Add Task</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="w-full max-w-full mx-auto bg-white rounded-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-white flex items-center space-x-2 px-3 py-1 max-w-max border border-neutral-200" style={{ borderRadius: '9999px' }}>
              {statusTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedStatus(tab)}
                  className={`px-4 py-1 rounded-full text-sm font-medium ${selectedStatus === tab ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
                >
                  {tab}
                </button>
              ))}
              <button className="px-4 py-1 rounded-full text-neutral-600 hover:bg-neutral-100 flex items-center justify-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                  <Plus size={16} />
                </span>
              </button>
            </div>
            <div className="flex items-center ml-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-64 rounded-lg bg-neutral-50 pl-10 pr-4 py-2 text-sm border border-neutral-200 text-black"
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden mb-4">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-gray-700">
                  <ChevronDown size={18} />
                  <span className="font-medium">Tasks</span>
                </div>
                
                <div className="flex items-center space-x-4 text-gray-600">
                  <button className="flex items-center space-x-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span className="text-sm">Manage</span>
                  </button>
                  <button className="flex items-center space-x-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span className="text-sm">Export</span>
                  </button>
                  <button>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="19" cy="12" r="1"></circle>
                      <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded mr-3" />
                      Task name
                      <ChevronDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    <div className="flex items-center">
                      Assignee
                      <ChevronDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    <div className="flex items-center">
                      Project
                      <ChevronDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    <div className="flex items-center">
                      Due Date
                      <ChevronDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    <div className="flex items-center">
                      Priority
                      <ChevronDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    <div className="flex items-center">
                      Tag
                      <ChevronDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Completed</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks
                  .filter(t => {
                    // Status filter
                    if (selectedStatus !== 'All') {
                      if (!t.status || t.status.toLowerCase() !== selectedStatus.toLowerCase()) {
                        return false;
                      }
                    }
                    // Search filter: match any field
                    const q = search.trim().toLowerCase();
                    if (!q) return true;
                    const fields = [t.name, t.assignees, t.project, t.due_date, t.priority, t.tags].map(f => (f || '').toLowerCase());
                    return fields.some(f => f.includes(q));
                  })
                  .map((task) => (
                    <tr key={task.id}>
                      <td className="px-4 py-3">{task.name || '-'}</td>
                      <td className="px-4 py-3">{task.assignees || '-'}</td>
                      <td className="px-4 py-3">{task.project || '-'}</td>
                      <td className="px-4 py-3">{task.due_date || '-'}</td>
                      <td className="px-4 py-3">{task.priority || '-'}</td>
                      <td className="px-4 py-3">{task.tags || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleCompletedChange(task)}
                          className={`relative w-10 h-6 rounded-full focus:outline-none ${task.completed ? 'bg-green-500' : 'bg-gray-300'}`}
                          title="Mark as completed"
                          style={{
                            border: 'none',
                            transition: 'background-color 0.35s cubic-bezier(0.4,0,0.2,1)',
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
                          <span
                            className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center`}
                            style={{
                              transform: task.completed ? 'translateX(16px)' : 'translateX(0)',
                              transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
                              willChange: 'transform'
                            }}
                          >
                            <span
                              style={{
                                opacity: task.completed ? 1 : 0,
                                transition: 'opacity 0.25s cubic-bezier(0.4,0,0.2,1) 0.1s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                width: '100%'
                              }}
                            >
                              {task.completed && (
                                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 10.5L9 14.5L15 7.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                              )}
                            </span>
                          </span>
                  </button>
                      </td>
                      <td className="px-4 py-3 text-center">{task.status || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-blue-50 transition" title="Edit" onClick={() => handleEdit(task)}>
                            <img src={PenLogo} alt="Edit" className="w-5 h-5" />
                  </button>
                          <button className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-red-50 transition text-red-600" title="Delete" onClick={() => handleDelete(task.id)}>
                            <Trash size={18} />
                  </button>
                </div>
                      </td>
                </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Confirmation Modal for Delete */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-white rounded-3xl w-full max-w-md px-8 py-6 mx-auto border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-neutral-900 mb-4">Delete Task</DialogTitle>
          </DialogHeader>
          <p className="text-base text-gray-700 mb-4">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="w-full bg-black text-white rounded-2xl py-2 font-bold text-lg mt-2 shadow hover:bg-neutral-800 transition border-none"
              onClick={cancelDelete}
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
};

export default TaskPage;
