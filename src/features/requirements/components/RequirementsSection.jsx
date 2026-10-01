import { useEffect, useState } from "react";


import {
  getAllRequirements,
  addRequirement,
  updateRequirement,
  setRequirementActiveStatus,
  deleteRequirement
} from "../services/requirementService";


function RequirementsSection({
  transactionId,
  transactionName
}) {

  const [requirements, setRequirements] =
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

  const [showForm, setShowForm] =
    useState(false);

  const [requirementText, setRequirementText] =
    useState("");

  const [displayOrder, setDisplayOrder] =
    useState("");

  const [
    editingRequirement,
    setEditingRequirement
  ] = useState(null);


  /* =========================================
     LOAD REQUIREMENTS FOR SELECTED TRANSACTION
     ========================================= */

  const loadRequirements = async () => {

    if (!transactionId) {

      setRequirements([]);
      setLoading(false);

      return;
    }


    try {

      setLoading(true);
      setErrorMessage("");


      const allRequirements =
        await getAllRequirements();


      const filteredRequirements =
        allRequirements
          .filter(
            (requirement) =>
              requirement.transactionId ===
              transactionId
          )
          .sort(
            (a, b) =>
              (a.displayOrder || 0) -
              (b.displayOrder || 0)
          );


      setRequirements(
        filteredRequirements
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

    loadRequirements();

  }, [transactionId]);


  /* =========================================
     RESET FORM
     ========================================= */

  const resetForm = () => {

    setRequirementText("");
    setDisplayOrder("");

    setEditingRequirement(null);

    setShowForm(false);

  };


  /* =========================================
     ADD REQUIREMENT
     ========================================= */

  const handleAddRequirement = () => {

    setRequirementText("");


    setDisplayOrder(
      String(requirements.length + 1)
    );


    setEditingRequirement(null);

    setErrorMessage("");
    setSuccessMessage("");

    setShowForm(true);

  };


  /* =========================================
     EDIT REQUIREMENT
     ========================================= */

  const handleEdit = (requirement) => {

    setRequirementText(
      requirement.requirementText || ""
    );


    setDisplayOrder(
      requirement.displayOrder?.toString() ||
        ""
    );


    setEditingRequirement(
      requirement
    );


    setErrorMessage("");
    setSuccessMessage("");

    setShowForm(true);

  };


  /* =========================================
     SAVE REQUIREMENT
     ========================================= */

  const handleSubmit = async (event) => {

    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");


    /* TRANSACTION VALIDATION */

    if (!transactionId) {

      setErrorMessage(
        "No transaction selected."
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
         UPDATE EXISTING REQUIREMENT
         ===================================== */

      if (editingRequirement) {

        /*
         * Existing Firestore ID is retained.
         * Editing the requirement text does
         * not change its ID.
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
         * No Requirement ID is entered by
         * the admin anymore.
         *
         * requirementService.js automatically
         * generates the Requirement ID.
         */

        await addRequirement(
          transactionId,
          requirementText,
          displayOrder
        );


        setSuccessMessage(
          "Requirement added successfully."
        );

      }


      resetForm();

      await loadRequirements();


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


      await setRequirementActiveStatus(
        requirement.id,
        newStatus
      );


      setSuccessMessage(
        newStatus
          ? "Requirement activated successfully."
          : "Requirement deactivated successfully."
      );


      await loadRequirements();


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


      /*
       * Delete the requirement using
       * its internal Firestore ID.
       */

      await deleteRequirement(
        requirement.id
      );


      /*
       * If the deleted requirement is
       * currently being edited, close
       * and clear the form.
       */

      if (
        editingRequirement &&
        editingRequirement.id ===
          requirement.id
      ) {

        resetForm();

      }


      setSuccessMessage(
        "Requirement deleted successfully."
      );


      await loadRequirements();


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
     NO TRANSACTION
     ========================================= */

  if (!transactionId) {

    return null;

  }


  /* =========================================
     UI
     ========================================= */

  return (

    <section className="transaction-detail-section">


      {/* =====================================
          HEADER
          ===================================== */}

      <div className="transaction-detail-section-header">

        <div>

          <h2>
            Requirements
          </h2>

          <p>
            Requirements needed for{" "}

            <strong>
              {transactionName}
            </strong>.

          </p>

        </div>


        <button
          type="button"
          className="transaction-primary-button"
          onClick={handleAddRequirement}
          disabled={
            saving ||
            deletingId !== null
          }
        >
          + Add Requirement
        </button>

      </div>


      {/* =====================================
          MESSAGES
          ===================================== */}

      {errorMessage && (

        <div className="transaction-error">
          {errorMessage}
        </div>

      )}


      {successMessage && (

        <div className="transaction-success">
          {successMessage}
        </div>

      )}


      {/* =====================================
          ADD / EDIT FORM
          ===================================== */}

      {showForm && (

        <form
          className="embedded-management-form"
          onSubmit={handleSubmit}
        >

          <h3>

            {editingRequirement
              ? "Edit Requirement"
              : "Add Requirement"}

          </h3>


          <div className="transaction-form-grid">


            {/* DISPLAY ORDER */}

            <div className="transaction-form-group">

              <label htmlFor="embeddedDisplayOrder">
                Display Order
              </label>


              <input
                id="embeddedDisplayOrder"
                type="number"
                min="1"
                value={displayOrder}
                onChange={(event) =>
                  setDisplayOrder(
                    event.target.value
                  )
                }
                disabled={saving}
              />

            </div>


            {/* REQUIREMENT */}

            <div className="transaction-form-group full-width">

              <label htmlFor="embeddedRequirementText">
                Requirement
              </label>


              <textarea
                id="embeddedRequirementText"
                placeholder="Enter requirement"
                value={requirementText}
                onChange={(event) =>
                  setRequirementText(
                    event.target.value
                  )
                }
                disabled={saving}
                rows="3"
              />

            </div>

          </div>


          {/* FORM ACTIONS */}

          <div className="transaction-form-actions">

            <button
              type="submit"
              className="transaction-primary-button"
              disabled={saving}
            >

              {saving
                ? "Saving..."
                : editingRequirement
                  ? "Save Changes"
                  : "Add Requirement"}

            </button>


            <button
              type="button"
              className="transaction-secondary-button"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel
            </button>

          </div>

        </form>

      )}


      {/* =====================================
          REQUIREMENTS LIST
          ===================================== */}

      {loading ? (

        <p className="transactions-state-message">
          Loading requirements...
        </p>

      ) : requirements.length === 0 ? (

        <div className="embedded-empty-state">

          <p>
            No requirements have been added
            to this transaction yet.
          </p>

        </div>

      ) : (

        <div className="embedded-item-list">


          {requirements.map(
            (requirement) => (

              <div
                key={requirement.id}
                className="embedded-item"
              >


                {/* REQUIREMENT INFORMATION */}

                <div className="embedded-item-content">

                  <div className="embedded-item-order">
                    {requirement.displayOrder}
                  </div>


                  <div>

                    <h4>
                      {requirement.requirementText}
                    </h4>

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="embedded-item-actions">


                  {/* STATUS LABEL */}

                  <span
                    className={
                      requirement.isActive
                        ? "transaction-status active"
                        : "transaction-status inactive"
                    }
                  >

                    {requirement.isActive
                      ? "Active"
                      : "Inactive"}

                  </span>


                  {/* EDIT */}

                  <button
                    type="button"
                    className="transaction-edit-button"
                    onClick={() =>
                      handleEdit(
                        requirement
                      )
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
                    className="transaction-status-button"
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
                    className="transaction-delete-button"
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

              </div>

            )
          )}

        </div>

      )}

    </section>

  );

}


export default RequirementsSection;