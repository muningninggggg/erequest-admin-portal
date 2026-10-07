import "./DeleteConfirmationModal.css";

function DeleteConfirmationModal({
  isOpen,
  itemType = "Item",
  itemName = "",
  onCancel,
  onConfirm,
  deleting = false,
  isBlocked = false,
  blockedDetails = [],
  recommendation = ""
}) {
  if (!isOpen) {
    return null;
  }

  /*
   * BLOCKED DELETION STATE
   * Shown when child records exist to prevent orphaned records.
   */
  if (isBlocked) {
    return (
      <div className="delete-modal-overlay">
        <div
          className="delete-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="delete-modal-icon delete-modal-icon-blocked">
            !
          </div>

          <h2 id="delete-modal-title">
            Cannot Delete {itemType}
          </h2>

          <p className="delete-modal-question">
            <strong>"{itemName}"</strong> cannot be deleted because it still contains related records.
          </p>

          <div className="delete-modal-warning delete-modal-blocked-box">
            <strong>Related records found:</strong>
            <ul className="delete-modal-blocked-list">
              {blockedDetails.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
            {recommendation && (
              <p className="delete-modal-recommendation">
                {recommendation}
              </p>
            )}
          </div>

          <div className="delete-modal-actions">
            <button
              type="button"
              className="delete-modal-cancel"
              onClick={onCancel}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="delete-modal-overlay">
      <div
        className="delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <div className="delete-modal-icon">
          !
        </div>

        <h2 id="delete-modal-title">
          Delete {itemType}?
        </h2>

        <p className="delete-modal-question">
          Are you sure you want to delete{" "}
          <strong>
            "{itemName}"
          </strong>
          ?
        </p>

        <div className="delete-modal-warning">
          This {itemType.toLowerCase()} will be permanently
          deleted. This action cannot be undone.
        </div>

        <div className="delete-modal-actions">
          <button
            type="button"
            className="delete-modal-cancel"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="delete-modal-confirm"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting
              ? "Deleting..."
              : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;