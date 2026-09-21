import { useNavigate } from "react-router-dom";
import "../components/DashboardPage.css";


function DashboardPage() {

  const navigate = useNavigate();


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
            0
          </p>

          <span>
            Available services
          </span>

        </div>



        {/* TRANSACTIONS */}

        <div className="summary-card">

          <h3>
            Transactions / Documents
          </h3>

          <p className="summary-number">
            0
          </p>

          <span>
            Available transactions
          </span>

        </div>



        {/* ANNOUNCEMENTS */}

        <div className="summary-card">

          <h3>
            Announcements
          </h3>

          <p className="summary-number">
            0
          </p>

          <span>
            Active announcements
          </span>

        </div>


      </section>



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