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
        childtitle: "Payments",
        childlink: "finance/payments",
        id: "2.4.4",
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
        childtitle: "Assignments",
        childlink: "teacher/assignments",
        id: "3.1.2",
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
        childtitle: "Assignments",
        childlink: "student/assignments",
        id: "3.2.2",
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
        // If it's a header, we might want to show it if any of its subsequent items are visible.
        // But for simplicity, let's assume even headers or parent items might have IDs.
        // Or if it's a parent with children, check if any child is accessible.
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
