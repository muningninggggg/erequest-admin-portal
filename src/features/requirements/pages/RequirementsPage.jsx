import { useEffect, useState } from "react";


import {
  getAllRequirements,
  getActiveTransactions,
  addRequirement,
  updateRequirement,
  setRequirementActiveStatus,
  deleteRequirement
} from "../services/requirementService";


import "../components/RequirementsPage.css";


function RequirementsPage() {

  const [requirements, setRequirements] =
    useState([]);

  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [transactionId, setTransactionId] =
    useState("");

  const [requirementText, setRequirementText] =
    useState("");

  const [displayOrder, setDisplayOrder] =
    useState("");

  const [editingRequirement, setEditingRequirement] =
    useState(null);


  /* =========================================
     LOAD DATA
     ========================================= */

  const loadData = async () => {

    try {

      setLoading(true);
      setErrorMessage("");


      const [
        requirementData,
        transactionData
      ] = await Promise.all([
        getAllRequirements(),
        getActiveTransactions()
      ]);


      setRequirements(
        requirementData
      );

      setTransactions(
        transactionData
      );


    } catch (error) {

      console.error(
        "Failed to load requirements:",
        error
      );


      setErrorMessage(
        "Unable to load requirements."
      );


    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadData();

  }, []);


  /* =========================================
     RESET FORM
     ========================================= */

  const resetForm = () => {

    setTransactionId("");
    setRequirementText("");
    setDisplayOrder("");

    setEditingRequirement(null);
  };


  /* =========================================
     ADD / UPDATE REQUIREMENT
     ========================================= */

  const handleSubmit = async (event) => {

    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");


    /* TRANSACTION VALIDATION */

    if (!transactionId) {

      setErrorMessage(
        "Please select a transaction."
      );

      return;
    }


    /* REQUIREMENT VALIDATION */

    if (!requirementText.trim()) {

      setErrorMessage(
        "Requirement is required."
      );

      return;
    }


    /* DISPLAY ORDER VALIDATION */

    if (
      !displayOrder ||
      Number(displayOrder) < 1
    ) {

      setErrorMessage(
        "Display order must be greater than 0."
      );

      return;
    }


    try {

      setSaving(true);


      /* =====================================
         EDIT EXISTING REQUIREMENT
         ===================================== */

      if (editingRequirement) {

        /*
         * requirement.id is still used
         * internally for Firestore updates.
         *
         * It is simply hidden from the admin UI.
         */

        await updateRequirement(
          editingRequirement.id,
          transactionId,
          requirementText,
          displayOrder
        );


        setSuccessMessage(
          "Requirement updated successfully."
        );


      /* =====================================
         ADD NEW REQUIREMENT
         ===================================== */

      } else {

        /*
         * Requirement ID is automatically
         * generated inside requirementService.js.
         *
         * Admin does not need to enter or see it.
         */

        await addRequirement(
          transactionId,
          requirementText,
          displayOrder
        );


        /*
         * Generated ID is intentionally NOT
         * displayed in the success message.
         */

        setSuccessMessage(
          "Requirement added successfully."
        );

      }


      resetForm();

      await loadData();


    } catch (error) {

      console.error(
        "Failed to save requirement:",
        error
      );


      setErrorMessage(
        error.message ||
        "Unable to save requirement."
      );


    } finally {

      setSaving(false);

    }
  };


  /* =========================================
     EDIT REQUIREMENT
     ========================================= */

  const handleEdit = (requirement) => {

    /*
     * Keep the complete requirement object.
     *
     * requirement.id remains available
     * internally for update operations.
     */

    setEditingRequirement(
      requirement
    );


    setTransactionId(
      requirement.transactionId || ""
    );


    setRequirementText(
      requirement.requirementText || ""
    );


    setDisplayOrder(
      requirement.displayOrder?.toString() || ""
    );


    setErrorMessage("");
    setSuccessMessage("");


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  /* =========================================
     CANCEL EDIT
     ========================================= */

  const handleCancelEdit = () => {

    resetForm();

    setErrorMessage("");
    setSuccessMessage("");
  };


  /* =========================================
     ACTIVATE / DEACTIVATE
     ========================================= */

  const handleStatusChange = async (
    requirement
  ) => {

    const newStatus =
      !requirement.isActive;


    try {

      setErrorMessage("");
      setSuccessMessage("");


      /*
       * requirement.id is still required
       * internally to update the correct
       * Firestore document.
       */

      await setRequirementActiveStatus(
        requirement.id,
        newStatus
      );


      setSuccessMessage(
        newStatus
          ? "Requirement activated successfully."
          : "Requirement deactivated successfully."
      );


      await loadData();


    } catch (error) {

      console.error(
        "Failed to update requirement status:",
        error
      );


      setErrorMessage(
        "Unable to update requirement status."
      );

    }
  };


  /* =========================================
     DELETE REQUIREMENT
     ========================================= */

  const handleDelete = async (
    requirement
  ) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${requirement.requirementText}"?\n\nThis action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    try {

      setDeletingId(
        requirement.id
      );

      setErrorMessage("");
      setSuccessMessage("");


      await deleteRequirement(
        requirement.id
      );


      /*
       * If the requirement being deleted
       * is currently being edited,
       * clear the form.
       */

      if (
        editingRequirement &&
        editingRequirement.id === requirement.id
      ) {

        resetForm();

      }


      setSuccessMessage(
        "Requirement deleted successfully."
      );


      await loadData();


    } catch (error) {

      console.error(
        "Failed to delete requirement:",
        error
      );


      setErrorMessage(
        error.message ||
        "Unable to delete requirement."
      );


    } finally {

      setDeletingId(null);

    }
  };


  /* =========================================
     GET TRANSACTION NAME
     ========================================= */

  const getTransactionName = (
    requirementTransactionId
  ) => {

    const transaction =
      transactions.find(
        (item) =>
          item.id === requirementTransactionId
      );


    return transaction
      ? transaction.name
      : requirementTransactionId
        ? "Unknown Transaction"
        : "Unknown Transaction";
  };


  /* =========================================
     UI
     ========================================= */

  return (

    <div className="requirements-page">

      <div className="requirements-container">


        {/* ===================================
            HEADER
            =================================== */}

        <header className="requirements-header">

          <h1>
            Requirements
          </h1>

          <p>
            Add and manage transaction requirements
            available in E-ReQuest.
          </p>

        </header>


        {/* ===================================
            ADD / EDIT FORM
            =================================== */}

        <section className="requirements-card">

          <h2>

            {editingRequirement
              ? "Edit Requirement"
              : "Add Requirement"}

          </h2>


          <form
            className="requirement-form"
            onSubmit={handleSubmit}
          >

            <div className="requirement-form-grid">


              {/* =============================
                  TRANSACTION
                  ============================= */}

              <div className="requirement-form-group">

                <label htmlFor="transactionId">
                  Transaction
                </label>


                <select
                  id="transactionId"
                  value={transactionId}
                  onChange={(event) =>
                    setTransactionId(
                      event.target.value
                    )
                  }
                  disabled={saving}
                >

                  <option value="">
                    Select a transaction
                  </option>


                  {transactions.map(
                    (transaction) => (

                      <option
                        key={transaction.id}
                        value={transaction.id}
                      >
                        {transaction.name}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* =============================
                  REQUIREMENT
                  ============================= */}

              <div className="requirement-form-group full-width">

                <label htmlFor="requirementText">
                  Requirement
                </label>


                <textarea
                  id="requirementText"
                  placeholder="Example: School ID"
                  value={requirementText}
                  onChange={(event) =>
                    setRequirementText(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  rows="4"
                />

              </div>


              {/* =============================
                  DISPLAY ORDER
                  ============================= */}

              <div className="requirement-form-group">

                <label htmlFor="displayOrder">
                  Display Order
                </label>


                <input
                  id="displayOrder"
                  type="number"
                  min="1"
                  placeholder="Example: 1"
                  value={displayOrder}
                  onChange={(event) =>
                    setDisplayOrder(
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

              </div>

            </div>


            {/* ===============================
                ACTION BUTTONS
                =============================== */}

            <div className="requirement-form-actions">

              <button
                type="submit"
                className="requirement-primary-button"
                disabled={saving}
              >

                {saving
                  ? "Saving..."
                  : editingRequirement
                    ? "Save Changes"
                    : "Add Requirement"}

              </button>


              {editingRequirement && (

                <button
                  type="button"
                  className="requirement-secondary-button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>

              )}

            </div>

          </form>


          {/* ERROR MESSAGE */}

          {errorMessage && (

            <div className="requirement-error">
              {errorMessage}
            </div>

          )}


          {/* SUCCESS MESSAGE */}

          {successMessage && (

            <div className="requirement-success">
              {successMessage}
            </div>

          )}

        </section>


        {/* ===================================
            EXISTING REQUIREMENTS
            =================================== */}

        <section className="requirements-card">

          <h2>
            Existing Requirements
          </h2>


          {loading ? (

            <p className="requirements-state-message">
              Loading requirements...
            </p>

          ) : requirements.length === 0 ? (

            <p className="requirements-state-message">
              No requirements found.
            </p>

          ) : (

            <div className="requirements-list">


              {requirements.map(
                (requirement) => (

                  <article
                    key={requirement.id}
                    className="requirement-item"
                  >

                    <div className="requirement-item-top">

                      <div className="requirement-information">

                        <h3>
                          {requirement.requirementText}
                        </h3>


                        {/*
                          Requirement ID is intentionally
                          hidden from the admin interface.

                          requirement.id still exists and
                          is used internally.
                        */}


                        <div className="requirement-transaction">

                          {getTransactionName(
                            requirement.transactionId
                          )}

                        </div>


                        <p className="requirement-order">

                          <strong>
                            Display Order:
                          </strong>{" "}

                          {requirement.displayOrder}

                        </p>

                      </div>


                      <span
                        className={
                          requirement.isActive
                            ? "requirement-status active"
                            : "requirement-status inactive"
                        }
                      >

                        {requirement.isActive
                          ? "Active"
                          : "Inactive"}

                      </span>

                    </div>


                    {/* ACTIONS */}

                    <div className="requirement-item-actions">


                      {/* EDIT */}

                      <button
                        type="button"
                        className="requirement-edit-button"
                        onClick={() =>
                          handleEdit(requirement)
                        }
                        disabled={
                          deletingId ===
                          requirement.id
                        }
                      >
                        Edit
                      </button>


                      {/* ACTIVATE / DEACTIVATE */}

                      <button
                        type="button"
                        className="requirement-status-button"
                        onClick={() =>
                          handleStatusChange(
                            requirement
                          )
                        }
                        disabled={
                          deletingId ===
                          requirement.id
                        }
                      >

                        {requirement.isActive
                          ? "Deactivate"
                          : "Activate"}

                      </button>


                      {/* DELETE */}

                      <button
                        type="button"
                        className="requirement-delete-button"
                        onClick={() =>
                          handleDelete(
                            requirement
                          )
                        }
                        disabled={
                          deletingId ===
                          requirement.id
                        }
                      >

                        {deletingId ===
                        requirement.id
                          ? "Deleting..."
                          : "Delete"}

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


export default RequirementsPage;