import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllServices,
  addService,
  updateService,
  setServiceActiveStatus
} from "../services/serviceService";

import "../components/ServicesPage.css";

function ServicesPage() {

  const navigate = useNavigate();

  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [serviceId, setServiceId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingService, setEditingService] = useState(null);


  /* =========================================================
     LOAD SERVICES
     ========================================================= */

  const loadServices = async () => {

    try {

      setLoading(true);
      setErrorMessage("");

      const data = await getAllServices();

      setServices(data);

    } catch (error) {

      console.error("Failed to load services:", error);

      setErrorMessage(
        "Unable to load services. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadServices();

  }, []);


  /* =========================================================
     NAVIGATION
     ========================================================= */

  const handleBackToDashboard = () => {

    navigate("/dashboard");

  };


  /* =========================================================
     RESET FORM
     ========================================================= */

  const resetForm = () => {

    setServiceId("");
    setName("");
    setDescription("");
    setEditingService(null);

  };


  /* =========================================================
     ADD / UPDATE SERVICE
     ========================================================= */

  const handleSubmit = async (event) => {

    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");


    if (!name.trim()) {

      setErrorMessage("Service name is required.");

      return;

    }


    try {

      setSaving(true);


      if (editingService) {

        await updateService(
          editingService.id,
          name,
          description
        );


        setSuccessMessage(
          "Service updated successfully."
        );


      } else {

        if (!serviceId.trim()) {

          setErrorMessage(
            "Service ID is required."
          );

          return;

        }


        await addService(
          serviceId,
          name,
          description
        );


        setSuccessMessage(
          "Service added successfully."
        );

      }


      resetForm();

      await loadServices();


    } catch (error) {

      console.error(
        "Failed to save service:",
        error
      );


      setErrorMessage(
        error.message ||
          "Unable to save service."
      );


    } finally {

      setSaving(false);

    }

  };


  /* =========================================================
     EDIT SERVICE
     ========================================================= */

  const handleEdit = (service) => {

    setEditingService(service);

    setServiceId(service.id);
    setName(service.name || "");
    setDescription(service.description || "");

    setErrorMessage("");
    setSuccessMessage("");


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  };


  /* =========================================================
     CANCEL EDIT
     ========================================================= */

  const handleCancelEdit = () => {

    resetForm();

    setErrorMessage("");
    setSuccessMessage("");

  };


  /* =========================================================
     ACTIVATE / DEACTIVATE
     ========================================================= */

  const handleStatusChange = async (service) => {

    const newStatus = !service.isActive;


    try {

      setErrorMessage("");
      setSuccessMessage("");


      await setServiceActiveStatus(
        service.id,
        newStatus
      );


      setSuccessMessage(
        newStatus
          ? "Service activated successfully."
          : "Service deactivated successfully."
      );


      await loadServices();


    } catch (error) {

      console.error(
        "Failed to update service status:",
        error
      );


      setErrorMessage(
        "Unable to update service status."
      );

    }

  };


  /* =========================================================
     UI
     ========================================================= */

  return (

    <div className="services-page">

      <div className="services-container">


        {/* ===================================================
            BACK TO DASHBOARD
            =================================================== */}

        <button
          type="button"
          onClick={handleBackToDashboard}
          style={{
            background: "transparent",
            border: "none",
            padding: "0",
            marginBottom: "18px",
            color: "#174a78",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
        >

          <span aria-hidden="true">
            ←
          </span>

          Back to Dashboard

        </button>


        {/* ===================================================
            HEADER
            =================================================== */}

        <header className="services-header">

          <h1>
            Services
          </h1>

          <p>
            Add and update the services available in E-ReQuest.
          </p>

        </header>


        {/* ===================================================
            ADD / EDIT SERVICE
            =================================================== */}

        <section className="services-card">

          <h2>

            {editingService
              ? "Edit Service"
              : "Add Service"}

          </h2>


          <form
            className="service-form"
            onSubmit={handleSubmit}
          >

            <div className="service-form-grid">


              {/* SERVICE ID */}

              <div className="service-form-group">

                <label htmlFor="serviceId">
                  Service ID
                </label>

                <input
                  id="serviceId"
                  type="text"
                  placeholder="Example: registrar"
                  value={serviceId}
                  onChange={(event) =>
                    setServiceId(
                      event.target.value
                    )
                  }
                  disabled={
                    saving ||
                    editingService !== null
                  }
                />

              </div>


              {/* SERVICE NAME */}

              <div className="service-form-group">

                <label htmlFor="serviceName">
                  Service Name
                </label>

                <input
                  id="serviceName"
                  type="text"
                  placeholder="Example: Registrar"
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

              <div className="service-form-group full-width">

                <label htmlFor="serviceDescription">
                  Description
                </label>

                <textarea
                  id="serviceDescription"
                  placeholder="Enter service description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  rows="4"
                />

              </div>

            </div>


            {/* FORM BUTTONS */}

            <div className="service-form-actions">

              <button
                type="submit"
                className="service-primary-button"
                disabled={saving}
              >

                {saving
                  ? "Saving..."
                  : editingService
                    ? "Save Changes"
                    : "Add Service"}

              </button>


              {editingService && (

                <button
                  type="button"
                  className="service-secondary-button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >

                  Cancel

                </button>

              )}

            </div>

          </form>


          {/* ERROR */}

          {errorMessage && (

            <div className="service-error">

              {errorMessage}

            </div>

          )}


          {/* SUCCESS */}

          {successMessage && (

            <div className="service-success">

              {successMessage}

            </div>

          )}

        </section>


        {/* ===================================================
            EXISTING SERVICES
            =================================================== */}

        <section className="services-card">

          <h2>
            Existing Services
          </h2>


          {loading ? (

            <p className="services-state-message">
              Loading services...
            </p>

          ) : services.length === 0 ? (

            <p className="services-state-message">
              No services found.
            </p>

          ) : (

            <div className="services-list">


              {services.map((service) => (

                <article
                  key={service.id}
                  className="service-item"
                >


                  {/* SERVICE INFORMATION */}

                  <div className="service-item-top">

                    <div>

                      <h3>
                        {service.name}
                      </h3>


                      <p className="service-id">
                        ID: {service.id}
                      </p>


                      <p className="service-description">

                        {service.description ||
                          "No description"}

                      </p>

                    </div>


                    {/* STATUS */}

                    <span
                      className={
                        service.isActive
                          ? "service-status active"
                          : "service-status inactive"
                      }
                    >

                      {service.isActive
                        ? "Active"
                        : "Inactive"}

                    </span>

                  </div>


                  {/* ACTION BUTTONS */}

                  <div className="service-item-actions">


                    <button
                      type="button"
                      className="service-edit-button"
                      onClick={() =>
                        handleEdit(service)
                      }
                    >

                      Edit

                    </button>


                    <button
                      type="button"
                      className="service-status-button"
                      onClick={() =>
                        handleStatusChange(service)
                      }
                    >

                      {service.isActive
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


export default ServicesPage;