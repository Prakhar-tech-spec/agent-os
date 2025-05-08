import { useState } from "react";
import Header from "@/components/Header";
import { Tool } from "@/data/mockData";
import { Plus, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MyToolsPage = () => {
  // Local state for tools (start empty)
  const [tools, setTools] = useState<Tool[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sort, setSort] = useState("recent");
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    tags: "",
    icon: "",
  });
  const [formError, setFormError] = useState<{ name?: string; description?: string }>({});

  // Reset form when modal closes
  const handleModalChange = (open: boolean) => {
    setShowModal(open);
    if (!open) {
      setForm({ name: "", description: "", tags: "", icon: "" });
      setFormError({});
    }
  };

  // All tags for filter dropdown
  const allTags = Array.from(new Set(tools.flatMap(tool => tool.tags)));

  // Filtered and sorted tools
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) || tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag ? tool.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  }).sort((a, b) => {
    if (sort === "recent") return b.createdAt.localeCompare(a.createdAt);
    if (sort === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  // Handle form input
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let errors: { name?: string; description?: string } = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.description.trim()) errors.description = "Description is required";
    setFormError(errors);
    if (Object.keys(errors).length > 0) return;
    const newTool: Tool = {
      id: `tool-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      icon: form.icon.trim() || "🛠️",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTools([newTool, ...tools]);
    setShowModal(false);
    setForm({ name: "", description: "", tags: "", icon: "" });
    setFormError({});
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-[#d2d7e4] opacity-80 z-0" />
      <div className="relative z-10 min-h-screen bg-transparent px-6 py-4">
        <Header activeTab="My Tools" />
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Tools</h1>
              <p className="text-gray-500">A personalized dashboard of AI tools for realtors. Search, filter, and manage your toolkit.</p>
            </div>
            <button
              className="flex items-center text-white px-3 py-1.5 rounded-2xl space-x-2 shadow-lg"
              style={{ background: 'linear-gradient(180deg, #4F8CFF 0%, #2563EB 100%)' }}
              onClick={() => setShowModal(true)}
            >
              <Plus size={16} />
              <span>Add tool</span>
            </button>
          </div>
        </div>
        <div className="w-full max-w-full mx-auto bg-[#e1e0e6] rounded-[2.5rem] p-4">
          {/* Top control bar */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-64 rounded-lg bg-gray-50 pl-10 pr-4 py-2 text-sm border border-gray-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tag:</span>
              <select
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                value={selectedTag || ''}
                onChange={e => setSelectedTag(e.target.value || null)}
              >
                <option value="">All</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort:</span>
              <select
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name</option>
              </select>
            </div>
            <button className="flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm ml-auto">
              <Filter size={16} className="mr-2" />
              More Filters
            </button>
          </div>
          {/* Tool cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTools.map(tool => (
              <div key={tool.id} className="bg-[#f5f4f6] rounded-3xl p-6 flex flex-col shadow-sm">
                <div className="flex items-center mb-3">
                  <span className="text-3xl mr-3">{tool.icon}</span>
                  <h3 className="text-xl font-normal flex-1 truncate">{tool.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4 flex-1">{tool.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tool.tags.map(tag => (
                    <span key={tag} className="bg-white rounded-full px-3 py-1 text-xs text-gray-700 border border-gray-200">{tag}</span>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-auto">Added {tool.createdAt}</div>
              </div>
            ))}
            {filteredTools.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-12">No tools found.</div>
            )}
          </div>
        </div>
        {/* Add Tool Modal */}
        <Dialog open={showModal} onOpenChange={handleModalChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tool</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-left text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Tool name"
                  required
                />
                {formError.name && <div className="text-red-500 text-xs mt-1">{formError.name}</div>}
              </div>
              <div>
                <label className="block text-left text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Short description"
                  rows={2}
                  required
                />
                {formError.description && <div className="text-red-500 text-xs mt-1">{formError.description}</div>}
              </div>
              <div>
                <label className="block text-left text-sm font-medium mb-1">Tags <span className="text-gray-400">(comma separated)</span></label>
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g. ai, analytics, chatbot"
                />
              </div>
              <div>
                <label className="block text-left text-sm font-medium mb-1">Icon <span className="text-gray-400">(emoji or text)</span></label>
                <input
                  name="icon"
                  value={form.icon}
                  onChange={handleInput}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g. 🤖"
                  maxLength={2}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium mt-2 hover:bg-blue-700 transition"
              >
                Add Tool
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyToolsPage; 