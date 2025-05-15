import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

interface HeaderProps {
  activeTab: string;
}

const Header = ({ activeTab }: HeaderProps) => {
  return (
    <header className="bg-[#eff1f5] py-4 px-6 rounded-3xl shadow-sm flex items-center justify-between mb-6 h-16">
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
            className="w-64 rounded-full bg-gray-50 pl-10 pr-4 py-2 text-sm border border-gray-200" 
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="rounded-xl p-2 bg-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          
          <div className="relative">
            <button className="rounded-xl p-2 bg-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <img src="/lovable-uploads/7cb844ab-a7c0-4a3a-a3df-ff34e31930e1.png" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
