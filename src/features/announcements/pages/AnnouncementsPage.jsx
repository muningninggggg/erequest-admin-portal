import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  setAnnouncementActiveStatus
} from "../services/announcementService";

import "../components/AnnouncementsPage.css";


function AnnouncementsPage() {

  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");

  // Contains the selected announcement while editing.
  // Its Firestore document ID is used internally only.
  const [editingAnnouncement, setEditingAnnouncement] =
    useState(null);


  /* =========================================================
     LOAD ANNOUNCEMENTS
     ========================================================= */

  const loadAnnouncements = async () => {

    try {

      setLoading(true);
      setErrorMessage("");

      const data = await getAllAnnouncements();

      const sortedData = [...data].sort(
        (a, b) =>
          (a.displayOrder || 0) -
          (b.displayOrder || 0)
      );

      setAnnouncements(sortedData);

    } catch (error) {

      console.error(
        "Failed to load announcements:",
        error
      );

      setErrorMessage(
        "Unable to load announcements."
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {

    loadAnnouncements();

  }, []);


  /* =========================================================
     RESET FORM
     ========================================================= */

  const resetForm = () => {

    setTitle("");
    setMessage("");
    setDisplayOrder("");

    setEditingAnnouncement(null);
    setShowForm(false);
  };


  /* =========================================================
     ADD
     ========================================================= */

  const handleAdd = () => {

    setTitle("");
    setMessage("");

    setDisplayOrder(
      String(announcements.length + 1)
    );

    setEditingAnnouncement(null);

    setErrorMessage("");
    setSuccessMessage("");

    setShowForm(true);
  };


  /* =========================================================
     EDIT
     ========================================================= */

  const handleEdit = (announcement) => {

    setTitle(
      announcement.title || ""
    );

    setMessage(
      announcement.message || ""
    );

    setDisplayOrder(
      announcement.displayOrder?.toString() || ""
    );

    // The Firestore ID remains inside this object.
    // The admin does not need to type or edit it.
    setEditingAnnouncement(announcement);

    setErrorMessage("");
    setSuccessMessage("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  /* =========================================================
     SAVE
     ========================================================= */

  const handleSubmit = async (event) => {

    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");


    /* ---------------- VALIDATION ---------------- */

    if (!title.trim()) {

      setErrorMessage(
        "Announcement title is required."
      );

      return;
    }


    if (!message.trim()) {

      setErrorMessage(
        "Announcement message is required."
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


      /* ---------------- EDIT ---------------- */

      if (editingAnnouncement) {

        await updateAnnouncement(
          editingAnnouncement.id,
          title,
          message,
          displayOrder
        );

        setSuccessMessage(
          "Announcement updated successfully."
        );

      }


      /* ---------------- ADD ---------------- */

      else {

        // No manual ID.
        // Firestore generates the document ID automatically.

        await addAnnouncement(
          title,
          message,
          displayOrder
        );

        setSuccessMessage(
          "Announcement added successfully."
        );
      }


      // Clear and close the form.
      setTitle("");
      setMessage("");
      setDisplayOrder("");
      setEditingAnnouncement(null);
      setShowForm(false);


      // Reload latest data from Firestore.
      await loadAnnouncements();


    } catch (error) {

      console.error(
        "Failed to save announcement:",
        error
      );

      setErrorMessage(
        error.message ||
        "Unable to save announcement."
      );

    } finally {

      setSaving(false);
    }
  };


  /* =========================================================
     ACTIVATE / DEACTIVATE
     ========================================================= */

  const handleStatusChange = async (
    announcement
  ) => {

    const newStatus =
      !announcement.isActive;

    try {

      setErrorMessage("");
      setSuccessMessage("");

      await setAnnouncementActiveStatus(
        announcement.id,
        newStatus
      );

      setSuccessMessage(
        newStatus
          ? "Announcement activated successfully."
          : "Announcement deactivated successfully."
      );

      await loadAnnouncements();

    } catch (error) {

      console.error(
        "Failed to update announcement status:",
        error
      );

      setErrorMessage(
        "Unable to update announcement status."
      );
    }
  };


  /* =========================================================
     PAGE
     ========================================================= */

  return (

    <div className="announcements-page">

      <div className="announcements-container">


        {/* =====================================================
            BACK BUTTON
            ===================================================== */}

        <button
          type="button"
          className="announcements-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>


        {/* =====================================================
            HEADER
            ===================================================== */}

        <header className="announcements-header">

          <div>

            <h1>
              Announcements
            </h1>

            <p>
              Manage important announcements shown
              to students in the E-ReQuest application.
            </p>

          </div>


          <button
            type="button"
            className="announcement-primary-button"
            onClick={handleAdd}
            disabled={saving}
          >
            + Add Announcement
          </button>

        </header>


        {/* =====================================================
            ERROR MESSAGE
            ===================================================== */}

        {errorMessage && (

          <div className="announcement-error">
            {errorMessage}
          </div>

        )}


        {/* =====================================================
            SUCCESS MESSAGE
            ===================================================== */}

        {successMessage && (

          <div className="announcement-success">
            {successMessage}
          </div>

        )}


        {/* =====================================================
            ADD / EDIT FORM
            ===================================================== */}

        {showForm && (

          <section className="announcement-card">

            <h2>
              {editingAnnouncement
                ? "Edit Announcement"
                : "Add Announcement"}
            </h2>


            <form onSubmit={handleSubmit}>

              <div className="announcement-form-grid">


                {/* DISPLAY ORDER */}

                <div className="announcement-form-group">

                  <label htmlFor="displayOrder">
                    Display Order
                  </label>

                  <input
                    id="displayOrder"
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(event) =>
                      setDisplayOrder(
                        event.target.value
                      )
                    }
                    disabled={saving}
                    required
                  />

                </div>


                {/* TITLE */}

                <div className="announcement-form-group full-width">

                  <label htmlFor="announcementTitle">
                    Title
                  </label>

                  <input
                    id="announcementTitle"
                    type="text"
                    placeholder="Example: Registrar Office Closed"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    disabled={saving}
                    required
                  />

                </div>


                {/* MESSAGE */}

                <div className="announcement-form-group full-width">

                  <label htmlFor="announcementMessage">
                    Message
                  </label>

                  <textarea
                    id="announcementMessage"
                    placeholder="Enter announcement message"
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    disabled={saving}
                    rows="5"
                    required
                  />

                </div>

              </div>


              {/* FORM BUTTONS */}

              <div className="announcement-form-actions">

                <button
                  type="submit"
                  className="announcement-primary-button"
                  disabled={saving}
                >

                  {saving
                    ? "Saving..."
                    : editingAnnouncement
                      ? "Save Changes"
                      : "Add Announcement"}

                </button>


                <button
                  type="button"
                  className="announcement-secondary-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>

              </div>

            </form>

          </section>

        )}


        {/* =====================================================
            ANNOUNCEMENTS LIST
            ===================================================== */}

        <section className="announcement-card">

          <div className="announcement-list-heading">

            <div>

              <h2>
                Available Announcements
              </h2>

              <p>
                Announcements currently stored
                in the system.
              </p>

            </div>

          </div>


          {/* LOADING */}

          {loading ? (

            <div className="announcement-state-message">
              Loading announcements...
            </div>

          ) : announcements.length === 0 ? (

            <div className="announcement-state-message">
              No announcements have been added yet.
            </div>

          ) : (

            <div className="announcement-list">

              {announcements.map(
                (announcement) => (

                  <div
                    key={announcement.id}
                    className="announcement-item"
                  >

                    <div className="announcement-item-content">


                      {/* DISPLAY ORDER */}

                      <div className="announcement-order">
                        {announcement.displayOrder}
                      </div>


                      {/* INFORMATION */}

                      <div className="announcement-information">

                        <h3>
                          {announcement.title}
                        </h3>

                        <p className="announcement-message">
                          {announcement.message}
                        </p>

                      </div>

                    </div>


                    {/* ACTIONS */}

                    <div className="announcement-actions">


                      {/* STATUS */}

                      <span
                        className={
                          announcement.isActive
                            ? "announcement-status active"
                            : "announcement-status inactive"
                        }
                      >
                        {announcement.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>


                      {/* EDIT */}

                      <button
                        type="button"
                        className="announcement-edit-button"
                        onClick={() =>
                          handleEdit(announcement)
                        }
                        disabled={saving}
                      >
                        Edit
                      </button>


                      {/* ACTIVATE / DEACTIVATE */}

                      <button
                        type="button"
                        className="announcement-status-button"
                        onClick={() =>
                          handleStatusChange(
                            announcement
                          )
                        }
                        disabled={saving}
                      >

                        {announcement.isActive
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

      </div>

    </div>
  );
}


export default AnnouncementsPage;