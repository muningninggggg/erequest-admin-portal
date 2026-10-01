import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  getAllServices
} from "../../services/services/serviceService";

import {
  getAllTransactions
} from "../../transactions/services/transactionService";

import {
  getAllAnnouncements
} from "../../announcements/services/announcementService";

import AdminSearch
  from "../../search/components/AdminSearch";

import "../components/DashboardPage.css";


function DashboardPage() {

  const navigate = useNavigate();


  /* =========================================================
     DASHBOARD COUNTS
     ========================================================= */

  const [serviceCount, setServiceCount] =
    useState(0);

  const [transactionCount, setTransactionCount] =
    useState(0);

  const [announcementCount, setAnnouncementCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");


  /* =========================================================
     LOAD DASHBOARD DATA
     ========================================================= */

  const loadDashboardData = async () => {

    try {

      setLoading(true);
      setErrorMessage("");


      const [
        services,
        transactions,
        announcements
      ] = await Promise.all([

        getAllServices(),

        getAllTransactions(),

        getAllAnnouncements()

      ]);


      /* =====================================================
         ACTIVE SERVICES
         ===================================================== */

      const activeServices =
        services.filter(
          (service) =>
            service.isActive === true
        );


      /* =====================================================
         ACTIVE TRANSACTIONS
         ===================================================== */

      const activeTransactions =
        transactions.filter(
          (transaction) =>
            transaction.isActive === true
        );


      /* =====================================================
         ACTIVE ANNOUNCEMENTS
         ===================================================== */

      const activeAnnouncements =
        announcements.filter(
          (announcement) =>
            announcement.isActive === true
        );


      /* =====================================================
         UPDATE COUNTS
         ===================================================== */

      setServiceCount(
        activeServices.length
      );


      setTransactionCount(
        activeTransactions.length
      );


      setAnnouncementCount(
        activeAnnouncements.length
      );


    } catch (error) {

      console.error(
        "Failed to load dashboard data:",
        error
      );


      setErrorMessage(
        "Unable to load dashboard summary."
      );


    } finally {

      setLoading(false);

    }

  };


  /* =========================================================
     LOAD WHEN DASHBOARD OPENS
     ========================================================= */

  useEffect(() => {

    loadDashboardData();

  }, []);


  /* =========================================================
     UI
     ========================================================= */

  return (

    <div className="dashboard-page">


      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="dashboard-header">


        {/* LEFT SIDE */}

        <div className="dashboard-header-text">

          <h1>
            Dashboard
          </h1>

          <p>
            Welcome to the E-ReQuest Administrator Portal.
          </p>

        </div>


        {/* RIGHT SIDE - GLOBAL SEARCH */}

        <div className="dashboard-header-search">

          <AdminSearch />

        </div>


      </header>


      {/* =====================================================
          SUMMARY CARDS
          ===================================================== */}

      <section className="dashboard-summary">


        {/* SERVICES */}

        <div className="summary-card">

          <h3>
            Services
          </h3>

          <p className="summary-number">

            {loading
              ? "..."
              : serviceCount}

          </p>

          <span>
            Active services
          </span>

        </div>


        {/* TRANSACTIONS */}

        <div className="summary-card">

          <h3>
            Transactions / Documents
          </h3>

          <p className="summary-number">

            {loading
              ? "..."
              : transactionCount}

          </p>

          <span>
            Active transactions
          </span>

        </div>


        {/* ANNOUNCEMENTS */}

        <div className="summary-card">

          <h3>
            Announcements
          </h3>

          <p className="summary-number">

            {loading
              ? "..."
              : announcementCount}

          </p>

          <span>
            Active announcements
          </span>

        </div>


      </section>


      {/* =====================================================
          ERROR MESSAGE
          ===================================================== */}

      {errorMessage && (

        <p className="dashboard-error-message">

          {errorMessage}

        </p>

      )}


      {/* =====================================================
          CONTENT MANAGEMENT
          ===================================================== */}

      <section className="dashboard-content">

        <div className="dashboard-panel">


          <h2>
            Content Management
          </h2>


          <p>
            Manage the information displayed in the
            E-ReQuest student application.
          </p>


          <div className="management-grid">


            {/* SERVICES */}

            <button
              type="button"
              onClick={() =>
                navigate("/services")
              }
            >
              Services
            </button>


            {/* TRANSACTIONS */}

            <button
              type="button"
              onClick={() =>
                navigate("/transactions")
              }
            >
              Transactions / Documents
            </button>


            {/* ANNOUNCEMENTS */}

            <button
              type="button"
              onClick={() =>
                navigate("/announcements")
              }
            >
              Announcements
            </button>


          </div>

        </div>

      </section>


    </div>

  );

}


export default DashboardPage;