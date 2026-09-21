import { useEffect, useState } from "react";

import {
  getAllRequirements,
  getActiveTransactions,
  addRequirement,
  updateRequirement,
  setRequirementActiveStatus
} from "../services/requirementService";

import "../components/RequirementsPage.css";


function RequirementsPage() {

  const [requirements, setRequirements] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [requirementId, setRequirementId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [requirementText, setRequirementText] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");

  const [editingRequirement, setEditingRequirement] =
    useState(null);


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

      setRequirements(requirementData);
      setTransactions(transactionData);

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


  const resetForm = () => {

    setRequirementId("");
    setTransactionId("");
    setRequirementText("");
    setDisplayOrder("");

    setEditingRequirement(null);

  };


  const handleSubmit = async (event) => {

    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");


    if (!transactionId) {

      setErrorMessage(
        "Please select a transaction."
      );

      return;

    }


    if (!requirementText.trim()) {

      setErrorMessage(
        "Requirement is required."
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


      if (editingRequirement) {

        await updateRequirement(
          editingRequirement.id,
          transactionId,
          requirementText,
          displayOrder
        );

        setSuccessMessage(
          "Requirement updated successfully."
        );

      } else {

        if (!requirementId.trim()) {

          setErrorMessage(
            "Requirement ID is required."
          );

          return;

        }


        await addRequirement(
          requirementId,
          transactionId,
          requirementText,
          displayOrder
        );

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


  const handleEdit = (requirement) => {

    setEditingRequirement(requirement);

    setRequirementId(requirement.id);

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


  const handleCancelEdit = () => {

    resetForm();

    setErrorMessage("");
    setSuccessMessage("");

  };


  const handleStatusChange = async (requirement) => {

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


  const getTransactionName = (
    requirementTransactionId
  ) => {

    const transaction = transactions.find(
      (item) =>
        item.id === requirementTransactionId
    );

    return transaction
      ? transaction.name
      : requirementTransactionId ||
          "Unknown Transaction";

  };


  return (

    <div className="requirements-page">

      <div className="requirements-container">


        <header className="requirements-header">

          <h1>
            Requirements
          </h1>

          <p>
            Add and manage transaction requirements
            available in E-ReQuest.
          </p>

        </header>


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


              <div className="requirement-form-group">

                <label htmlFor="requirementId">
                  Requirement ID
                </label>

                <input
                  id="requirementId"
                  type="text"
                  placeholder="Example: prospectus_req_5"
                  value={requirementId}
                  onChange={(event) =>
                    setRequirementId(
                      event.target.value
                    )
                  }
                  disabled={
                    saving ||
                    editingRequirement !== null
                  }
                />

              </div>


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

                  {transactions.map((transaction) => (

                    <option
                      key={transaction.id}
                      value={transaction.id}
                    >
                      {transaction.name}
                    </option>

                  ))}

                </select>

              </div>


              <div className="requirement-form-group full-width">

                <label htmlFor="requirementText">
                  Requirement
                </label>

                <textarea
                  id="requirementText"
                  placeholder="Enter requirement"
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


          {errorMessage && (

            <div className="requirement-error">
              {errorMessage}
            </div>

          )}


          {successMessage && (

            <div className="requirement-success">
              {successMessage}
            </div>

          )}

        </section>


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

              {requirements.map((requirement) => (

                <article
                  key={requirement.id}
                  className="requirement-item"
                >

                  <div className="requirement-item-top">

                    <div className="requirement-information">

                      <h3>
                        {requirement.requirementText}
                      </h3>

                      <p className="requirement-id">
                        ID: {requirement.id}
                      </p>

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


                  <div className="requirement-item-actions">

                    <button
                      type="button"
                      className="requirement-edit-button"
                      onClick={() =>
                        handleEdit(requirement)
                      }
                    >
                      Edit
                    </button>


                    <button
                      type="button"
                      className="requirement-status-button"
                      onClick={() =>
                        handleStatusChange(
                          requirement
                        )
                      }
                    >
                      {requirement.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </div>

    </div>

  );

}


export default RequirementsPage;