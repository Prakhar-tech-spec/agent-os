import { Search } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from '@/UserContext';

interface HeaderProps {
  activeTab: string;
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

const Header = ({ activeTab }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Example: fetch dynamic data from localStorage or context if available
  // For demo, use static arrays (replace with context/props for real data)
  const staticPages = [
    { label: "Overview", path: "/" },
    { label: "My Tools", path: "/employees" },
    { label: "Schedule", path: "/schedule" },
    { label: "Task", path: "/tasks" },
    { label: "Luma AI", path: "/ai-assistant" },
    { label: "Smart Finances", path: "/smart-finances" },
    { label: "Settings", path: "/settings" },
  ];
  // Simulate dynamic items (replace with real data from context/props)
  const dynamicItems = {
    "/tasks": [
      { label: "Kick-off Meeting", path: "/tasks", type: "Task" },
      { label: "Creative brainstorming", path: "/tasks", type: "Task" },
      { label: "QC Wireframe", path: "/tasks", type: "Task" },
    ],
    "/schedule": [
      { label: "Team Standup", path: "/schedule", type: "Schedule" },
      { label: "Client Call", path: "/schedule", type: "Schedule" },
    ],
    "/employees": [
      { label: "Notion", path: "/employees", type: "Tool" },
      { label: "Slack", path: "/employees", type: "Tool" },
    ],
    "/smart-finances": [
      { label: "Office Rent", path: "/smart-finances", type: "Expense" },
      { label: "Software Subscription", path: "/smart-finances", type: "Expense" },
    ],
    "/ai-assistant": [
      { label: "Welcome to AI Assistant!", path: "/ai-assistant", type: "Message" },
    ],
  };

  // Fetch current plan on mount
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", session.user.id)
          .single();
        if (profile && profile.plan) setPlan(profile.plan);
      }
    })();
  }, []);

  // Close menu on outside click (ignore clicks on button or menu)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    // Static page suggestions
    const pageSuggestions = staticPages.filter(page =>
      page.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // Dynamic item suggestions based on current route
    let items: any[] = [];
    Object.keys(dynamicItems).forEach(route => {
      if (location.pathname.startsWith(route)) {
        items = dynamicItems[route].filter(item =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    });
    setSuggestions([...pageSuggestions, ...items]);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  }, [searchQuery, location.pathname]);

  const handleSuggestionClick = (suggestion: any) => {
    setSearchQuery("");
    setShowSuggestions(false);
    navigate(suggestion.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      setHighlightedIndex(i => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex(i => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      handleSuggestionClick(suggestions[highlightedIndex]);
    }
  };

  // Log out
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <header className="bg-white py-4 px-6 rounded-3xl border border-neutral-200 flex items-center justify-between mb-6 h-16">
      <div className="flex items-center space-x-8">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Logo" width={64} height={64} className="object-contain" style={{ display: 'block' }} />
          <span className="text-xl font-semibold -ml-1">AgentOS</span>
        </Link>
        
        <nav className="flex items-center space-x-4">
          <Link to="/" className={`px-4 py-2 text-base font-medium ${activeTab === "Overview" ? "bg-black text-white rounded-full" : "text-gray-700"}`}>
            Overview
          </Link>
          <Link to="/employees" className={`px-4 py-2 text-base font-medium ${(activeTab === "Employee" || activeTab === "My Tools") ? "bg-black text-white rounded-full" : "text-gray-700"}`}>
            My Tools
          </Link>
          <Link to="/schedule" className={`px-4 py-2 text-base font-medium ${activeTab === "Schedule" ? "bg-black text-white rounded-full" : "text-gray-700"}`}>
            Schedule
          </Link>
          <Link to="/tasks" className={`px-4 py-2 text-base font-medium ${activeTab === "Task" ? "bg-black text-white rounded-full" : "text-gray-700"}`}>
            Task
          </Link>
          <Link to="/ai-assistant" className={`px-4 py-2 text-base font-medium ${activeTab === "AI Assistant" ? "bg-black text-white rounded-full" : "text-gray-700"}`}>
            Luma AI
          </Link>
          <Link to="/smart-finances" className={`px-4 py-2 text-base font-medium ${activeTab === "Smart Finances" ? "bg-black text-white rounded-full" : "text-gray-700"}`}>
            Smart Finances
          </Link>
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-64 rounded-full bg-neutral-50 pl-10 pr-4 py-2 text-sm border border-neutral-200" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 mt-2 w-full bg-white border border-neutral-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto animate-fade-in-out">
              {suggestions.map((s, i) => (
                <div
                  key={s.label + s.path + i}
                  className={`px-4 py-2 cursor-pointer flex items-center gap-2 text-sm hover:bg-neutral-100 ${i === highlightedIndex ? 'bg-neutral-100' : ''}`}
                  onMouseDown={() => handleSuggestionClick(s)}
                  onMouseEnter={() => setHighlightedIndex(i)}
                >
                  <span className="font-medium text-neutral-800">{s.label}</span>
                  {s.type && <span className="ml-auto text-xs text-neutral-400">{s.type}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Link to="/settings" className="rounded-xl p-2 bg-white border border-neutral-200" aria-label="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </Link>
          
          <div className="relative">
            <button
              className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="User menu"
              id="user-menu-trigger"
              type="button"
              ref={buttonRef}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <img
                src={user?.avatar_url || '/lovable-uploads/7cb844ab-a7c0-4a3a-a3df-ff34e31930e1.png'}
                alt="User"
                className="w-full h-full object-cover"
                style={{ opacity: userLoading ? 0.5 : 1 }}
              />
            </button>
            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white border border-neutral-200 z-50 p-4 flex flex-col gap-4 animate-fade-in-out"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-neutral-500 mb-1">Current Plan</span>
                  <span className="text-sm font-bold text-neutral-800">{plan ? PLAN_LABELS[plan] : '...'}</span>
                </div>
                <button
                  onClick={() => {
                    navigate('/paid-pricing');
                  }}
                  className="w-full py-2 rounded-xl bg-black text-white font-semibold hover:bg-neutral-800 transition text-sm shadow-md"
                  style={{ fontSize: '1rem', fontWeight: 700 }}
                >
                  View Pricing
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition text-sm"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
