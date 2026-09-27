import {
  useEffect,
  useState
} from "react";

import { useNavigate } from "react-router-dom";

import {
  getAllServices
} from "../../services/services/serviceService";

import {
  getAllTransactions
} from "../../transactions/services/transactionService";

import {
  getAllAnnouncements
} from "../../announcements/services/announcementService";

import "../components/DashboardPage.css";


function DashboardPage() {

  const navigate = useNavigate();


  /* =========================================
     SUMMARY COUNTS
     ========================================= */

  const [serviceCount, setServiceCount] =
    useState(0);

  const [transactionCount, setTransactionCount] =
    useState(0);

  const [announcementCount, setAnnouncementCount] =
    useState(0);

  const [loadingSummary, setLoadingSummary] =
    useState(true);

  const [summaryError, setSummaryError] =
    useState("");


  /* =========================================
     LOAD DASHBOARD SUMMARY
     ========================================= */

  const loadDashboardSummary = async () => {

    try {

      setLoadingSummary(true);
      setSummaryError("");


      /*
       * Load the same Firestore data used
       * by Content Management.
       */

      const [
        services,
        transactions,
        announcements
      ] = await Promise.all([

        getAllServices(),

        getAllTransactions(),

        getAllAnnouncements()

      ]);


      /* =====================================
         SERVICES

         Count active services only.
         ===================================== */

      const activeServices =
        services.filter(
          (service) =>
            service.isActive === true
        );


      setServiceCount(
        activeServices.length
      );


      /* =====================================
         TRANSACTIONS

         Count active transactions only.
         ===================================== */

      const activeTransactions =
        transactions.filter(
          (transaction) =>
            transaction.isActive === true
        );


      setTransactionCount(
        activeTransactions.length
      );


      /* =====================================
         ANNOUNCEMENTS

         Dashboard specifically says:
         "Active announcements"
         ===================================== */

      const activeAnnouncements =
        announcements.filter(
          (announcement) =>
            announcement.isActive === true
        );


      setAnnouncementCount(
        activeAnnouncements.length
      );


    } catch (error) {

      console.error(
        "Failed to load dashboard summary:",
        error
      );


      setSummaryError(
        "Unable to load dashboard summary."
      );


    } finally {

      setLoadingSummary(false);

    }

  };


  /* =========================================
     LOAD WHEN DASHBOARD OPENS
     ========================================= */

  useEffect(() => {

    loadDashboardSummary();

  }, []);


  /* =========================================
     UI
     ========================================= */

  return (

    <div className="dashboard-page">


      {/* ================================
          HEADER
         ================================ */}

      <header className="dashboard-header">

        <div>

          <h1>
            Dashboard
          </h1>

          <p>
            Welcome to the E-ReQuest Administrator Portal.
          </p>

        </div>

      </header>



      {/* ================================
          SUMMARY
         ================================ */}

      <section className="dashboard-summary">


        {/* SERVICES */}

        <div className="summary-card">

          <h3>
            Services
          </h3>

          <p className="summary-number">

            {loadingSummary
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

            {loadingSummary
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

            {loadingSummary
              ? "..."
              : announcementCount}

          </p>

          <span>
            Active announcements
          </span>

        </div>


      </section>


      {/* ERROR MESSAGE */}

      {summaryError && (

        <p
          style={{
            textAlign: "center",
            marginTop: "12px"
          }}
        >
          {summaryError}
        </p>

      )}



      {/* ================================
          CONTENT MANAGEMENT
         ================================ */}

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