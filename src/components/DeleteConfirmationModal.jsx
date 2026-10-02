import "./DeleteConfirmationModal.css";

function DeleteConfirmationModal({
  isOpen,
  itemType = "Item",
  itemName = "",
  onCancel,
  onConfirm,
  deleting = false
}) {
  if (!isOpen) {
    return null;
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