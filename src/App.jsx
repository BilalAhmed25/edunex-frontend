import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// ── Auth Pages ─────────────────────────────────────────────────────────────
const Login        = lazy(() => import("./pages/auth/login2"));
const ForgotPass   = lazy(() => import("./pages/auth/forgot-password2"));
const Error404     = lazy(() => import("./pages/404"));

// ── Dashboard ──────────────────────────────────────────────────────────────
const Dashboard    = lazy(() => import("./pages/dashboard"));

// ── Academic ───────────────────────────────────────────────────────────────
const AcademicYears    = lazy(() => import("./pages/saas/academic/AcademicYears"));
const ClassesSections  = lazy(() => import("./pages/saas/academic/ClassesSections"));
const Subjects         = lazy(() => import("./pages/saas/academic/Subjects"));
const TimeSlotManager  = lazy(() => import("./pages/saas/academic/TimeSlotManager"));
const AdminTeacherAssignments = lazy(() => import("./pages/saas/academic/TeacherAssignments"));
const TimetableManager = lazy(() => import("./pages/saas/academic/TimetableManager"));

// ── Users ──────────────────────────────────────────────────────────────────
const Staff     = lazy(() => import("./pages/saas/users/Staff"));
const Students  = lazy(() => import("./pages/saas/users/Students"));
const Promotions= lazy(() => import("./pages/saas/users/Promotions"));

// ── Attendance ─────────────────────────────────────────────────────────────
const StudentAttendance = lazy(() => import("./pages/saas/attendance/StudentAttendance"));
const StaffAttendance   = lazy(() => import("./pages/saas/attendance/StaffAttendance"));

// ── Finance ────────────────────────────────────────────────────────────────
const FeeStructures = lazy(() => import("./pages/saas/finance/FeeStructures"));
const Invoices      = lazy(() => import("./pages/saas/finance/Invoices"));
const Collections   = lazy(() => import("./pages/saas/finance/Collections"));
const Payments      = lazy(() => import("./pages/saas/finance/Payments"));
const GeneralLedger = lazy(() => import("./pages/saas/finance/GeneralLedger"));

// ── Settings ───────────────────────────────────────────────────────────────
const SchoolProfile = lazy(() => import("./pages/saas/settings/SchoolProfile"));
const UserProfile   = lazy(() => import("./pages/saas/settings/UserProfile"));
const Roles         = lazy(() => import("./pages/saas/settings/Roles"));
const DashboardSettings = lazy(() => import("./pages/saas/settings/DashboardSettings"));

// ── Teacher ────────────────────────────────────────────────────────────────
const TeacherClasses    = lazy(() => import("./pages/saas/teacher/TeacherClasses"));
const TeacherAttendance = lazy(() => import("./pages/saas/teacher/TeacherAttendance"));
const TeacherAssignments= lazy(() => import("./pages/saas/teacher/TeacherAssignments"));
const TeacherTimetable  = lazy(() => import("./pages/saas/teacher/TeacherTimetable"));

// ── Student ────────────────────────────────────────────────────────────────
const StudentSubjects    = lazy(() => import("./pages/saas/student/StudentSubjects"));
const StudentAssignments = lazy(() => import("./pages/saas/student/StudentAssignments"));
const StudentAttend      = lazy(() => import("./pages/saas/student/StudentAttendance"));
const StudentResults     = lazy(() => import("./pages/saas/student/StudentResults"));
const StudentTimetable   = lazy(() => import("./pages/saas/student/StudentTimetable"));

// ── Layouts ────────────────────────────────────────────────────────────────
import Layout     from "./layout/Layout";
import Loading    from "@/components/Loading";
import AuthLayout from "./layout/AuthLayout";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <main className="App relative">
      <ToastContainer />
      <Routes>

        {/* ── Auth (redirect away if already logged in) ── */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Login />} />
          <Route path="forgot-password" element={<ForgotPass />} />
        </Route>

        {/* ── Protected App Shell ── */}
        <Route path="/*" element={<Layout />}>

          {/* Default redirect */}
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />

          {/* Academic */}
          <Route path="academic/years"   element={<AcademicYears />} />
          <Route path="academic/classes" element={<ClassesSections />} />
          <Route path="academic/subjects"element={<Subjects />} />
          <Route path="academic/timeslots" element={<TimeSlotManager />} />
          <Route path="academic/assignments" element={<AdminTeacherAssignments />} />
          <Route path="academic/timetable" element={<TimetableManager />} />

          {/* Users */}
          <Route path="users/staff"    element={<Staff />} />
          <Route path="users/students" element={<Students />} />
          <Route path="users/promotions" element={<Promotions />} />

          {/* Attendance */}
          <Route path="attendance/student" element={<StudentAttendance />} />
          <Route path="attendance/staff"   element={<StaffAttendance />} />

          {/* Finance */}
          <Route path="finance/fees"     element={<FeeStructures />} />
          <Route path="finance/invoices" element={<Invoices />} />
          <Route path="finance/collections" element={<Collections />} />
          <Route path="finance/payments" element={<Payments />} />
          <Route path="finance/general-ledger" element={<GeneralLedger />} />

          {/* Settings */}
          <Route path="settings/profile" element={<SchoolProfile />} />
          <Route path="user-profile"   element={<UserProfile />} />
          <Route path="settings/roles"   element={<Roles />} />
          <Route path="settings/dashboard" element={<DashboardSettings />} />

          {/* Teacher */}
          <Route path="teacher/classes"    element={<TeacherClasses />} />
          <Route path="teacher/attendance" element={<TeacherAttendance />} />
          <Route path="teacher/assignments"element={<TeacherAssignments />} />
          <Route path="teacher/timetable"  element={<TeacherTimetable />} />

          {/* Student */}
          <Route path="student/subjects"    element={<StudentSubjects />} />
          <Route path="student/assignments" element={<StudentAssignments />} />
          <Route path="student/attendance"  element={<StudentAttend />} />
          <Route path="student/results"     element={<StudentResults />} />
          <Route path="student/timetable"   element={<StudentTimetable />} />

          {/* Catch-all → 404 */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>

        {/* 404 */}
        <Route
          path="/404"
          element={
            <Suspense fallback={<Loading />}>
              <Error404 />
            </Suspense>
          }
        />

      </Routes>
    </main>
  );
}

export default App;
