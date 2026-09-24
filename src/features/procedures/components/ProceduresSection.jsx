import { useEffect, useState } from "react";

import {
  getAllProcedureSteps,
  addProcedureStep,
  updateProcedureStep,
  setProcedureStepActiveStatus,
} from "../services/procedureService";

import { uploadProcedureImage } from "../../../services/cloudinaryService";


function ProceduresSection({
  transactionId,
  transactionName,
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

  // New image selected from computer/phone
  const [selectedImage, setSelectedImage] = useState(null);

  // Local preview of selected image
  const [imagePreview, setImagePreview] = useState("");

  // Used when editing and admin wants to remove old image
  const [removeExistingImage, setRemoveExistingImage] =
    useState(false);

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
              procedure.transactionId === transactionId
          )
          .sort(
            (a, b) =>
              (a.stepNumber || 0) -
              (b.stepNumber || 0)
          );

      setProcedures(filteredProcedures);

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
     CLEAN IMAGE PREVIEW
     ========================================= */

  useEffect(() => {

    return () => {
      if (
        imagePreview &&
        imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imagePreview);
      }
    };

  }, [imagePreview]);


  /* =========================================
     RESET FORM
     ========================================= */

  const resetForm = () => {

    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    setProcedureId("");
    setStepNumber("");
    setInstruction("");

    setImageCaption("");
    setRemoteImageUrl("");

    setSelectedImage(null);
    setImagePreview("");
    setRemoveExistingImage(false);

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

    setSelectedImage(null);
    setImagePreview("");
    setRemoveExistingImage(false);

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

    setSelectedImage(null);

    setImagePreview(
      procedure.remoteImageUrl || ""
    );

    setRemoveExistingImage(false);

    setEditingProcedure(
      procedure
    );

    setErrorMessage("");
    setSuccessMessage("");

    setShowForm(true);

  };


  /* =========================================
     SELECT IMAGE
     ========================================= */

  const handleImageChange = (event) => {

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    if (!file.type.startsWith("image/")) {

      setErrorMessage(
        "Please select an image file only."
      );

      event.target.value = "";
      return;
    }

    const maxFileSize =
      5 * 1024 * 1024;

    if (file.size > maxFileSize) {

      setErrorMessage(
        "Image must not exceed 5 MB."
      );

      event.target.value = "";
      return;
    }

    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);

    // A newly selected image replaces the old image.
    setRemoveExistingImage(false);

  };


  /* =========================================
     REMOVE IMAGE
     ========================================= */

  const handleRemoveImage = () => {

    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview("");

    // Clear image URL when saved.
    setRemoteImageUrl("");
    setRemoveExistingImage(true);

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


    if (
      !editingProcedure &&
      !procedureId.trim()
    ) {

      setErrorMessage(
        "Procedure ID is required."
      );

      return;

    }


    try {

      setSaving(true);

      /*
       * Keep the current image when editing,
       * unless the admin removes it or uploads
       * a replacement.
       */
      let finalImageUrl =
        remoteImageUrl || "";

      if (removeExistingImage) {
        finalImageUrl = "";
      }

      /*
       * Upload only when the admin actually
       * selected a new image.
       */
      if (selectedImage) {

        finalImageUrl =
          await uploadProcedureImage(
            selectedImage
          );

      }


      if (editingProcedure) {

        await updateProcedureStep(
          editingProcedure.id,
          transactionId,
          stepNumber,
          instruction,
          imageCaption,
          finalImageUrl,
          editingProcedure.localImagePath || ""
        );

        setSuccessMessage(
          "Procedure step updated successfully."
        );


      } else {

        await addProcedureStep(
          procedureId,
          transactionId,
          stepNumber,
          instruction,
          imageCaption,
          finalImageUrl,
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



            {/* OPTIONAL IMAGE */}

            <div className="transaction-form-group full-width">

              <label htmlFor="procedureImage">
                Procedure Image (Optional)
              </label>

              <input
                id="procedureImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={saving}
              />

              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  opacity: 0.7,
                }}
              >
                Optional. Images only, maximum 5 MB.
              </small>

            </div>



            {/* IMAGE PREVIEW */}

            {imagePreview && (

              <div className="transaction-form-group full-width">

                <label>
                  Image Preview
                </label>

                <div
                  style={{
                    marginTop: "8px",
                    maxWidth: "500px",
                  }}
                >

                  <img
                    src={imagePreview}
                    alt={
                      imageCaption ||
                      "Procedure preview"
                    }
                    style={{
                      display: "block",
                      width: "100%",
                      maxHeight: "320px",
                      objectFit: "contain",
                      borderRadius: "10px",
                      border:
                        "1px solid rgba(255,255,255,0.15)",
                    }}
                  />

                  <button
                    type="button"
                    className="transaction-secondary-button"
                    onClick={handleRemoveImage}
                    disabled={saving}
                    style={{
                      marginTop: "10px",
                    }}
                  >
                    Remove Image
                  </button>

                </div>

              </div>

            )}



            {/* IMAGE CAPTION */}

            <div className="transaction-form-group full-width">

              <label htmlFor="imageCaption">
                Image Caption (Optional)
              </label>

              <input
                id="imageCaption"
                type="text"
                placeholder="Example: Registrar Window 6"
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
                ? selectedImage
                  ? "Uploading & Saving..."
                  : "Saving..."
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


                    {/* ACTUAL IMAGE */}

                    {procedure.remoteImageUrl && (

                      <div
                        style={{
                          marginTop: "12px",
                          maxWidth: "350px",
                        }}
                      >

                        <img
                          src={procedure.remoteImageUrl}
                          alt={
                            procedure.imageCaption ||
                            `Step ${procedure.stepNumber}`
                          }
                          loading="lazy"
                          style={{
                            display: "block",
                            width: "100%",
                            maxHeight: "240px",
                            objectFit: "contain",
                            borderRadius: "10px",
                            border:
                              "1px solid rgba(255,255,255,0.15)",
                          }}
                        />

                        {procedure.imageCaption && (

                          <p
                            style={{
                              marginTop: "6px",
                              fontSize: "0.9rem",
                              opacity: 0.8,
                            }}
                          >
                            {procedure.imageCaption}
                          </p>

                        )}

                      </div>

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