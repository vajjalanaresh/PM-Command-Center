// ❌ NO imports from ./types
// ❌ NO type annotations

export const INITIAL_PROJECTS = [
  {
    id: "p1",
    name: "Cloud Migration",
    startDate: "2024-05-01",
    originalEndDate: "2024-06-30",
    calculatedEndDate: "2024-06-30",
    progress: 45,
    status: "On Track",
    description: "Transferring core infrastructure to AWS VPC.",
  },
  {
    id: "p2",
    name: "Mobile App Refresh",
    startDate: "2024-05-15",
    originalEndDate: "2024-07-15",
    calculatedEndDate: "2024-07-20",
    progress: 20,
    status: "At Risk",
    description:
      "Visual redesign and performance overhaul of the iOS/Android apps.",
  },
  {
    id: "p3",
    name: "Security Audit Q2",
    startDate: "2024-06-01",
    originalEndDate: "2024-06-25",
    calculatedEndDate: "2024-06-25",
    progress: 10,
    status: "On Track",
    description: "Bi-annual compliance and penetration testing.",
  },
  {
    id: "p4",
    name: "AI Integration Beta",
    startDate: "2024-05-10",
    originalEndDate: "2024-08-01",
    calculatedEndDate: "2024-08-01",
    progress: 5,
    status: "Delayed",
    description: "Testing LLM capabilities for customer support automation.",
  },
];

export const INITIAL_TASKS = [
  {
    id: "t1",
    projectId: "p1",
    title: "Data Inventory",
    assignee: "Alice Chen",
    status: "Done",
    dueDate: "2024-05-05",
    dependencies: [],
  },
  {
    id: "t2",
    projectId: "p1",
    title: "Provider Selection",
    assignee: "Bob Smith",
    status: "In Progress",
    dueDate: "2024-05-25",
    dependencies: ["t1"],
  },
  {
    id: "t3",
    projectId: "p1",
    title: "S3 Configuration",
    assignee: "Charlie Davis",
    status: "Blocked",
    dueDate: "2024-05-20",
    dependencies: ["t2"],
    blockerDetails: {
      reason: "Pending access keys from infra",
      owner: "Infrastructure Team",
      eta: "2024-05-28",
    },
  },
  {
    id: "t4",
    projectId: "p2",
    title: "UI Design Specs",
    assignee: "Alice Chen",
    status: "Done",
    dueDate: "2024-05-18",
    dependencies: [],
  },
  {
    id: "t5",
    projectId: "p2",
    title: "React Native Setup",
    assignee: "Bob Smith",
    status: "At Risk",
    dueDate: "2024-05-22",
    dependencies: ["t4"],
  },
  {
    id: "t6",
    projectId: "p2",
    title: "API Integration",
    assignee: "Bob Smith",
    status: "Todo",
    dueDate: "2024-06-10",
    dependencies: ["t5"],
  },
];

export const INITIAL_RISKS = [
  {
    id: "r1",
    projectId: "p2",
    title: "Asset Delivery Delay",
    severity: "Medium",
    impactedTaskIds: ["t4"],
    mitigation: "Use placeholder assets until final delivery.",
    status: "Open",
  },
  {
    id: "r2",
    projectId: "p1",
    title: "Database Outage",
    severity: "High",
    impactedTaskIds: ["t3"],
    mitigation: "Setup read replicas in secondary region.",
    status: "Mitigated",
  },
];

export const INITIAL_DECISIONS = [
  {
    id: "d1",
    description: "Switched cloud provider to AWS for better scalability.",
    date: "2024-05-02",
    impactedProjectIds: ["p1"],
    impactedTaskIds: ["t2"],
  },
  {
    id: "d2",
    description: "Delayed Mobile Refresh start date due to resource conflict.",
    date: "2024-05-12",
    impactedProjectIds: ["p2"],
    impactedTaskIds: [],
  },
];
