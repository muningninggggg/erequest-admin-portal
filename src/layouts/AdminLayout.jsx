import {
  NavLink,
  Outlet,
  useNavigate
} from "react-router-dom";

import { logoutAdmin } from "../features/auth/services/authService";

import "./AdminLayout.css";


/* =========================================================
   SIMPLE SVG ICONS
   No additional package required
   ========================================================= */

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />
    </svg>
  );
}


function ServicesIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M4 7h6l2-2h8v14H4V7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function TransactionsIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M7 3h7l4 4v14H7V3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M14 3v5h4M10 12h5M10 16h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}


function RequirementsIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M7 3h10v18H7V3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="m9.5 9 1.3 1.3 3-3M9.5 15l1.3 1.3 3-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function ProcedureIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M6 4h12v16H6V4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M9 8h6M9 12h6M9 16h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}


function GuidelinesIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M5 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H5V4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M19 4h-5v16a3 3 0 0 1 3-3h2V4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function AnnouncementIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M4 9v6h4l8 4V5L8 9H4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M8 15l1.5 5H12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}


function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


/* =========================================================
   ADMIN LAYOUT
   ========================================================= */

function AdminLayout() {

  const navigate = useNavigate();


  /* =========================================================
     LOGOUT
     ========================================================= */

  const handleLogout = async () => {

    try {

      await logoutAdmin();

      navigate(
        "/login",
        {
          replace: true
        }
      );

    } catch (error) {

      console.error(
        "Failed to log out administrator:",
        error
      );

      alert(
        error.message ||
        "Unable to log out. Please try again."
      );

    }

  };


  return (

    <div className="admin-layout">


      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="admin-sidebar">


        {/* BRAND */}

        <div className="admin-sidebar-brand">

          <div className="admin-sidebar-logo">
            E
          </div>


          <div className="admin-sidebar-brand-text">

            <strong>
              E-ReQuest
            </strong>

            <span>
              Admin Portal
            </span>

          </div>

        </div>



        {/* ===================================================
            NAVIGATION
            =================================================== */}

       <nav className="admin-sidebar-navigation">

  {/* DASHBOARD */}

  <NavLink
    to="/dashboard"
    className={({ isActive }) =>
      isActive
        ? "admin-nav-item active"
        : "admin-nav-item"
    }
  >

    <span className="admin-nav-icon">
      <DashboardIcon />
    </span>

    <span>
      Dashboard
    </span>

  </NavLink>


  {/* SERVICES */}

  <NavLink
    to="/services"
    className={({ isActive }) =>
      isActive
        ? "admin-nav-item active"
        : "admin-nav-item"
    }
  >

    <span className="admin-nav-icon">
      <ServicesIcon />
    </span>

    <span>
      Services
    </span>

  </NavLink>


  {/* TRANSACTIONS */}

  <NavLink
    to="/transactions"
    className={({ isActive }) =>
      isActive
        ? "admin-nav-item active"
        : "admin-nav-item"
    }
  >

    <span className="admin-nav-icon">
      <TransactionsIcon />
    </span>

    <span>
      Transactions
    </span>

  </NavLink>


  {/* ANNOUNCEMENTS */}

  <NavLink
    to="/announcements"
    className={({ isActive }) =>
      isActive
        ? "admin-nav-item active"
        : "admin-nav-item"
    }
  >

    <span className="admin-nav-icon">
      <AnnouncementIcon />
    </span>

    <span>
      Announcements
    </span>

  </NavLink>

</nav>


        {/* ===================================================
            ADMIN ACCOUNT
            =================================================== */}

        <div className="admin-sidebar-bottom">


          <div className="admin-user">

            <div className="admin-user-avatar">
              A
            </div>


            <div className="admin-user-details">

              <strong>
                Admin User
              </strong>

              <span>
                Administrator
              </span>

            </div>

          </div>



          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >

            <span className="admin-nav-icon">
              <LogoutIcon />
            </span>

            <span>
              Logout
            </span>

          </button>


        </div>


      </aside>



      {/* =====================================================
          PAGE CONTENT
          ===================================================== */}

      <main className="admin-main-content">

        <Outlet />

      </main>


    </div>

  );

}


export default AdminLayout;