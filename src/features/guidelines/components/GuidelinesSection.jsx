import { useEffect, useState } from "react";

import {
  getAllGuidelines,
  addGuideline,
  updateGuideline,
  setGuidelineActiveStatus
} from "../services/guidelineService";


function GuidelinesSection({
  transactionId,
  transactionName
}) {

  const [guidelines, setGuidelines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [guidelineId, setGuidelineId] = useState("");
  const [guidelineText, setGuidelineText] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");

  const [editingGuideline, setEditingGuideline] =
    useState(null);


  /* =========================================
     LOAD GUIDELINES
     ========================================= */

  const loadGuidelines = async () => {

    if (!transactionId) {

      setGuidelines([]);
      setLoading(false);

      return;

    }


    try {

      setLoading(true);
      setErrorMessage("");


      const allGuidelines =
        await getAllGuidelines();


      const filteredGuidelines =
        allGuidelines
          .filter(
            (guideline) =>
              guideline.transactionId ===
              transactionId
          )
          .sort(
            (a, b) =>
              (a.displayOrder || 0) -
              (b.displayOrder || 0)
          );


      setGuidelines(
        filteredGuidelines
      );


    } catch (error) {

      console.error(
        "Failed to load guidelines:",
        error
      );


      setErrorMessage(
        "Unable to load guidelines."
      );


    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadGuidelines();

  }, [transactionId]);


  /* =========================================
     RESET FORM
     ========================================= */

  const resetForm = () => {

    setGuidelineId("");
    setGuidelineText("");
    setDisplayOrder("");

    setEditingGuideline(null);
    setShowForm(false);

  };


  /* =========================================
     ADD GUIDELINE
     ========================================= */

  const handleAddGuideline = () => {

    setGuidelineId("");
    setGuidelineText("");

    setDisplayOrder(
      String(guidelines.length + 1)
    );

    setEditingGuideline(null);

    setErrorMessage("");
    setSuccessMessage("");

    setShowForm(true);

  };


  /* =========================================
     EDIT GUIDELINE
     ========================================= */

  const handleEdit = (guideline) => {

    setGuidelineId(
      guideline.id
    );

    setGuidelineText(
      guideline.guidelineText || ""
    );

    setDisplayOrder(
      guideline.displayOrder?.toString() || ""
    );

    setEditingGuideline(
      guideline
    );

    setErrorMessage("");
    setSuccessMessage("");

    setShowForm(true);

  };


  /* =========================================
     SAVE GUIDELINE
     ========================================= */

  const handleSubmit = async (event) => {

    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");


    if (!transactionId) {

      setErrorMessage(
        "No transaction selected."
      );

      return;

    }


    if (!guidelineText.trim()) {

      setErrorMessage(
        "Guideline is required."
      );

      return;

    }


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


      if (editingGuideline) {

        await updateGuideline(
          editingGuideline.id,
          transactionId,
          guidelineText,
          displayOrder
        );


        setSuccessMessage(
          "Guideline updated successfully."
        );


      } else {

        if (!guidelineId.trim()) {

          setErrorMessage(
            "Guideline ID is required."
          );

          return;

        }


        await addGuideline(
          guidelineId,
          transactionId,
          guidelineText,
          displayOrder
        );


        setSuccessMessage(
          "Guideline added successfully."
        );

      }


      resetForm();

      await loadGuidelines();


    } catch (error) {

      console.error(
        "Failed to save guideline:",
        error
      );


      setErrorMessage(
        error.message ||
        "Unable to save guideline."
      );


    } finally {

      setSaving(false);

    }

  };


  /* =========================================
     ACTIVATE / DEACTIVATE
     ========================================= */

  const handleStatusChange = async (
    guideline
  ) => {

    const newStatus =
      !guideline.isActive;


    try {

      setErrorMessage("");
      setSuccessMessage("");


      await setGuidelineActiveStatus(
        guideline.id,
        newStatus
      );


      setSuccessMessage(
        newStatus
          ? "Guideline activated successfully."
          : "Guideline deactivated successfully."
      );


      await loadGuidelines();


    } catch (error) {

      console.error(
        "Failed to update guideline status:",
        error
      );


      setErrorMessage(
        "Unable to update guideline status."
      );

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


      {/* HEADER */}

      <div className="transaction-detail-section-header">

        <div>

          <h2>
            Guidelines
          </h2>

          <p>
            Manage the guidelines for{" "}
            <strong>
              {transactionName}
            </strong>.
          </p>

        </div>


        <button
          type="button"
          className="transaction-primary-button"
          onClick={handleAddGuideline}
        >
          + Add Guideline
        </button>

      </div>



      {/* ERROR */}

      {errorMessage && (

        <div className="transaction-error">
          {errorMessage}
        </div>

      )}



      {/* SUCCESS */}

      {successMessage && (

        <div className="transaction-success">
          {successMessage}
        </div>

      )}



      {/* ADD / EDIT FORM */}

      {showForm && (

        <form
          className="embedded-management-form"
          onSubmit={handleSubmit}
        >

          <h3>
            {editingGuideline
              ? "Edit Guideline"
              : "Add Guideline"}
          </h3>


          <div className="transaction-form-grid">


            {/* GUIDELINE ID */}

            <div className="transaction-form-group">

              <label htmlFor="guidelineId">
                Guideline ID
              </label>

              <input
                id="guidelineId"
                type="text"
                placeholder="Example: prospectus_guide_3"
                value={guidelineId}
                onChange={(event) =>
                  setGuidelineId(
                    event.target.value
                  )
                }
                disabled={
                  saving ||
                  editingGuideline !== null
                }
              />

            </div>



            {/* DISPLAY ORDER */}

            <div className="transaction-form-group">

              <label htmlFor="guidelineDisplayOrder">
                Display Order
              </label>

              <input
                id="guidelineDisplayOrder"
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



            {/* GUIDELINE */}

            <div className="transaction-form-group full-width">

              <label htmlFor="guidelineText">
                Guideline
              </label>

              <textarea
                id="guidelineText"
                placeholder="Enter guideline"
                value={guidelineText}
                onChange={(event) =>
                  setGuidelineText(
                    event.target.value
                  )
                }
                disabled={saving}
                rows="4"
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
                : editingGuideline
                  ? "Save Changes"
                  : "Add Guideline"}

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



      {/* GUIDELINES LIST */}

      {loading ? (

        <p className="transactions-state-message">
          Loading guidelines...
        </p>

      ) : guidelines.length === 0 ? (

        <div className="embedded-empty-state">

          <p>
            No guidelines have been added
            to this transaction yet.
          </p>

        </div>

      ) : (

        <div className="embedded-item-list">


          {guidelines.map(
            (guideline) => (

              <div
                key={guideline.id}
                className="embedded-item"
              >


                {/* CONTENT */}

                <div className="embedded-item-content">


                  <div className="embedded-item-order">
                    {guideline.displayOrder}
                  </div>


                  <div>

                    <h4>
                      {guideline.guidelineText}
                    </h4>

                    <p>
                      ID: {guideline.id}
                    </p>

                  </div>

                </div>



                {/* ACTIONS */}

                <div className="embedded-item-actions">


                  <span
                    className={
                      guideline.isActive
                        ? "transaction-status active"
                        : "transaction-status inactive"
                    }
                  >

                    {guideline.isActive
                      ? "Active"
                      : "Inactive"}

                  </span>


                  <button
                    type="button"
                    className="transaction-edit-button"
                    onClick={() =>
                      handleEdit(
                        guideline
                      )
                    }
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    className="transaction-status-button"
                    onClick={() =>
                      handleStatusChange(
                        guideline
                      )
                    }
                  >

                    {guideline.isActive
                      ? "Deactivate"
                      : "Activate"}

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


export default GuidelinesSection;