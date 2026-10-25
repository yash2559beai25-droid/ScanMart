// Toast — a small popup message in the corner of the screen.

function Toast({ message, type, onClose }) {
  const className = type === 'error' ? 'toast toast-error' : 'toast toast-success';

  return (
    <div className={className} role="status" aria-live="polite">
      <p>{message}</p>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
