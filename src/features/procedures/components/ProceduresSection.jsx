import { useEffect, useState } from "react";

import {
  getAllProcedureSteps,
  addProcedureStep,
  updateProcedureStep,
  setProcedureStepActiveStatus
} from "../services/procedureService";


function ProceduresSection({
  transactionId,
  transactionName
}) {

  const [procedures, setProcedures] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [procedureId, setProcedureId] = useState("");
  const [stepNumber, setStepNumber] = useState("");
  const [instruction, setInstruction] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [remoteImageUrl, setRemoteImageUrl] = useState("");

  const [editingProcedure, setEditingProcedure] =
    useState(null);


  /* =========================================
     LOAD PROCEDURES
     ========================================= */

  const loadProcedures = async () => {

    if (!transactionId) {
      setProcedures([]);
      setLoading(false);
      return;
    }


    try {

      setLoading(true);
      setErrorMessage("");


      const allProcedures =
        await getAllProcedureSteps();


      const filteredProcedures =
        allProcedures
          .filter(
            (procedure) =>
              procedure.transactionId ===
              transactionId
          )
          .sort(
            (a, b) =>
              (a.stepNumber || 0) -
              (b.stepNumber || 0)
          );


      setProcedures(
        filteredProcedures
      );


    } catch (error) {

      console.error(
        "Failed to load procedure steps:",
        error
      );

      setErrorMessage(
        "Unable to load procedure steps."
      );


    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadProcedures();

  }, [transactionId]);


  /* =========================================
     RESET FORM
     ========================================= */

  const resetForm = () => {

    setProcedureId("");
    setStepNumber("");
    setInstruction("");
    setImageCaption("");
    setRemoteImageUrl("");

    setEditingProcedure(null);
    setShowForm(false);

  };


  /* =========================================
     ADD PROCEDURE
     ========================================= */

  const handleAddProcedure = () => {

    setProcedureId("");

    setStepNumber(
      String(procedures.length + 1)
    );

    setInstruction("");
    setImageCaption("");
    setRemoteImageUrl("");

    setEditingProcedure(null);

    setErrorMessage("");
    setSuccessMessage("");

    setShowForm(true);

  };


  /* =========================================
     EDIT PROCEDURE
     ========================================= */

  const handleEdit = (procedure) => {

    setProcedureId(
      procedure.id
    );

    setStepNumber(
      procedure.stepNumber?.toString() || ""
    );

    setInstruction(
      procedure.instruction || ""
    );

    setImageCaption(
      procedure.imageCaption || ""
    );

    setRemoteImageUrl(
      procedure.remoteImageUrl || ""
    );

    setEditingProcedure(
      procedure
    );

    setErrorMessage("");
    setSuccessMessage("");

    setShowForm(true);

  };


  /* =========================================
     SAVE PROCEDURE
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


    if (
      !stepNumber ||
      Number(stepNumber) < 1
    ) {

      setErrorMessage(
        "Step number must be greater than 0."
      );

      return;

    }


    if (!instruction.trim()) {

      setErrorMessage(
        "Procedure instruction is required."
      );

      return;

    }


    try {

      setSaving(true);


      if (editingProcedure) {

        await updateProcedureStep(
          editingProcedure.id,
          transactionId,
          stepNumber,
          instruction,
          imageCaption,
          remoteImageUrl,
          editingProcedure.localImagePath || ""
        );


        setSuccessMessage(
          "Procedure step updated successfully."
        );


      } else {

        if (!procedureId.trim()) {

          setErrorMessage(
            "Procedure ID is required."
          );

          return;

        }


        await addProcedureStep(
          procedureId,
          transactionId,
          stepNumber,
          instruction,
          imageCaption,
          remoteImageUrl,
          ""
        );


        setSuccessMessage(
          "Procedure step added successfully."
        );

      }


      resetForm();

      await loadProcedures();


    } catch (error) {

      console.error(
        "Failed to save procedure step:",
        error
      );

      setErrorMessage(
        error.message ||
        "Unable to save procedure step."
      );


    } finally {

      setSaving(false);

    }

  };


  /* =========================================
     ACTIVATE / DEACTIVATE
     ========================================= */

  const handleStatusChange = async (
    procedure
  ) => {

    const newStatus =
      !procedure.isActive;


    try {

      setErrorMessage("");
      setSuccessMessage("");


      await setProcedureStepActiveStatus(
        procedure.id,
        newStatus
      );


      setSuccessMessage(
        newStatus
          ? "Procedure step activated successfully."
          : "Procedure step deactivated successfully."
      );


      await loadProcedures();


    } catch (error) {

      console.error(
        "Failed to update procedure status:",
        error
      );

      setErrorMessage(
        "Unable to update procedure status."
      );

    }

  };


  if (!transactionId) {
    return null;
  }


  return (

    <section className="transaction-detail-section">


      {/* HEADER */}

      <div className="transaction-detail-section-header">

        <div>

          <h2>
            Step-by-Step Procedure
          </h2>

          <p>
            Manage the procedure for{" "}
            <strong>
              {transactionName}
            </strong>.
          </p>

        </div>


        <button
          type="button"
          className="transaction-primary-button"
          onClick={handleAddProcedure}
        >
          + Add Step
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
            {editingProcedure
              ? "Edit Procedure Step"
              : "Add Procedure Step"}
          </h3>


          <div className="transaction-form-grid">


            {/* PROCEDURE ID */}

            <div className="transaction-form-group">

              <label htmlFor="procedureId">
                Procedure ID
              </label>

              <input
                id="procedureId"
                type="text"
                placeholder="Example: prospectus_step_5"
                value={procedureId}
                onChange={(event) =>
                  setProcedureId(
                    event.target.value
                  )
                }
                disabled={
                  saving ||
                  editingProcedure !== null
                }
              />

            </div>



            {/* STEP NUMBER */}

            <div className="transaction-form-group">

              <label htmlFor="stepNumber">
                Step Number
              </label>

              <input
                id="stepNumber"
                type="number"
                min="1"
                value={stepNumber}
                onChange={(event) =>
                  setStepNumber(
                    event.target.value
                  )
                }
                disabled={saving}
              />

            </div>



            {/* INSTRUCTION */}

            <div className="transaction-form-group full-width">

              <label htmlFor="instruction">
                Instruction
              </label>

              <textarea
                id="instruction"
                placeholder="Enter the instruction for this step"
                value={instruction}
                onChange={(event) =>
                  setInstruction(
                    event.target.value
                  )
                }
                disabled={saving}
                rows="4"
              />

            </div>



            {/* IMAGE URL */}

            <div className="transaction-form-group full-width">

              <label htmlFor="remoteImageUrl">
                Image URL
              </label>

              <input
                id="remoteImageUrl"
                type="text"
                placeholder="Optional image URL"
                value={remoteImageUrl}
                onChange={(event) =>
                  setRemoteImageUrl(
                    event.target.value
                  )
                }
                disabled={saving}
              />

            </div>



            {/* IMAGE CAPTION */}

            <div className="transaction-form-group full-width">

              <label htmlFor="imageCaption">
                Image Caption
              </label>

              <input
                id="imageCaption"
                type="text"
                placeholder="Optional image caption"
                value={imageCaption}
                onChange={(event) =>
                  setImageCaption(
                    event.target.value
                  )
                }
                disabled={saving}
              />

            </div>

          </div>


          <div className="transaction-form-actions">

            <button
              type="submit"
              className="transaction-primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingProcedure
                  ? "Save Changes"
                  : "Add Step"}
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



      {/* PROCEDURE LIST */}

      {loading ? (

        <p className="transactions-state-message">
          Loading procedure steps...
        </p>

      ) : procedures.length === 0 ? (

        <div className="embedded-empty-state">

          <p>
            No procedure steps have been added
            to this transaction yet.
          </p>

        </div>

      ) : (

        <div className="embedded-item-list">


          {procedures.map(
            (procedure) => (

              <div
                key={procedure.id}
                className="embedded-item"
              >


                <div className="embedded-item-content">


                  {/* STEP NUMBER */}

                  <div className="embedded-item-order">
                    {procedure.stepNumber}
                  </div>



                  {/* INFORMATION */}

                  <div>

                    <h4>
                      Step {procedure.stepNumber}
                    </h4>


                    <p className="procedure-instruction">
                      {procedure.instruction}
                    </p>


                    <p>
                      ID: {procedure.id}
                    </p>


                    {procedure.imageCaption && (

                      <p>
                        Image Caption:{" "}
                        {procedure.imageCaption}
                      </p>

                    )}


                    {procedure.remoteImageUrl && (

                      <p>
                        Image attached
                      </p>

                    )}

                  </div>

                </div>



                {/* ACTIONS */}

                <div className="embedded-item-actions">


                  <span
                    className={
                      procedure.isActive
                        ? "transaction-status active"
                        : "transaction-status inactive"
                    }
                  >
                    {procedure.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>


                  <button
                    type="button"
                    className="transaction-edit-button"
                    onClick={() =>
                      handleEdit(procedure)
                    }
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    className="transaction-status-button"
                    onClick={() =>
                      handleStatusChange(
                        procedure
                      )
                    }
                  >
                    {procedure.isActive
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


export default ProceduresSection;