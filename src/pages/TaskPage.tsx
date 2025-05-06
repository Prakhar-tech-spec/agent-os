
import Header from "@/components/Header";
import { tasksData } from "@/data/mockData";
import { ChevronDown, Edit, Filter, Plus, Search, Trash } from "lucide-react";
import { useState } from "react";

const TaskPage = () => {
  const [selectedStatus, setSelectedStatus] = useState("All");
  const statusTabs = ["All", "Assigned", "On Going", "Pending", "Complete"];

  return (
    <div className="min-h-screen bg-[#f5f7fa] px-6 py-4">
      <Header activeTab="Task" />
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Project Task Summary</h1>
            <p className="text-gray-500">
              4 tasks assigned, 4 in progress, with clear priorities and deadlines.
            </p>
          </div>
          <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg space-x-2">
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center p-4 border-b border-gray-100">
          <div className="flex space-x-2">
            {statusTabs.map((tab) => (
              <button 
                key={tab} 
                onClick={() => setSelectedStatus(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedStatus === tab ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
            <button className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100">
              <Plus size={18} />
            </button>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search" 
                className="w-64 rounded-lg bg-gray-50 pl-10 pr-4 py-2 text-sm border border-gray-200" 
              />
            </div>
            
            <button className="p-2 rounded-full bg-gray-100">
              <Filter size={18} />
            </button>
            
            <button className="p-2 rounded-full bg-gray-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="9" x2="20" y2="9"></line>
                <line x1="4" y1="15" x2="20" y2="15"></line>
                <line x1="10" y1="3" x2="8" y2="21"></line>
                <line x1="16" y1="3" x2="14" y2="21"></line>
              </svg>
            </button>
            
            <button className="p-2 rounded-full bg-gray-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-gray-700">
              <ChevronDown size={18} />
              <span className="font-medium">Assigned</span>
              <span className="ml-2 bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
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
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {tasksData.slice(0, 4).map((task, index) => (
              <tr key={task.id} className={index !== 3 ? "border-b border-gray-100" : ""}>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <input type="checkbox" className="rounded mr-3" />
                    {task.name}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex -space-x-2">
                    {task.assignees.map((assignee, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                        <img 
                          src={`/lovable-uploads/${i === 0 ? '4c1fb7e8-6547-44c3-8c1a-d3768f956fe2' : '9d9ee4d4-81d4-4445-b4c8-19186cc9384d'}.png`} 
                          alt={`Assignee ${i}`} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center mr-2">
                      {task.project.icon}
                    </div>
                    {task.project.name}
                  </div>
                </td>
                <td className="px-4 py-4">{task.dueDate}</td>
                <td className="px-4 py-4">
                  <span className={`priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex space-x-2">
                    {task.tags.map((tag, i) => (
                      <span key={i} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-3">
                    <button className="text-gray-500 hover:text-gray-700">
                      <Edit size={16} />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-gray-700">
              <ChevronDown size={18} />
              <span className="font-medium">On Going</span>
              <span className="ml-2 bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
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
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {tasksData.slice(4).map((task, index) => (
              <tr key={task.id} className={index !== tasksData.slice(4).length - 1 ? "border-b border-gray-100" : ""}>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <input type="checkbox" className="rounded mr-3" />
                    {task.name}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex -space-x-2">
                    {task.assignees.map((assignee, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                        <img 
                          src={`/lovable-uploads/${i === 0 ? 'fe4eec11-1aac-4a28-8f29-66c05334827d' : '9042c7e0-c2c9-4776-9920-b9ef775dec35'}.png`} 
                          alt={`Assignee ${i}`} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center mr-2">
                      {task.project.icon}
                    </div>
                    {task.project.name}
                  </div>
                </td>
                <td className="px-4 py-4">{task.dueDate}</td>
                <td className="px-4 py-4">
                  <span className={`priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex space-x-2">
                    {task.tags.map((tag, i) => (
                      <span key={i} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-3">
                    <button className="text-gray-500 hover:text-gray-700">
                      <Edit size={16} />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskPage;
