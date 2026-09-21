import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllTransactions,
  getActiveServices,
  setTransactionActiveStatus
} from "../services/transactionService";

import "../components/TransactionsPage.css";


function TransactionsPage() {

  const navigate = useNavigate();

  const [transactions, setTransactions] =
    useState([]);

  const [services, setServices] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [serviceFilter, setServiceFilter] =
    useState("");


  /* =========================================================
     LOAD DATA
     ========================================================= */

  const loadData = async () => {

    try {

      setLoading(true);
      setErrorMessage("");


      const [
        transactionData,
        serviceData
      ] = await Promise.all([
        getAllTransactions(),
        getActiveServices()
      ]);


      setTransactions(transactionData);
      setServices(serviceData);


    } catch (error) {

      console.error(
        "Failed to load transactions:",
        error
      );


      setErrorMessage(
        "Unable to load transactions."
      );


    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadData();

  }, []);


  /* =========================================================
     NAVIGATION
     ========================================================= */

  const handleAddTransaction = () => {

    navigate("/transactions/add");

  };


  const handleEdit = (transaction) => {

    navigate(
      `/transactions/edit/${transaction.id}`
    );

  };


  const handleManage = (transaction) => {

    navigate(
      `/transactions/manage/${transaction.id}`
    );

  };


  /* =========================================================
     SERVICE NAME
     ========================================================= */

  const getServiceName = (
    transactionServiceId
  ) => {

    const service =
      services.find(
        (item) =>
          item.id === transactionServiceId
      );


    return service
      ? service.name
      : transactionServiceId ||
          "Unknown Service";

  };


  /* =========================================================
     ACTIVATE / DEACTIVATE
     ========================================================= */

  const handleStatusChange = async (
    transaction
  ) => {

    const newStatus =
      !transaction.isActive;


    try {

      setUpdatingId(transaction.id);

      setErrorMessage("");
      setSuccessMessage("");


      await setTransactionActiveStatus(
        transaction.id,
        newStatus
      );


      setSuccessMessage(
        newStatus
          ? `${transaction.name} activated successfully.`
          : `${transaction.name} deactivated successfully.`
      );


      await loadData();


    } catch (error) {

      console.error(
        "Failed to update transaction status:",
        error
      );


      setErrorMessage(
        "Unable to update transaction status."
      );


    } finally {

      setUpdatingId(null);

    }

  };


  /* =========================================================
     FILTER
     ========================================================= */

  const filteredTransactions =
    serviceFilter
      ? transactions.filter(
          (transaction) =>
            transaction.serviceId ===
            serviceFilter
        )
      : transactions;


  /* =========================================================
     UI
     ========================================================= */

  return (

    <div className="transactions-page">

      <div className="transactions-container">


        {/* ===================================================
            HEADER
            =================================================== */}

        <header className="transactions-header">

          <div className="transactions-header-content">

            <div>

              <h1>
                Transactions / Documents
              </h1>

              <p>
                Manage school transactions and
                documents available in E-ReQuest.
              </p>

            </div>


            <button
              type="button"
              className="transaction-primary-button"
              onClick={handleAddTransaction}
            >
              + Add Transaction / Document
            </button>

          </div>

        </header>



        {/* ===================================================
            MESSAGES
            =================================================== */}

        {errorMessage && (

          <div className="transaction-error transaction-page-message">
            {errorMessage}
          </div>

        )}


        {successMessage && (

          <div className="transaction-success transaction-page-message">
            {successMessage}
          </div>

        )}



        {/* ===================================================
            TRANSACTION LIST
            =================================================== */}

        <section className="transactions-card">


          {/* LIST HEADER */}

          <div className="transaction-list-heading">

            <div>

              <h2>
                Available Transactions / Documents
              </h2>

              <p>
                Select a transaction to manage or
                edit its information.
              </p>

            </div>



            {/* FILTER */}

            <div className="transaction-service-filter">

              <label htmlFor="serviceFilter">
                Service
              </label>


              <select
                id="serviceFilter"
                value={serviceFilter}
                onChange={(event) =>
                  setServiceFilter(
                    event.target.value
                  )
                }
              >

                <option value="">
                  All Services
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

          </div>



          {/* LOADING */}

          {loading ? (

            <p className="transactions-state-message">
              Loading transactions...
            </p>

          ) : filteredTransactions.length === 0 ? (

            <p className="transactions-state-message">
              No transactions found.
            </p>

          ) : (

            <div className="transactions-list">


              {filteredTransactions.map(
                (transaction) => (

                  <article
                    key={transaction.id}
                    className="transaction-item"
                  >


                    {/* TOP */}

                    <div className="transaction-item-top">


                      {/* INFORMATION */}

                      <div className="transaction-information">

                        <h3>
                          {transaction.name}
                        </h3>


                        <p className="transaction-id">
                          ID: {transaction.id}
                        </p>


                        <div className="transaction-service">

                          {getServiceName(
                            transaction.serviceId
                          )}

                        </div>


                        <p className="transaction-description">

                          {transaction.description ||
                            "No description"}

                        </p>


                        <div className="transaction-office-info">

                          <p>

                            <strong>
                              Office:
                            </strong>{" "}

                            {transaction.officeName ||
                              "Not specified"}

                          </p>


                          <p>

                            <strong>
                              Schedule:
                            </strong>{" "}

                            {transaction.officeSchedule ||
                              "Not specified"}

                          </p>

                        </div>

                      </div>



                      {/* STATUS */}

                      <span
                        className={
                          transaction.isActive
                            ? "transaction-status active"
                            : "transaction-status inactive"
                        }
                      >

                        {transaction.isActive
                          ? "Active"
                          : "Inactive"}

                      </span>

                    </div>



                    {/* ACTION BUTTONS */}

                    <div className="transaction-item-actions">


                      {/* MANAGE */}

                      <button
                        type="button"
                        className="transaction-manage-button"
                        onClick={() =>
                          handleManage(
                            transaction
                          )
                        }
                      >
                        Manage
                      </button>



                      {/* EDIT */}

                      <button
                        type="button"
                        className="transaction-edit-button"
                        onClick={() =>
                          handleEdit(
                            transaction
                          )
                        }
                      >
                        Edit Info
                      </button>



                      {/* ACTIVATE / DEACTIVATE */}

                      <button
                        type="button"
                        className="transaction-status-button"
                        onClick={() =>
                          handleStatusChange(
                            transaction
                          )
                        }
                        disabled={
                          updatingId ===
                          transaction.id
                        }
                      >

                        {updatingId ===
                        transaction.id
                          ? "Updating..."
                          : transaction.isActive
                            ? "Deactivate"
                            : "Activate"}

                      </button>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </div>

  );

}


export default TransactionsPage;