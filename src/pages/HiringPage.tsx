
import Header from "@/components/Header";
import { applicantsData } from "@/data/mockData";
import { ChevronDown, ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { useState } from "react";

const HiringPage = () => {
  const [activeTab, setActiveTab] = useState("Hiring Process");
  const [currentMonth, setCurrentMonth] = useState(0);
  const months = ["January", "February", "March", "April", "May", "June"];
  
  return (
    <div className="min-h-screen bg-[#f5f7fa] px-6 py-4">
      <Header activeTab="Hiring" />
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button 
              className={`px-6 py-4 ${activeTab === "Hiring Process" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
              onClick={() => setActiveTab("Hiring Process")}
            >
              Hiring Process
            </button>
            <button 
              className={`px-6 py-4 ${activeTab === "Full-Time" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
              onClick={() => setActiveTab("Full-Time")}
            >
              Full-Time
            </button>
            <button 
              className={`px-6 py-4 ${activeTab === "Internship" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
              onClick={() => setActiveTab("Internship")}
            >
              Internship
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-y-4 mb-6">
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium flex items-center">
                Department
                <ChevronDown size={16} className="ml-2" />
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium flex items-center">
                Date Applied
                <ChevronDown size={16} className="ml-2" />
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium flex items-center">
                Hiring Stage
                <ChevronDown size={16} className="ml-2" />
              </button>
            </div>
            
            <div className="flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="w-64 rounded-lg bg-gray-50 pl-10 pr-4 py-2 text-sm border border-gray-200" 
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between w-full">
              <div>
                <h2 className="text-2xl font-semibold">64 <span className="text-gray-500">of 127 Applicants</span></h2>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="p-1 rounded-full bg-gray-100">
                  <ChevronLeft size={16} />
                </button>
                <span className="font-medium">{months[currentMonth]} 2025</span>
                <button className="p-1 rounded-full bg-gray-100">
                  <ChevronRight size={16} />
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
                    Applicant ID
                    <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <div className="flex items-center">
                    Applicant Name
                    <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <div className="flex items-center">
                    Role Applied
                    <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <div className="flex items-center">
                    Date Applied
                    <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <div className="flex items-center">
                    Hiring Stage
                    <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Detail</th>
              </tr>
            </thead>
            <tbody>
              {applicantsData.map((applicant, index) => (
                <tr key={applicant.id} className={index !== applicantsData.length - 1 ? "border-b border-gray-100" : ""}>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded mr-3" />
                      {applicant.id}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                        <img src={applicant.avatar} alt={applicant.name} className="w-full h-full object-cover" />
                      </div>
                      {applicant.name}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`department-${applicant.role.toLowerCase()}`}>
                      {applicant.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">{applicant.dateApplied}</td>
                  <td className="px-4 py-4">
                    <span className={`hiring-${applicant.hiringStage.toLowerCase()}`}>
                      {applicant.hiringStage}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button className="text-gray-600 hover:text-gray-800">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HiringPage;
