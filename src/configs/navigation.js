export const masterNavigation = [
  {
    isHeadr: true,
    title: "Dashboard",
    id: 1,
  },
  {
    title: "Analytics",
    icon: "ph:chart-line",
    link: "dashboard",
    id: 1.1,
  },
  {
    isHeadr: true,
    title: "Management",
    id: 2,
  },
  {
    title: "Academic",
    icon: "ph:books",
    link: "#",
    id: 2.1,
    child: [
      {
        childtitle: "Academic Years",
        childlink: "academic/years",
        id: "2.1.1",
      },
      {
        childtitle: "Classes & Sections",
        childlink: "academic/classes",
        id: "2.1.2",
      },
      {
        childtitle: "Subjects",
        childlink: "academic/subjects",
        id: "2.1.3",
      },
      {
        childtitle: "Time Slots",
        childlink: "academic/timeslots",
        id: "2.1.4",
      },
      {
        childtitle: "Teacher Assignments",
        childlink: "academic/assignments",
        id: "2.1.5",
      },
      {
        childtitle: "Timetable Manager",
        childlink: "academic/timetable",
        id: "2.1.6",
      },
    ],
  },
  {
    title: "Users",
    icon: "ph:users",
    link: "#",
    id: 2.2,
    child: [
      {
        childtitle: "Staff",
        childlink: "users/staff",
        id: "2.2.1",
      },
      {
        childtitle: "Students",
        childlink: "users/students",
        id: "2.2.2",
      },
      {
        childtitle: "Promotions",
        childlink: "users/promotions",
        id: "2.2.3",
      },
    ],
  },
  {
    title: "Attendance",
    icon: "ph:calendar-check",
    link: "#",
    id: 2.3,
    child: [
      {
        childtitle: "Student Attendance",
        childlink: "attendance/student",
        id: "2.3.1",
      },
      {
        childtitle: "Staff Attendance",
        childlink: "attendance/staff",
        id: "2.3.2",
      },
    ],
  },
  {
    title: "Accounts",
    icon: "ph:wallet",
    link: "#",
    id: 2.4,
    child: [
      {
        childtitle: "Fee Structures",
        childlink: "finance/fees",
        id: "2.4.1",
      },
      {
        childtitle: "Invoices",
        childlink: "finance/invoices",
        id: "2.4.2",
      },
      {
        childtitle: "Collections",
        childlink: "finance/collections",
        id: "2.4.3",
      },
      {
        childtitle: "Expenses",
        childlink: "finance/payments",
        id: "2.4.4",
      },
      {
        childtitle: "General Ledger",
        childlink: "finance/general-ledger",
        id: "2.4.5",
      },
      {
        childtitle: "Payroll Management",
        childlink: "finance/payroll",
        id: "2.4.6",
      },
    ],
  },
  {
    isHeadr: true,
    title: "LMS",
    id: 3,
  },
  {
    title: "Teacher Portal",
    icon: "ph:chalkboard-teacher",
    link: "#",
    id: 3.1,
    child: [
      {
        childtitle: "My Classes",
        childlink: "teacher/classes",
        id: "3.1.1",
      },
      {
        childtitle: "Assignment Manager",
        childlink: "teacher/assignments",
        id: "3.1.2",
      },
      {
        childtitle: "Assessment Creator",
        childlink: "teacher/assessments",
        id: "3.1.3",
      },
      {
        childtitle: "Gradebook",
        childlink: "teacher/gradebook",
        id: "3.1.4",
      },
    ],
  },
  {
    title: "Student Portal",
    icon: "ph:student",
    link: "#",
    id: 3.2,
    child: [
      {
        childtitle: "My Subjects",
        childlink: "student/subjects",
        id: "3.2.1",
      },
      {
        childtitle: "Assignment Hub",
        childlink: "student/assignments",
        id: "3.2.2",
      },
      {
        childtitle: "Assessment Center",
        childlink: "student/assessments",
        id: "3.2.3",
      },
      {
        childtitle: "My Attendance",
        childlink: "student/attendance",
        id: "3.2.4",
      },
      {
        childtitle: "Performance View",
        childlink: "student/results",
        id: "3.2.5",
      },
    ],
  },
  {
    isHeadr: true,
    title: "Settings",
    id: 4,
  },
  {
    title: "School Settings",
    icon: "ph:gear",
    link: "#",
    id: 4.1,
    child: [
      {
        childtitle: "School Profile",
        childlink: "settings/profile",
        id: "4.1.1",
      },
      {
        childtitle: "Roles & Access",
        childlink: "settings/roles",
        id: "4.1.2",
      },
    ],
  },
];

export const getNavigationByAccess = (access) => {
  if (!access || !Array.isArray(access)) return [];

  const filterMenu = (menu) => {
    return menu
      .filter((item) => {
        // If the item has an ID, check if it's in the access list
        if (item.id && access.includes(String(item.id))) {
          return true;
        }
        // If it's a parent with children, check if any child is accessible.
        if (item.child) {
          const filteredChildren = filterMenu(item.child);
          if (filteredChildren.length > 0) {
            item.child = filteredChildren;
            return true;
          }
        }
        return false;
      })
      .map((item) => ({ ...item })); // Return a copy to avoid mutating the master list
  };

  return filterMenu(masterNavigation);
};

/**
 * Helper to check if a specific moduleId is present in the user's access list.
 */
export const checkAccess = (moduleId, accessList) => {
  if (!accessList || !Array.isArray(accessList)) return false;
  return accessList.includes(String(moduleId));
};

/**
 * Helper to find the module ID associated with a given URL path.
 */
export const getModuleIdByPath = (path) => {
  if (!path || path === "/" || path === "dashboard") return "1.1";

  const normPath = path.startsWith("/") ? path.slice(1) : path;

  const findId = (menu) => {
    for (const item of menu) {
      if (item.link === normPath || item.childlink === normPath) {
        return item.id;
      }
      if (item.child) {
        const foundId = findId(item.child);
        if (foundId) return foundId;
      }
    }
    return null;
  };

  return findId(masterNavigation);
};
