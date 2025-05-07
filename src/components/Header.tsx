
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

interface HeaderProps {
  activeTab: string;
}

const Header = ({ activeTab }: HeaderProps) => {
  return (
    <header className="bg-white py-4 px-6 rounded-xl shadow-sm flex items-center justify-between">
      <div className="flex items-center space-x-8">
        <Link to="/" className="flex items-center">
          <svg viewBox="0 0 24 24" width="32" height="32" className="text-[#FD8A56]" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M8 12l3 3v-6zm5 0l3 3v-6z"/>
          </svg>
          <span className="text-xl font-semibold ml-2">Peepulse</span>
        </Link>
        
        <nav className="flex items-center space-x-4">
          <Link to="/" className={`px-4 py-2 font-medium ${activeTab === "Overview" ? "tab-selected" : "tab-default"}`}>
            Overview
          </Link>
          <Link to="/employees" className={`px-4 py-2 font-medium ${activeTab === "Employee" ? "tab-selected" : "tab-default"}`}>
            Employee
          </Link>
          <Link to="/schedule" className={`px-4 py-2 font-medium ${activeTab === "Schedule" ? "tab-selected" : "tab-default"}`}>
            Schedule
          </Link>
          <Link to="/tasks" className={`px-4 py-2 font-medium ${activeTab === "Task" ? "tab-selected" : "tab-default"}`}>
            Task
          </Link>
          <Link to="/payroll" className={`px-4 py-2 font-medium ${activeTab === "Payroll" ? "tab-selected" : "tab-default"}`}>
            Payroll
          </Link>
          <Link to="/hiring" className={`px-4 py-2 font-medium ${activeTab === "Hiring" ? "tab-selected" : "tab-default"}`}>
            Hiring
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
          <button className="rounded-full p-2 bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          
          <div className="relative">
            <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center absolute -top-1 -right-1">1</div>
            <button className="rounded-full p-2 bg-gray-100">
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
