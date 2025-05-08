import Header from "@/components/Header";
import { meetingsData } from "@/data/mockData";
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, Search } from "lucide-react";
import { useState } from "react";

const SchedulePage = () => {
  const [viewMode, setViewMode] = useState("Timeline");
  const [currentMonth, setCurrentMonth] = useState(0);
  const months = ["January", "February", "March", "April", "May", "June"];
  const timeSlots = ["09:00 am", "10:00 am", "11:00 am", "12:00 pm", "01:00 pm", "02:00 pm", "03:00 pm", "04:00 pm", "05:00 pm"];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-[#d2d7e4] opacity-80 z-0" />
      <div className="relative z-10 min-h-screen bg-transparent px-6 py-4">
      <Header activeTab="Schedule" />
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Schedule</h1>
            <p className="text-gray-500">
              Schedule with events: onboarding, sync meetings, and project kick-offs
            </p>
          </div>
          <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg space-x-2">
            <Plus size={18} />
            <span>New Schedule</span>
          </button>
        </div>
      </div>
      
        <div className="w-full max-w-full mx-auto bg-[#e1e0e6] rounded-[2.5rem] p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-[#f5f4f6] rounded-3xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-4 py-2">
            <div className="flex space-x-6">
              <button 
                className={`px-4 py-2 ${viewMode === "Timeline" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
                onClick={() => setViewMode("Timeline")}
              >
                Timeline
              </button>
              <button 
                className={`px-4 py-2 ${viewMode === "Kanban" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
                onClick={() => setViewMode("Kanban")}
              >
                Kanban
              </button>
              <button 
                className={`px-4 py-2 ${viewMode === "List" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
                onClick={() => setViewMode("List")}
              >
                List
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Today: Monday, 10 February 2025</h2>
              
              <div className="grid grid-cols-9 gap-0 border-b border-gray-100 pb-2 mb-6">
                <div className="text-center text-xs text-gray-500"></div> {/* Empty cell for day labels */}
                {timeSlots.map((slot, index) => (
                  <div key={index} className="text-center text-xs text-gray-500">{slot}</div>
                ))}
              </div>
              
              {daysOfWeek.map((day, dayIndex) => (
                <div key={day} className="grid grid-cols-9 gap-0 py-4 border-b border-gray-100 last:border-0 relative">
                  <div className={`flex items-center justify-center ${
                    dayIndex === 1 ? "bg-blue-500 text-white rounded-full w-8 h-8 mx-auto" : ""
                  }`}>{day}</div>

                  {dayIndex === 0 && (
                    <div className="col-start-3 col-span-2 bg-gray-100 rounded-md p-2 text-xs">
                      <div className="font-medium">Sync Meeting</div>
                      <div className="text-gray-500">Hedging Branding</div>
                      <div className="flex mt-2">
                        <div className="w-5 h-5 rounded-full overflow-hidden border-2 border-white">
                          <img src="/lovable-uploads/4c1fb7e8-6547-44c3-8c1a-d3768f956fe2.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-5 h-5 rounded-full overflow-hidden -ml-1 border-2 border-white">
                          <img src="/lovable-uploads/9d9ee4d4-81d4-4445-b4c8-19186cc9384d.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-5 h-5 rounded-full overflow-hidden -ml-1 border-2 border-white">
                          <img src="/lovable-uploads/fe4eec11-1aac-4a28-8f29-66c05334827d.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {dayIndex === 1 && (
                    <div className="col-start-2 col-span-3 bg-gray-100 rounded-md p-2 text-xs">
                      <div className="font-medium">Onboarding Batch 1</div>
                      <div className="text-gray-500">Sazniq Agency</div>
                      <div className="flex mt-2">
                        <div className="w-5 h-5 rounded-full overflow-hidden border-2 border-white">
                          <img src="/lovable-uploads/9042c7e0-c2c9-4776-9920-b9ef775dec35.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-5 h-5 rounded-full overflow-hidden -ml-1 border-2 border-white">
                          <img src="/lovable-uploads/7cb844ab-a7c0-4a3a-a3df-ff34e31930e1.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {dayIndex === 2 && (
                    <div className="col-start-4 col-span-2 bg-orange-200 rounded-md p-2 text-xs">
                      <div className="font-medium">Kick-off Meeting</div>
                      <div className="text-gray-700">Capita Mobile App</div>
                      <div className="flex mt-2">
                        <div className="w-5 h-5 rounded-full overflow-hidden border-2 border-white">
                          <img src="/lovable-uploads/4c1fb7e8-6547-44c3-8c1a-d3768f956fe2.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-5 h-5 rounded-full overflow-hidden -ml-1 border-2 border-white">
                          <img src="/lovable-uploads/9d9ee4d4-81d4-4445-b4c8-19186cc9384d.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-5 h-5 rounded-full overflow-hidden -ml-1 border-2 border-white">
                          <img src="/lovable-uploads/fe4eec11-1aac-4a28-8f29-66c05334827d.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {dayIndex === 2 && (
                    <div className="col-start-7 col-span-2 bg-gray-100 rounded-md p-2 text-xs">
                      <div className="font-medium">Wireframing Stage</div>
                      <div className="text-gray-500">Adabor Project</div>
                      <div className="flex mt-2">
                        <div className="w-5 h-5 rounded-full overflow-hidden border-2 border-white">
                          <img src="/lovable-uploads/fe4eec11-1aac-4a28-8f29-66c05334827d.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-5 h-5 rounded-full overflow-hidden -ml-1 border-2 border-white">
                          <img src="/lovable-uploads/9042c7e0-c2c9-4776-9920-b9ef775dec35.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  )}

                  {dayIndex === 3 && (
                    <div className="col-start-7 col-span-2 bg-gray-100 rounded-md p-2 text-xs">
                      <div className="font-medium">Sync Meeting</div>
                      <div className="text-gray-500">Capita Mobile App</div>
                      <div className="flex mt-2">
                        <div className="w-5 h-5 rounded-full overflow-hidden border-2 border-white">
                          <img src="/lovable-uploads/4c1fb7e8-6547-44c3-8c1a-d3768f956fe2.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-5 h-5 rounded-full overflow-hidden -ml-1 border-2 border-white">
                          <img src="/lovable-uploads/9d9ee4d4-81d4-4445-b4c8-19186cc9384d.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  )}

                  {dayIndex === 4 && (
                    <div className="col-start-3 col-span-2 bg-gray-100 rounded-md p-2 text-xs">
                      <div className="font-medium">Prototyping</div>
                      <div className="text-gray-500">Adabor Project</div>
                      <div className="flex mt-2">
                        <div className="w-5 h-5 rounded-full overflow-hidden border-2 border-white">
                          <img src="/lovable-uploads/7cb844ab-a7c0-4a3a-a3df-ff34e31930e1.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  )}

                  {dayIndex === 6 && (
                    <div className="col-start-2 col-span-2 bg-gray-100 rounded-md p-2 text-xs">
                      <div className="font-medium">Kick-off Meeting</div>
                      <div className="text-gray-500">Hedging Branding</div>
                      <div className="flex mt-2">
                        <div className="w-5 h-5 rounded-full overflow-hidden border-2 border-white">
                          <img src="/lovable-uploads/9042c7e0-c2c9-4776-9920-b9ef775dec35.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-5 h-5 rounded-full overflow-hidden -ml-1 border-2 border-white">
                          <img src="/lovable-uploads/7cb844ab-a7c0-4a3a-a3df-ff34e31930e1.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vertical divider for current time (12pm) */}
                  {dayIndex === 1 && (
                    <div className="absolute top-0 bottom-0 w-[1px] left-[calc(12.5%*4+12.5%/2)] bg-orange-300"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
            <div className="bg-[#f5f4f6] rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="w-64 rounded-lg bg-gray-50 pl-10 pr-4 py-2 text-sm border border-gray-200" 
                />
              </div>
              <button className="p-2 rounded-full bg-gray-100">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Schedule list</h3>
              
              <div className="flex justify-between items-center mb-4">
                <button className="p-1 rounded-full bg-gray-100">
                  <ChevronLeft size={16} />
                </button>
                <div className="flex space-x-3">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Mon</div>
                    <div className="text-sm">15</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Tue</div>
                    <div className="text-sm">16</div>
                  </div>
                  <div className="text-center bg-orange-500 text-white w-8 h-8 rounded-full flex flex-col items-center justify-center">
                    <div className="text-xs">Wed</div>
                    <div className="text-xs">17</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Thu</div>
                    <div className="text-sm">18</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Fri</div>
                    <div className="text-sm">19</div>
                  </div>
                </div>
                <button className="p-1 rounded-full bg-gray-100">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="bg-orange-100 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-600">Sazniq Agency</div>
                  <div className="text-lg font-semibold">• Onboarding Batch 1</div>
                </div>
                <button className="text-gray-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center mt-3">
                <Clock size={16} className="text-gray-600" />
                <span className="ml-2 text-gray-700">08:00 - 11:00 AM</span>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                      <img src="/lovable-uploads/4c1fb7e8-6547-44c3-8c1a-d3768f956fe2.png" alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                      <img src="/lovable-uploads/9d9ee4d4-81d4-4445-b4c8-19186cc9384d.png" alt="User" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <span className="ml-2 text-sm">2 participants</span>
                </div>
              </div>
              
              <button className="w-full mt-4 flex items-center justify-center bg-black text-white py-2 px-4 rounded-lg">
                <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 text-blue-400 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z" />
                </svg>
                Go to zoom link
              </button>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-600">Hedhos Branding</div>
                  <div className="text-lg font-semibold">• Kick-off Meeting</div>
                </div>
                <button className="text-gray-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center mt-3">
                <Clock size={16} className="text-gray-600" />
                <span className="ml-2 text-gray-700">09:30 - 10:30 AM</span>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                      <img src="/lovable-uploads/4c1fb7e8-6547-44c3-8c1a-d3768f956fe2.png" alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                      <img src="/lovable-uploads/9d9ee4d4-81d4-4445-b4c8-19186cc9384d.png" alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs">
                      +2
                    </div>
                  </div>
                  <span className="ml-2 text-sm">4 participants</span>
                </div>
              </div>
              
              <button className="w-full mt-4 flex items-center justify-center bg-gray-100 text-gray-700 py-2 px-4 rounded-lg">
                <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 text-blue-400 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z" />
                </svg>
                Go to zoom link
              </button>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-600">Capita Mobile App</div>
                  <div className="text-lg font-semibold">• Sync Meeting</div>
                </div>
                <button className="text-gray-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center mt-3">
                <Clock size={16} className="text-gray-600" />
                <span className="ml-2 text-gray-700">08:00 - 08:30 AM</span>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <span className="ml-2 text-sm">All members</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Will you be joining?</div>
                <div className="flex space-x-3">
                  <button className="px-4 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium">Yes</button>
                  <button className="px-4 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium">No</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-600">Adabor Project</div>
                  <div className="text-lg font-semibold">• Sync Meeting</div>
                </div>
                <button className="text-gray-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                  </svg>
                </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
