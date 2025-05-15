export interface Employee {
  id: string;
  name: string;
  department: string;
  avatar: string;
  checkIn?: string;
  checkOut?: string;
  type?: string;
}

export interface Task {
  id: string;
  name: string;
  assignees: string[];
  project: {
    name: string;
    icon: string;
  };
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  tags: string[];
}

export interface Meeting {
  id: string;
  title: string;
  company: string;
  time: string;
  participants: number;
  date: string;
}

export interface Applicant {
  id: string;
  name: string;
  avatar: string;
  role: string;
  dateApplied: string;
  hiringStage: "Screening" | "Qualified" | "Disqualified";
}

export interface Tool {
  id: string;
  name: string;
  url?: string;
  description?: string;
  tags?: string[];
  pinned?: boolean;
  icon: string; // emoji or icon name or URL
  createdAt?: string;
  created_at?: string; // for Supabase compatibility
}

export const employeesData: Employee[] = [
  {
    id: "#1010",
    name: "Sarah Connor",
    department: "Marketing",
    avatar: "/lovable-uploads/4c1fb7e8-6547-44c3-8c1a-d3768f956fe2.png",
    checkIn: "09:14 AM",
    checkOut: "17:23 PM",
    type: "Full-Time"
  },
  {
    id: "#1014",
    name: "Jessica Brown",
    department: "HR",
    avatar: "/lovable-uploads/9d9ee4d4-81d4-4445-b4c8-19186cc9384d.png",
    checkIn: "09:14 AM",
    checkOut: "17:23 PM",
    type: "Full-Time"
  },
  {
    id: "#1018",
    name: "Michael Jordan",
    department: "Finance",
    avatar: "/lovable-uploads/fe4eec11-1aac-4a28-8f29-66c05334827d.png",
    checkIn: "09:05 AM",
    checkOut: "17:30 PM",
    type: "Full-Time"
  },
  {
    id: "#1020",
    name: "Emily Parker",
    department: "Development",
    avatar: "/lovable-uploads/9042c7e0-c2c9-4776-9920-b9ef775dec35.png",
    checkIn: "09:22 AM",
    checkOut: "17:15 PM",
    type: "Full-Time"
  },
];

export const tasksData: Task[] = [
  {
    id: "1",
    name: "Kick-off Meeting",
    assignees: ["#1010"],
    project: {
      name: "Adabor Project",
      icon: "Q"
    },
    dueDate: "Feb 17 - 27",
    priority: "High",
    tags: ["Branding", "UI/UX"]
  },
  {
    id: "2",
    name: "Creative brainstorming",
    assignees: ["#1010", "#1014"],
    project: {
      name: "Brikston Project",
      icon: "B"
    },
    dueDate: "Feb 8 - 10",
    priority: "Low",
    tags: ["Development"]
  },
  {
    id: "3",
    name: "QC Wireframe",
    assignees: ["#1010", "#1014", "#1018"],
    project: {
      name: "Tepala Mobile App",
      icon: "T"
    },
    dueDate: "Feb 10 - 12",
    priority: "High",
    tags: ["UI/UX"]
  },
  {
    id: "4",
    name: "Sync Meeting",
    assignees: ["#1020", "#1018"],
    project: {
      name: "Medicly Branding",
      icon: "M"
    },
    dueDate: "Feb 10",
    priority: "Medium",
    tags: ["Branding"]
  },
  {
    id: "5",
    name: "Brand Direction (revision)",
    assignees: ["#1010", "#1014", "#1018"],
    project: {
      name: "Hedhog Branding",
      icon: "H"
    },
    dueDate: "Feb 4 - Today",
    priority: "High",
    tags: ["Branding"]
  },
  {
    id: "6",
    name: "Wireframing Stage",
    assignees: ["#1010", "#1014"],
    project: {
      name: "Medicly Branding",
      icon: "M"
    },
    dueDate: "Feb 2 - Feb 27",
    priority: "Medium",
    tags: ["Development"]
  },
  {
    id: "7",
    name: "Usability Testing",
    assignees: ["#1010"],
    project: {
      name: "Haigela UI/UX",
      icon: "H"
    },
    dueDate: "Jan 28 - Today",
    priority: "High",
    tags: ["UI/UX"]
  }
];

export const meetingsData: Meeting[] = [
  {
    id: "1",
    title: "Onboarding Batch 1",
    company: "Sazniq Agency",
    time: "09:00 - 11:00 AM",
    participants: 2,
    date: "Mon"
  },
  {
    id: "2",
    title: "Sync Meeting",
    company: "Hedging Branding",
    time: "10:00 - 10:30 AM",
    participants: 3,
    date: "Mon"
  },
  {
    id: "3",
    title: "Kick-off Meeting",
    company: "Capita Mobile App",
    time: "09:30 - 10:30 AM",
    participants: 4,
    date: "Tue"
  },
  {
    id: "4",
    title: "Wireframing Stage",
    company: "Adabor Project",
    time: "02:00 - 04:00 PM",
    participants: 2,
    date: "Wed"
  },
  {
    id: "5",
    title: "Sync Meeting",
    company: "Capita Mobile App",
    time: "03:00 - 03:30 PM",
    participants: 2,
    date: "Wed"
  }
];

export const applicantsData: Applicant[] = [
  {
    id: "#1010",
    name: "Jacob Jones",
    avatar: "/lovable-uploads/4c1fb7e8-6547-44c3-8c1a-d3768f956fe2.png",
    role: "Marketing",
    dateApplied: "Tue, 17 Jan",
    hiringStage: "Screening"
  },
  {
    id: "#1014",
    name: "Annette Black",
    avatar: "/lovable-uploads/9d9ee4d4-81d4-4445-b4c8-19186cc9384d.png",
    role: "Sales",
    dateApplied: "Mon, 16 Jan",
    hiringStage: "Qualified"
  },
  {
    id: "#1018",
    name: "Jerome Bell",
    avatar: "/lovable-uploads/fe4eec11-1aac-4a28-8f29-66c05334827d.png",
    role: "Support",
    dateApplied: "Thu, 12 Jan",
    hiringStage: "Qualified"
  },
  {
    id: "#1020",
    name: "Wade Warren",
    avatar: "/lovable-uploads/9042c7e0-c2c9-4776-9920-b9ef775dec35.png",
    role: "Finance",
    dateApplied: "Wed, 11 Jan",
    hiringStage: "Disqualified"
  },
  {
    id: "#1024",
    name: "Dianne Russell",
    avatar: "/lovable-uploads/7cb844ab-a7c0-4a3a-a3df-ff34e31930e1.png",
    role: "HR",
    dateApplied: "Tue, 10 Jan",
    hiringStage: "Qualified"
  }
];

export const workforceData = {
  gender: 36,
  ageGroup: 24,
  workLifeBalance: 17,
  hireRate: 13,
  terminationRate: 13,
  turnoverRate: 13,
  retentionRate: 13
};

export const satisfactionData = {
  question: "How likely do you think this company is likely to succeed?",
  responses: [
    { label: "Not at all likely", percentage: 12 },
    { label: "Not so likely", percentage: 32 },
    { label: "Somewhat likely", percentage: 64 },
    { label: "Very likely", percentage: 51 },
    { label: "Extremely Likely", percentage: 95 }
  ]
};

export const attendanceData = {
  increase: 20,
  totalActive: 827,
  totalEmployees: 1240,
  schedule: [
    { time: "08:00", day: "Mon", value: 60 },
    { time: "09:00", day: "Mon", value: 90 },
    { time: "10:00", day: "Mon", value: 95 },
    { time: "11:00", day: "Mon", value: 85 },
    { time: "08:00", day: "Tue", value: 70 },
    { time: "09:00", day: "Tue", value: 85 },
    { time: "10:00", day: "Tue", value: 90 },
    { time: "11:00", day: "Tue", value: 80 },
    { time: "08:00", day: "Wed", value: 75 },
    { time: "09:00", day: "Wed", value: 90 },
    { time: "10:00", day: "Wed", value: 95 },
    { time: "11:00", day: "Wed", value: 85 },
    { time: "08:00", day: "Thu", value: 80 },
    { time: "09:00", day: "Thu", value: 95 },
    { time: "10:00", day: "Thu", value: 100 },
    { time: "11:00", day: "Thu", value: 90 },
    { time: "08:00", day: "Fri", value: 70 },
    { time: "09:00", day: "Fri", value: 85 },
    { time: "10:00", day: "Fri", value: 75 },
    { time: "11:00", day: "Fri", value: 70 },
  ]
};

export const toolsData: Tool[] = [];
