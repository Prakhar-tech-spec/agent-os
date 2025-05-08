import { useState } from "react";
import Header from "@/components/Header";
import Card from "@/components/Card";
import StatRow from "@/components/StatRow";
import SankeyChart from "@/components/SankeyChart";
import BarChart from "@/components/BarChart";
import AttendanceChart from "@/components/AttendanceChart";
import { ArrowUp, Calendar, Check, Clock, Edit, Eye, MessageSquare, Phone, Plus, Search, Trash } from "lucide-react";
import { employeesData, workforceData, satisfactionData, attendanceData } from "@/data/mockData";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("Attendance");
  const months = ["January", "February", "March", "April", "May", "June"];
  const [currentMonth, setCurrentMonth] = useState(0);

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-[#d2d7e4] opacity-80 z-0" />
      <div className="relative z-10 min-h-screen bg-transparent px-6 py-4">
        <Header activeTab="Overview" />
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Employees Well-Being</h1>
              <p className="text-gray-500">
                Tracking workforce insights with {attendanceData.totalActive} active employees and a {attendanceData.increase}% increase in attendance
              </p>
            </div>
            <button className="flex items-center text-white px-3 py-1.5 rounded-2xl space-x-2 shadow-lg" style={{background: 'linear-gradient(180deg, #4F8CFF 0%, #2563EB 100%)'}}>
              <Plus size={16} />
              <span>Add employee</span>
            </button>
          </div>
        </div>
        <div className="w-full max-w-full mx-auto bg-[#e1e0e6] rounded-[2.5rem] p-4">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Workforce Insights */}
            <Card title="Workforce Insights" className="bg-[#f5f4f6] rounded-3xl col-span-1" titleClassName="font-normal text-2xl flex flex-row items-center">
              <div className="space-y-2">
                <StatRow label="Gender" value={workforceData.gender} />
                <StatRow label="Age group" value={workforceData.ageGroup} />
                <StatRow label="Work-life balance" value={workforceData.workLifeBalance} />
                <StatRow label="Hire rate" value={workforceData.hireRate} />
                <StatRow label="Termination rate" value={workforceData.terminationRate} />
                <StatRow label="Turnover rate" value={workforceData.turnoverRate} />
                <StatRow label="Retention rate" value={workforceData.retentionRate} />
              </div>
            </Card>
            
            {/* Employee Movement */}
            <Card title="Employee Movement" className="bg-[#f5f4f6] rounded-3xl col-span-2" titleClassName="font-normal text-2xl flex flex-row items-center">
              <SankeyChart />
              <div className="flex flex-wrap text-xs mt-4 gap-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
                  <span>New Hire</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  <span>Salary change</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                  <span>Job change</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                  <span>Promotion</span>
                </div>
              </div>
            </Card>
            
            {/* Employee Satisfaction */}
            <Card title="Employee Satisfactory" className="bg-[#f5f4f6] rounded-3xl col-span-1" titleClassName="font-normal text-2xl flex flex-row items-center">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">{satisfactionData.question}</p>
                  <div className="flex space-x-2">
                    <button className="p-1 rounded-full bg-gray-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    <button className="p-1 rounded-full bg-gray-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <BarChart data={satisfactionData.responses} />
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div className="col-span-3">
              <Card title="" showExpandIcon={false} className="overflow-visible bg-[#f5f4f6] rounded-3xl">
                <div className="border-b border-gray-200">
                  <div className="flex px-4 -mt-6">
                    <button 
                      className={`px-3 py-1.5 text-sm mr-1 ${selectedTab === "Attendance" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
                      onClick={() => setSelectedTab("Attendance")}
                    >
                      Attendance
                    </button>
                    <button 
                      className={`px-3 py-1.5 text-sm mr-1 ${selectedTab === "Absences" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
                      onClick={() => setSelectedTab("Absences")}
                    >
                      Absences
                    </button>
                    <button 
                      className={`px-3 py-1.5 text-sm mr-1 whitespace-nowrap flex flex-row items-center ${selectedTab === "Day-Off Request" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
                      onClick={() => setSelectedTab("Day-Off Request")}
                    >
                      Day-Off Request
                    </button>
                    
                    <div className="ml-auto flex items-center pr-6">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button className="px-3 py-1.5 text-sm border-r border-gray-200 whitespace-nowrap flex flex-row items-center">Department</button>
                        <button className="px-3 py-1.5 text-sm border-r border-gray-200 whitespace-nowrap flex flex-row items-center">Employment Type</button>
                        <button className="px-3 py-1.5 text-sm whitespace-nowrap flex flex-row items-center">Status</button>
                      </div>
                      
                      <div className="relative ml-4">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search" 
                          className="w-64 rounded-lg bg-gray-50 pl-10 pr-4 py-2 text-sm border border-gray-200" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="py-4">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">{attendanceData.totalActive} of {attendanceData.totalEmployees} Employee</h3>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium">Day</button>
                      <button className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium">Week</button>
                      <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium">Month</button>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-1 rounded-full bg-gray-100">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                        </button>
                        <span className="font-medium">{months[currentMonth]} 2025</span>
                        <button className="p-1 rounded-full bg-gray-100">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          <div className="flex items-center">
                            <input type="checkbox" className="rounded mr-3" />
                            Employee ID
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                              <path d="M7 10l5 5 5-5"/>
                            </svg>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          <div className="flex items-center">
                            Name
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                              <path d="M7 10l5 5 5-5"/>
                            </svg>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          <div className="flex items-center">
                            Department
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                              <path d="M7 10l5 5 5-5"/>
                            </svg>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          <div className="flex items-center">
                            Check-In Time
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                              <path d="M7 10l5 5 5-5"/>
                            </svg>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          <div className="flex items-center">
                            Check-Out Time
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                              <path d="M7 10l5 5 5-5"/>
                            </svg>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          <div className="flex items-center">
                            Type
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                              <path d="M7 10l5 5 5-5"/>
                            </svg>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeesData.map((employee, index) => (
                        <tr key={employee.id} className={index !== employeesData.length - 1 ? "border-b border-gray-100" : ""}>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <input type="checkbox" className="rounded mr-3" />
                              {employee.id}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                                <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
                              </div>
                              {employee.name}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`department-${employee.department.toLowerCase()}`}>
                              {employee.department}
                            </span>
                          </td>
                          <td className="px-4 py-4">{employee.checkIn}</td>
                          <td className="px-4 py-4">{employee.checkOut}</td>
                          <td className="px-4 py-4">{employee.type}</td>
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
              </Card>
            </div>
            
            {/* Attendance Rate */}
            <Card title="Attendance Rate" className="bg-[#f5f4f6] rounded-3xl" titleClassName="font-normal text-2xl flex flex-row items-center">
              <div className="flex items-center mb-6">
                <div className="flex items-center bg-green-100 text-green-800 rounded-full px-2 py-1">
                  <ArrowUp size={14} />
                  <span className="ml-1 font-semibold text-lg">20%</span>
                </div>
                <span className="ml-2 text-gray-500 text-sm">From last month</span>
              </div>
              
              <AttendanceChart data={attendanceData.schedule} />
              
              <div className="flex justify-between text-xs text-gray-600 mt-4 pt-4 border-t border-gray-100">
                <div>11:00</div>
                <div>10:00</div>
                <div>09:00</div>
                <div>08:00</div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-600 mt-4">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
