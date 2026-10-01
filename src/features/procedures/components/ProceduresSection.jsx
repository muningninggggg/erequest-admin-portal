import { useEffect, useState } from "react";


import {
  getAllProcedureSteps,
  addProcedureStep,
  updateProcedureStep,
  setProcedureStepActiveStatus,
  deleteProcedureStep
} from "../services/procedureService";


import {
  uploadProcedureImage
} from "../../../services/cloudinaryService";


function ProceduresSection({
  transactionId,
  transactionName
}) {

  const [procedures, setProcedures] =
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

  const [stepNumber, setStepNumber] =
    useState("");

  const [instruction, setInstruction] =
    useState("");

  const [imageCaption, setImageCaption] =
    useState("");

  const [remoteImageUrl, setRemoteImageUrl] =
    useState("");

  const [websiteName, setWebsiteName] =
    useState("");

  const [websiteUrl, setWebsiteUrl] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [
    removeExistingImage,
    setRemoveExistingImage
  ] = useState(false);

  const [
    editingProcedure,
    setEditingProcedure
  ] = useState(null);


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
     CLEAN IMAGE PREVIEW
     ========================================= */

  useEffect(() => {

    return () => {

      if (
        imagePreview &&
        imagePreview.startsWith("blob:")
      ) {

        URL.revokeObjectURL(
          imagePreview
        );

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

      URL.revokeObjectURL(
        imagePreview
      );

    }


    setStepNumber("");
    setInstruction("");

    setImageCaption("");
    setRemoteImageUrl("");

    setWebsiteName("");
    setWebsiteUrl("");

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

    setStepNumber(
      String(procedures.length + 1)
    );

    setInstruction("");

    setImageCaption("");
    setRemoteImageUrl("");

    setWebsiteName("");
    setWebsiteUrl("");

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

  const handleEdit = (
    procedure
  ) => {

    /*
     * procedure.id remains inside
     * editingProcedure.
     *
     * It is used internally when saving
     * the edited procedure.
     */

    setStepNumber(
      procedure.stepNumber?.toString() ||
      ""
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


    setWebsiteName(
      procedure.websiteName || ""
    );


    setWebsiteUrl(
      procedure.websiteUrl || ""
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

  const handleImageChange = (
    event
  ) => {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    setErrorMessage("");
    setSuccessMessage("");


    if (
      !file.type.startsWith("image/")
    ) {

      setErrorMessage(
        "Please select an image file only."
      );

      event.target.value = "";

      return;
    }


    const maxFileSize =
      5 * 1024 * 1024;


    if (
      file.size > maxFileSize
    ) {

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

      URL.revokeObjectURL(
        imagePreview
      );

    }


    const previewUrl =
      URL.createObjectURL(file);


    setSelectedImage(file);


    setImagePreview(
      previewUrl
    );


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

      URL.revokeObjectURL(
        imagePreview
      );

    }


    setSelectedImage(null);

    setImagePreview("");

    setRemoteImageUrl("");

    setRemoveExistingImage(true);
  };


  /* =========================================
     SAVE PROCEDURE
     ========================================= */

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");


    /* TRANSACTION */

    if (!transactionId) {

      setErrorMessage(
        "No transaction selected."
      );

      return;
    }


    /* STEP NUMBER */

    if (
      !stepNumber ||
      Number(stepNumber) < 1
    ) {

      setErrorMessage(
        "Step number must be greater than 0."
      );

      return;
    }


    /* INSTRUCTION */

    if (
      !instruction.trim()
    ) {

      setErrorMessage(
        "Procedure instruction is required."
      );

      return;
    }


    /* =====================================
       WEBSITE INFORMATION
       ===================================== */

    const cleanWebsiteName =
      websiteName.trim();

    const cleanWebsiteUrl =
      websiteUrl.trim();


    if (
      cleanWebsiteUrl &&
      !cleanWebsiteName
    ) {

      setErrorMessage(
        "Please enter a link name for the website."
      );

      return;
    }


    if (
      cleanWebsiteName &&
      !cleanWebsiteUrl
    ) {

      setErrorMessage(
        "Please enter the website URL."
      );

      return;
    }


    /* URL VALIDATION */

    if (cleanWebsiteUrl) {

      try {

        const parsedUrl =
          new URL(
            cleanWebsiteUrl
          );


        if (
          ![
            "http:",
            "https:"
          ].includes(
            parsedUrl.protocol
          )
        ) {

          throw new Error(
            "Unsupported protocol"
          );

        }


      } catch {

        setErrorMessage(
          "Website URL must be a valid http:// or https:// address."
        );

        return;
      }
    }


    try {

      setSaving(true);


      /* =====================================
         IMAGE
         ===================================== */

      let finalImageUrl =
        remoteImageUrl || "";


      if (
        removeExistingImage
      ) {

        finalImageUrl = "";

      }


      if (selectedImage) {

        finalImageUrl =
          await uploadProcedureImage(
            selectedImage
          );

      }


      /* =====================================
         UPDATE EXISTING PROCEDURE
         ===================================== */

      if (editingProcedure) {

        /*
         * ID remains necessary internally.
         *
         * It is NOT shown to the admin.
         */

        await updateProcedureStep(
          editingProcedure.id,
          transactionId,
          stepNumber,
          instruction,
          imageCaption,
          finalImageUrl,
          editingProcedure.localImagePath ||
            "",
          cleanWebsiteName,
          cleanWebsiteUrl
        );


        setSuccessMessage(
          "Procedure step updated successfully."
        );


      /* =====================================
         ADD NEW PROCEDURE
         ===================================== */

      } else {

        /*
         * procedureService.js will generate
         * the ID automatically.
         *
         * We do not show the generated ID
         * to the admin.
         */

        await addProcedureStep(
          transactionId,
          stepNumber,
          instruction,
          imageCaption,
          finalImageUrl,
          "",
          cleanWebsiteName,
          cleanWebsiteUrl
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


      /*
       * procedure.id is required internally
       * to identify the Firestore document.
       */

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


  /* =========================================
     DELETE PROCEDURE STEP
     ========================================= */

  const handleDelete = async (
    procedure
  ) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete Step ${procedure.stepNumber}?\n\n${procedure.instruction}\n\nThis action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    try {

      setDeletingId(
        procedure.id
      );

      setErrorMessage("");
      setSuccessMessage("");


      /*
       * Delete the Firestore document
       * using its internal procedure ID.
       */

      await deleteProcedureStep(
        procedure.id
      );


      /*
       * If the procedure currently being
       * edited is deleted, close the form.
       */

      if (
        editingProcedure &&
        editingProcedure.id ===
          procedure.id
      ) {

        resetForm();

      }


      setSuccessMessage(
        "Procedure step deleted successfully."
      );


      await loadProcedures();


    } catch (error) {

      console.error(
        "Failed to delete procedure step:",
        error
      );


      setErrorMessage(
        error.message ||
        "Unable to delete procedure step."
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
          disabled={
            saving ||
            deletingId !== null
          }
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


      {/* =====================================
          ADD / EDIT FORM
          ===================================== */}

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


            {/* =================================
                STEP NUMBER
                ================================= */}

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


            {/* =================================
                INSTRUCTION
                ================================= */}

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


            {/* =================================
                OPTIONAL IMAGE
                ================================= */}

            <div className="transaction-form-group full-width">

              <label htmlFor="procedureImage">
                Procedure Image (Optional)
              </label>


              <input
                id="procedureImage"
                type="file"
                accept="image/*"
                onChange={
                  handleImageChange
                }
                disabled={saving}
              />


              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  opacity: 0.7
                }}
              >
                Optional. Images only, maximum 5 MB.
              </small>

            </div>


            {/* =================================
                IMAGE PREVIEW
                ================================= */}

            {imagePreview && (

              <div className="transaction-form-group full-width">

                <label>
                  Image Preview
                </label>


                <div
                  style={{
                    marginTop: "8px",
                    maxWidth: "500px"
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
                        "1px solid rgba(255,255,255,0.15)"
                    }}
                  />


                  <button
                    type="button"
                    className="transaction-secondary-button"
                    onClick={
                      handleRemoveImage
                    }
                    disabled={saving}
                    style={{
                      marginTop: "10px"
                    }}
                  >
                    Remove Image
                  </button>

                </div>

              </div>

            )}


            {/* =================================
                IMAGE CAPTION
                ================================= */}

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


            {/* =================================
                LINK NAME
                ================================= */}

            <div className="transaction-form-group full-width">

              <label htmlFor="websiteName">
                Link Name (Optional)
              </label>


              <input
                id="websiteName"
                type="text"
                placeholder="Example: Online Application Form"
                value={websiteName}
                onChange={(event) =>
                  setWebsiteName(
                    event.target.value
                  )
                }
                disabled={saving}
              />


              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  opacity: 0.7
                }}
              >
                This is the clickable name that students will see.
              </small>

            </div>


            {/* =================================
                WEBSITE URL
                ================================= */}

            <div className="transaction-form-group full-width">

              <label htmlFor="websiteUrl">
                Website URL (Optional)
              </label>


              <input
                id="websiteUrl"
                type="url"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(event) =>
                  setWebsiteUrl(
                    event.target.value
                  )
                }
                disabled={saving}
              />


              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  opacity: 0.7
                }}
              >
                Enter the website that will open when the student taps the link name.
              </small>

            </div>

          </div>


          {/* ===================================
              FORM ACTIONS
              =================================== */}

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


      {/* =====================================
          PROCEDURE LIST
          ===================================== */}

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


                    {/*
                      Procedure ID is intentionally
                      hidden from the admin UI.

                      procedure.id remains available
                      internally.
                    */}


                    {/* WEBSITE LINK */}

                    {procedure.websiteUrl && (

                      <p
                        style={{
                          marginTop: "8px"
                        }}
                      >

                        <a
                          href={
                            procedure.websiteUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >

                          {procedure.websiteName ||
                            "Open Website"} ↗

                        </a>

                      </p>

                    )}


                    {/* ACTUAL IMAGE */}

                    {procedure.remoteImageUrl && (

                      <div
                        style={{
                          marginTop: "12px",
                          maxWidth: "350px"
                        }}
                      >

                        <img
                          src={
                            procedure.remoteImageUrl
                          }
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
                              "1px solid rgba(255,255,255,0.15)"
                          }}
                        />


                        {procedure.imageCaption && (

                          <p
                            style={{
                              marginTop: "6px",
                              fontSize: "0.9rem",
                              opacity: 0.8
                            }}
                          >
                            {procedure.imageCaption}
                          </p>

                        )}

                      </div>

                    )}

                  </div>

                </div>


                {/* =================================
                    ACTIONS
                    ================================= */}

                <div className="embedded-item-actions">


                  {/* STATUS */}

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


                  {/* EDIT */}

                  <button
                    type="button"
                    className="transaction-edit-button"
                    onClick={() =>
                      handleEdit(
                        procedure
                      )
                    }
                    disabled={
                      deletingId ===
                      procedure.id
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
                        procedure
                      )
                    }
                    disabled={
                      deletingId ===
                      procedure.id
                    }
                  >

                    {procedure.isActive
                      ? "Deactivate"
                      : "Activate"}

                  </button>


                  {/* DELETE */}

                  <button
                    type="button"
                    className="transaction-delete-button"
                    onClick={() =>
                      handleDelete(
                        procedure
                      )
                    }
                    disabled={
                      deletingId ===
                      procedure.id
                    }
                  >

                    {deletingId ===
                    procedure.id
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


export default ProceduresSection;