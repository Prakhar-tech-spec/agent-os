import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Tool } from "@/data/mockData";
import { Plus, Search, Filter, Image as ImageIcon, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePlan } from '@/hooks/usePlan';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

const PRESET_ICONS = [
  { name: 'Google', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg' },
  { name: 'Facebook', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg' },
  { name: 'Slack', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg' },
  { name: 'Notion', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/notion/notion-original.svg' },
  { name: 'GitHub', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
  { name: 'Figma', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
  { name: 'Twitter', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/twitter/twitter-original.svg' },
  { name: 'YouTube', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/youtube/youtube-original.svg' },
  { name: 'LinkedIn', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg' },
  { name: 'Dropbox', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dropbox/dropbox-original.svg' },
  { name: 'Trello', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/trello/trello-plain.svg' },
  { name: 'Zoom', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/zoom/zoom-original.svg' },
];

// Helper to get Google Material Icon SVG URL
const getMaterialIconUrl = (iconName) => `https://fonts.gstatic.com/s/i/materialicons/${iconName}/v1/24px.svg`;
// Helper to get Simple Icons SVG URL
const getSimpleIconUrl = (slug) => `https://cdn.simpleicons.org/${slug}`;

// Utility to extract domain from URL for favicon fetching
function getDomainFromUrl(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname;
  } catch {
    return url;
  }
}

const MyToolsPage = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sort, setSort] = useState("recent");
  const [showModal, setShowModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [user, setUser] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    url: "",
    description: "",
    tags: "",
    pinned: false,
    icon: "",
    iconFile: null as File | null,
  });
  const [formError, setFormError] = useState<{ name?: string; url?: string }>({});
  const [formLoading, setFormLoading] = useState(false);

  // For Simple Icons search
  const [iconSearch, setIconSearch] = useState("");
  const [simpleIcons, setSimpleIcons] = useState<string[]>([]);
  // Popular company/tool slugs (expand as needed or fetch from simpleicons.org)
  const ALL_SIMPLE_ICONS = [
    "google", "facebook", "slack", "notion", "github", "figma", "twitter", "youtube", "linkedin", "dropbox", "trello", "zoom", "microsoft", "apple", "amazon", "whatsapp", "instagram", "adobe", "airbnb", "asana", "atlassian", "bitbucket", "chrome", "discord", "docker", "dribbble", "drive", "evernote", "firebase", "gitlab", "heroku", "jira", "mailchimp", "medium", "messenger", "netflix", "npm", "paypal", "pinterest", "reddit", "salesforce", "shopify", "skype", "snapchat", "spotify", "stack-overflow", "stripe", "tiktok", "twitch", "uber", "vimeo", "wordpress", "yahoo", "zapier"
  ];
  useEffect(() => {
    if (!iconSearch) {
      setSimpleIcons(ALL_SIMPLE_ICONS.slice(0, 30));
    } else {
      setSimpleIcons(
        ALL_SIMPLE_ICONS.filter(slug => slug.includes(iconSearch.toLowerCase())).slice(0, 30)
      );
    }
  }, [iconSearch]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  // Fetch tools from Supabase
  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('tools').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
      if (error) {
        setError('Failed to fetch tools.');
        setTools([]);
      } else {
        setTools(data || []);
      }
      setLoading(false);
    };
    if (user?.id) fetchTools();
  }, [user]);

  // All tags for filter dropdown
  const allTags = Array.from(new Set(tools.flatMap(tool => tool.tags || [])));

  // Filtered and sorted tools
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) || (tool.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag ? (tool.tags || []).includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  }).sort((a, b) => {
    // Pinned tools first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Then original sort order
    if (sort === "recent") return (b.created_at || b.createdAt || '').localeCompare(a.created_at || a.createdAt || '');
    if (sort === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  // Reset form when modal closes
  const handleModalChange = (open: boolean) => {
    setShowModal(open);
    if (!open) {
      setForm({ name: "", url: "", description: "", tags: "", pinned: false, icon: "", iconFile: null });
      setFormError({});
    }
  };

  // Handle form input
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked, files } = e.target as any;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else if (type === 'file') {
      setForm({ ...form, iconFile: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Validate URL (accepts full URLs or domain names)
  const isValidUrl = (url: string) => {
    // Accepts http(s)://, or domain.tld, or sub.domain.tld
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i;
    return urlPattern.test(url.trim());
  };

  // Helper to get a valid href for anchor tags
  const getValidHref = (url: string) => {
    if (!url) return '#';
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  };

  // Handle icon pick from modal
  const handleIconPick = (iconUrl: string) => {
    setForm({ ...form, icon: iconUrl, iconFile: null });
    setShowIconModal(false);
  };

  // Helper to count pinned tools
  const pinnedToolsCount = tools.filter(t => t.pinned).length;

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Plan limit enforcement for pinning
    if (plan === 'starter' && form.pinned && pinnedToolsCount >= 5) {
      toast({ title: 'Plan limit reached please upgrade' });
      return;
    }
    let errors: { name?: string; url?: string } = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.url.trim() || !isValidUrl(form.url.trim())) errors.url = "Valid URL is required";
    setFormError(errors);
    if (Object.keys(errors).length > 0) return;
    setFormLoading(true);
    let iconUrl = form.icon;
    // If file is uploaded, upload to Supabase Storage (optional, not implemented here)
    // For now, only use URL or preset
    const newTool = {
      name: form.name.trim(),
      url: form.url.trim(),
      description: form.description.trim() || null,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      pinned: form.pinned,
      icon_url: iconUrl,
      user_id: user?.id,
    };
    const { data, error } = await supabase.from('tools').insert([newTool]).select();
    setFormLoading(false);
    if (error) {
      setFormError({ name: 'Failed to add tool. Please try again.' });
      return;
    }
    if (data && data[0]) {
      setTools([data[0], ...tools]);
      setShowModal(false);
      setForm({ name: "", url: "", description: "", tags: "", pinned: false, icon: "", iconFile: null });
      setFormError({});
      toast({ title: 'Tool added', variant: 'default' });
    }
  };

  // Handle delete tool
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    const { error } = await supabase.from('tools').delete().eq('id', pendingDeleteId);
    setDeletingId(null);
    setShowDeleteModal(false);
    setPendingDeleteId(null);
    if (error) {
      alert('Failed to delete tool. Please try again.');
      return;
    }
    setTools(tools.filter(tool => tool.id !== pendingDeleteId));
    toast({ title: 'Tool deleted', variant: 'destructive' });
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '', name: '', url: '', description: '', tags: '', pinned: false, icon: '', iconFile: null as File | null
  });
  const [editFormError, setEditFormError] = useState<{ name?: string; url?: string }>({});
  const [editFormLoading, setEditFormLoading] = useState(false);

  const openEditModal = (tool: any) => {
    setEditForm({
      id: tool.id,
      name: tool.name,
      url: tool.url,
      description: tool.description || '',
      tags: (tool.tags || []).join(', '),
      pinned: tool.pinned,
      icon: tool.icon_url || tool.icon || '',
      iconFile: null
    });
    setEditFormError({});
    setEditModalOpen(true);
  };

  const handleEditInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked, files } = e.target as any;
    if (type === 'checkbox') {
      setEditForm({ ...editForm, [name]: checked });
    } else if (type === 'file') {
      setEditForm({ ...editForm, iconFile: files[0] });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Plan limit enforcement for pinning
    if (plan === 'starter' && editForm.pinned && !tools.find(t => t.id === editForm.id)?.pinned && pinnedToolsCount >= 5) {
      toast({ title: 'Plan limit reached please upgrade' });
      return;
    }
    let errors: { name?: string; url?: string } = {};
    if (!editForm.name.trim()) errors.name = "Name is required";
    if (!editForm.url.trim() || !isValidUrl(editForm.url.trim())) errors.url = "Valid URL is required";
    setEditFormError(errors);
    if (Object.keys(errors).length > 0) return;
    setEditFormLoading(true);
    let iconUrl = editForm.icon;
    // If file is uploaded, upload to Supabase Storage (optional, not implemented here)
    // For now, only use URL or preset
    const updatedTool = {
      name: editForm.name.trim(),
      url: editForm.url.trim(),
      description: editForm.description.trim() || null,
      tags: editForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      pinned: editForm.pinned,
      icon_url: iconUrl,
      user_id: user?.id,
    };
    const { error } = await supabase.from('tools').update(updatedTool).eq('id', editForm.id);
    setEditFormLoading(false);
    if (error) {
      setEditFormError({ name: 'Failed to update tool. Please try again.' });
      return;
    }
    setTools(tools.map(t => t.id === editForm.id ? { ...t, ...updatedTool, icon: iconUrl, tags: updatedTool.tags } : t));
    setEditModalOpen(false);
    toast({ title: 'Tool updated', variant: 'default' });
  };

  const { plan } = usePlan();

  return (
    <div className="relative min-h-screen bg-neutral-100">
      <div className="relative z-10 min-h-screen px-6 py-4">
        <Header activeTab="My Tools" />
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold mb-2 text-neutral-900">My Tools</h1>
              <p className="text-neutral-500">A personalized dashboard of AI tools for realtors. Search, filter, and manage your toolkit.</p>
            </div>
            <button
              className="flex items-center bg-black text-white px-5 py-2 rounded-xl space-x-2 shadow-lg font-bold hover:bg-neutral-800 transition"
              onClick={() => setShowModal(true)}
            >
              <Plus size={16} />
              <span>Add tool</span>
            </button>
          </div>
        </div>
        <div className="w-full max-w-full mx-auto bg-white rounded-3xl p-6">
          {/* Top control bar */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search tools"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-64 rounded-lg bg-neutral-50 pl-10 pr-4 py-2 text-sm border border-neutral-200 text-black"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Sort:</span>
              <select
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-black"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name</option>
              </select>
            </div>
            <button className="flex items-center px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-700 text-sm ml-auto">
              <Filter size={16} className="mr-2" />
              More Filters
            </button>
          </div>
          {/* Tool cards grid */}
          {loading ? (
            <div className="text-center text-neutral-500 py-12">Loading tools...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : (
            <div className="flex flex-wrap gap-6">
              {filteredTools.map(tool => (
                <div
                  key={tool.id}
                  className="backdrop-blur-md bg-white/60 border border-neutral-200 rounded-2xl shadow-lg flex flex-col items-center justify-between p-2 max-w-[200px] w-full min-h-[170px] transition-transform duration-200 hover:scale-[1.04] hover:shadow-2xl cursor-pointer"
                  style={{ margin: 0 }}
                >
                  {/* Icon and Pinned badge */}
                  <div className="flex items-center justify-between w-full mb-2">
                    {tool.icon ? (
                      <img src={tool.icon} alt={tool.name} className="w-8 h-8 object-contain rounded-lg bg-white/80 border border-neutral-100" />
                    ) : tool.url ? (
                      <img
                        src={`https://www.google.com/s2/favicons?sz=128&domain=${getDomainFromUrl(tool.url)}`}
                        alt={tool.name}
                        className="w-8 h-8 object-contain rounded-lg bg-white/80 border border-neutral-100"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-neutral-200 flex items-center justify-center text-lg font-bold text-neutral-400">{tool.name.charAt(0)}</div>
                    )}
                    {tool.pinned && (
                      <span className="ml-auto bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 rounded-xl shadow">Pinned</span>
                    )}
                  </div>
                  {/* Tool name */}
                  <div className="w-full text-center mb-1">
                    <span className="text-lg font-bold text-neutral-900 truncate block" title={tool.name}>{tool.name}</span>
                  </div>
                  {/* Description */}
                  {tool.description && (
                    <div className="w-full text-xs text-neutral-600 text-center mb-2 truncate" title={tool.description}>{tool.description}</div>
                  )}
                  {/* Actions */}
                  <div className="flex items-center justify-between w-full gap-2 mt-auto">
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 transition"
                      title="Edit"
                      onClick={() => openEditModal(tool)}
                    >
                      <img src="/src/assets/pen-logo.svg" alt="Edit" className="w-4 h-4" />
                    </button>
                    {tool.url && (
                      <a
                        href={getValidHref(tool.url || '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-black text-white text-center rounded-xl py-2 font-semibold shadow hover:bg-neutral-800 transition text-xs mx-1"
                        style={{ fontSize: 13 }}
                      >
                        Visit
                      </a>
                    )}
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded-xl border border-neutral-200 bg-white hover:bg-red-50 transition text-red-600"
                      title="Delete"
                      onClick={() => handleDeleteClick(tool.id)}
                      disabled={deletingId === tool.id}
                    >
                      {deletingId === tool.id ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
              {filteredTools.length === 0 && (
                <div className="col-span-full text-center text-neutral-500 py-12">No tools found.</div>
              )}
            </div>
          )}
        </div>
        {/* Add Tool Modal */}
        <Dialog open={showModal} onOpenChange={handleModalChange}>
          <DialogContent className="bg-white rounded-3xl w-full max-w-xl px-8 py-6 mx-auto border-none">
            <DialogHeader>
              <DialogTitle className="text-neutral-900 font-bold text-2xl">Add Tool</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-left text-sm font-medium mb-1 text-neutral-900">Name <span className="text-red-500">*</span></label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInput}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black bg-white"
                  placeholder="Tool name"
                  required
                  disabled={formLoading}
                />
                {formError.name && <div className="text-red-500 text-xs mt-1">{formError.name}</div>}
              </div>
              <div>
                <label className="block text-left text-sm font-medium mb-1 text-neutral-900">URL <span className="text-red-500">*</span></label>
                <input
                  name="url"
                  value={form.url}
                  onChange={handleInput}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black bg-white"
                  placeholder="https://example.com"
                  required
                  disabled={formLoading}
                />
                {formError.url && <div className="text-red-500 text-xs mt-1">{formError.url}</div>}
              </div>
              <div>
                <label className="block text-left text-sm font-medium mb-1 text-neutral-900">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInput}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black bg-white"
                  placeholder="Short description (optional)"
                  rows={2}
                  disabled={formLoading}
                />
              </div>
              <div>
                <label className="block text-left text-sm font-medium mb-1 text-neutral-900">Tags <span className="text-neutral-400">(comma separated, optional)</span></label>
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleInput}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black bg-white"
                  placeholder="e.g. ai, analytics, chatbot"
                  disabled={formLoading}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="pinned"
                  checked={form.pinned}
                  onChange={handleInput}
                  className="h-4 w-4 rounded border-neutral-300"
                  disabled={formLoading}
                />
                <label className="text-sm font-medium text-neutral-900">Pinned</label>
              </div>
              <div>
                <label className="block text-left text-sm font-medium mb-1 text-neutral-900">Icon</label>
                <div className="flex items-center gap-2">
                  <input
                    name="icon"
                    value={form.icon}
                    onChange={handleInput}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black bg-white"
                    placeholder="Icon URL or emoji"
                    disabled={formLoading}
                  />
                  <button type="button" className="p-2 rounded bg-neutral-100 border border-neutral-300" onClick={() => setShowIconModal(true)}>
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    name="iconFile"
                    onChange={handleInput}
                    className="hidden"
                    id="iconFileInput"
                    disabled={formLoading}
                  />
                  <label htmlFor="iconFileInput" className="p-2 rounded bg-neutral-100 border border-neutral-300 cursor-pointer">
                    Upload
                  </label>
                </div>
                {form.icon && form.icon.startsWith('http') && (
                  <img src={form.icon} alt="icon preview" className="w-10 h-10 mt-2 object-contain rounded" />
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white rounded-lg py-2 font-bold mt-2 hover:bg-neutral-800 transition"
                disabled={formLoading}
              >
                {formLoading ? 'Adding...' : 'Add Tool'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
        {/* Icon Picker Modal */}
        <Dialog open={showIconModal} onOpenChange={setShowIconModal}>
          <DialogContent className="bg-white rounded-3xl w-full max-w-2xl px-8 py-6 mx-auto border-none">
            <DialogHeader>
              <DialogTitle>Pick an Icon</DialogTitle>
            </DialogHeader>
            <input
              type="text"
              placeholder="Search company, tool, or platform (e.g. slack, notion, github, zoom)"
              value={iconSearch}
              onChange={e => setIconSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition mb-4"
            />
            <div className="grid grid-cols-6 gap-4 py-2 max-h-72 overflow-y-auto">
              {simpleIcons.map(slug => (
                <button key={slug} type="button" className="flex flex-col items-center gap-1 hover:bg-gray-100 rounded p-2" onClick={() => handleIconPick(getSimpleIconUrl(slug))}>
                  <img src={getSimpleIconUrl(slug)} alt={slug} className="w-10 h-10 object-contain" />
                  <span className="text-xs text-gray-700">{slug.replace(/-/g, ' ')}</span>
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-2">Powered by Simple Icons</div>
          </DialogContent>
        </Dialog>
        {/* Delete Tool Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="bg-white rounded-3xl w-full max-w-md px-8 py-6 mx-auto border-none">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-neutral-900 mb-4">Delete Tool</DialogTitle>
            </DialogHeader>
            <p className="text-base text-gray-700 mb-4">
              Are you sure you want to delete this tool? This action cannot be undone.
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
                disabled={deletingId !== null}
              >
                {deletingId !== null ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Edit Tool Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="bg-[#eee8e6] rounded-[3rem] w-full max-w-xl px-8 py-6 mx-auto border-none">
            <DialogHeader>
              <DialogTitle>Edit Tool</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-left text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Tool name"
                  required
                  disabled={editFormLoading}
                />
                {editFormError.name && <div className="text-red-500 text-xs mt-1">{editFormError.name}</div>}
              </div>
              <div>
                <label className="block text-left text-sm font-medium mb-1">URL <span className="text-red-500">*</span></label>
                <input
                  name="url"
                  value={editForm.url}
                  onChange={handleEditInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="https://example.com"
                  required
                  disabled={editFormLoading}
                />
                {editFormError.url && <div className="text-red-500 text-xs mt-1">{editFormError.url}</div>}
              </div>
              <div>
                <label className="block text-left text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Short description (optional)"
                  rows={2}
                  disabled={editFormLoading}
                />
              </div>
              <div>
                <label className="block text-left text-sm font-medium mb-1">Tags <span className="text-gray-400">(comma separated, optional)</span></label>
                <input
                  name="tags"
                  value={editForm.tags}
                  onChange={handleEditInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g. ai, analytics, chatbot"
                  disabled={editFormLoading}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="pinned"
                  checked={editForm.pinned}
                  onChange={handleEditInput}
                  className="h-4 w-4 rounded border-gray-300"
                  disabled={editFormLoading}
                />
                <label className="text-sm font-medium">Pinned</label>
              </div>
              <div>
                <label className="block text-left text-sm font-medium mb-1">Icon</label>
                <div className="flex items-center gap-2">
                  <input
                    name="icon"
                    value={editForm.icon}
                    onChange={handleEditInput}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Icon URL or emoji"
                    disabled={editFormLoading}
                  />
                  {/* Optionally add icon picker here as well */}
                </div>
                {editForm.icon && editForm.icon.startsWith('http') && (
                  <img src={editForm.icon} alt="icon preview" className="w-10 h-10 mt-2 object-contain rounded" />
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium mt-2 hover:bg-blue-700 transition"
                disabled={editFormLoading}
              >
                {editFormLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyToolsPage; 