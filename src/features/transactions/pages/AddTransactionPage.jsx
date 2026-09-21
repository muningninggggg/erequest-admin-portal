import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getActiveServices,
  addTransaction
} from "../services/transactionService";

import "../components/AddTransactionPage.css";


function AddTransactionPage() {

  const navigate = useNavigate();

  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [transactionId, setTransactionId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [officeName, setOfficeName] = useState("");
  const [officeSchedule, setOfficeSchedule] = useState("");


  /* =========================================================
     LOAD SERVICES
     ========================================================= */

  useEffect(() => {

    const loadServices = async () => {

      try {

        setLoading(true);
        setErrorMessage("");

        const serviceData =
          await getActiveServices();

        setServices(serviceData);


      } catch (error) {

        console.error(
          "Failed to load services:",
          error
        );

        setErrorMessage(
          "Unable to load services."
        );


      } finally {

        setLoading(false);

      }

    };


    loadServices();

  }, []);


  /* =========================================================
     ADD TRANSACTION
     ========================================================= */

  const handleSubmit = async (event) => {

    event.preventDefault();

    setErrorMessage("");


    if (!transactionId.trim()) {

      setErrorMessage(
        "Transaction ID is required."
      );

      return;

    }


    if (!serviceId) {

      setErrorMessage(
        "Please select a service."
      );

      return;

    }


    if (!name.trim()) {

      setErrorMessage(
        "Transaction / Document Name is required."
      );

      return;

    }


    try {

      setSaving(true);


      await addTransaction(
        transactionId,
        serviceId,
        name,
        description,
        officeName,
        officeSchedule
      );


      /*
       * After successful creation,
       * return to Transactions / Documents.
       */

      navigate("/transactions", {
        replace: true
      });


    } catch (error) {

      console.error(
        "Failed to add transaction:",
        error
      );


      setErrorMessage(
        error.message ||
        "Unable to add transaction."
      );


    } finally {

      setSaving(false);

    }

  };


  /* =========================================================
     CANCEL
     ========================================================= */

  const handleCancel = () => {

    navigate("/transactions");

  };


  /* =========================================================
     UI
     ========================================================= */

  return (

    <div className="add-transaction-page">

      <div className="add-transaction-container">


        {/* HEADER */}

        <div className="add-transaction-header">

          <button
            type="button"
            className="add-transaction-back-button"
            onClick={handleCancel}
          >
            ← Back to Transactions
          </button>


          <div>

            <h1>
              Add Transaction / Document
            </h1>

            <p>
              Create a new transaction or document
              and assign it to a school service.
            </p>

          </div>

        </div>



        {/* FORM CARD */}

        <section className="add-transaction-card">


          {loading ? (

            <div className="add-transaction-loading">
              Loading services...
            </div>

          ) : (

            <form
              className="add-transaction-form"
              onSubmit={handleSubmit}
            >


              {/* ERROR */}

              {errorMessage && (

                <div className="add-transaction-error">
                  {errorMessage}
                </div>

              )}



              {/* FORM GRID */}

              <div className="add-transaction-form-grid">


                {/* TRANSACTION ID */}

                <div className="add-transaction-form-group">

                  <label htmlFor="transactionId">
                    Transaction ID
                  </label>

                  <input
                    id="transactionId"
                    type="text"
                    placeholder="Example: prospectus_request"
                    value={transactionId}
                    onChange={(event) =>
                      setTransactionId(
                        event.target.value
                      )
                    }
                    disabled={saving}
                  />

                  <small>
                    Use a unique ID without spaces.
                  </small>

                </div>



                {/* SERVICE */}

                <div className="add-transaction-form-group">

                  <label htmlFor="serviceId">
                    Service
                  </label>

                  <select
                    id="serviceId"
                    value={serviceId}
                    onChange={(event) =>
                      setServiceId(
                        event.target.value
                      )
                    }
                    disabled={saving}
                  >

                    <option value="">
                      Select a service
                    </option>


                    {services.map(
                      (service) => (

                        <option
                          key={service.id}
                          value={service.id}
                        >
                          {service.name}
                        </option>

                      )
                    )}

                  </select>

                </div>



                {/* NAME */}

                <div className="add-transaction-form-group full-width">

                  <label htmlFor="transactionName">
                    Transaction / Document Name
                  </label>

                  <input
                    id="transactionName"
                    type="text"
                    placeholder="Example: PROSPECTUS - Request"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    disabled={saving}
                  />

                </div>



                {/* DESCRIPTION */}

                <div className="add-transaction-form-group full-width">

                  <label htmlFor="description">
                    Description
                  </label>

                  <textarea
                    id="description"
                    placeholder="Enter transaction description"
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    disabled={saving}
                    rows="5"
                  />

                </div>



                {/* OFFICE NAME */}

                <div className="add-transaction-form-group">

                  <label htmlFor="officeName">
                    Office Name
                  </label>

                  <input
                    id="officeName"
                    type="text"
                    placeholder="Example: Registrar Office"
                    value={officeName}
                    onChange={(event) =>
                      setOfficeName(
                        event.target.value
                      )
                    }
                    disabled={saving}
                  />

                </div>



                {/* OFFICE SCHEDULE */}

                <div className="add-transaction-form-group">

                  <label htmlFor="officeSchedule">
                    Office Schedule
                  </label>

                  <input
                    id="officeSchedule"
                    type="text"
                    placeholder="Example: Monday to Friday"
                    value={officeSchedule}
                    onChange={(event) =>
                      setOfficeSchedule(
                        event.target.value
                      )
                    }
                    disabled={saving}
                  />

                </div>

              </div>



              {/* ACTIONS */}

              <div className="add-transaction-actions">

                <button
                  type="button"
                  className="add-transaction-cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="add-transaction-submit-button"
                  disabled={saving}
                >

                  {saving
                    ? "Adding Transaction..."
                    : "Add Transaction"}

                </button>

              </div>

            </form>

          )}

        </section>

      </div>

    </div>

  );

}


export default AddTransactionPage;