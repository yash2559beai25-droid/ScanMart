// Reusable modal dialog.
// Close with the X button, the Escape key, or a click on the backdrop.

import { useEffect } from 'react';

function Modal({ title, isOpen, onClose, children }) {
  useEffect(
    function () {
      if (!isOpen) {
        return undefined;
      }

      function handleKeyDown(event) {
        if (event.key === 'Escape') {
          onClose();
        }
      }

      document.addEventListener('keydown', handleKeyDown);
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return function () {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = previousOverflow;
      };
    },
    [isOpen, onClose]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scanmart-modal-title"
        onClick={function (event) {
          event.stopPropagation();
        }}
      >
        <header className="modal-header">
          <h2 id="scanmart-modal-title">{title}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
