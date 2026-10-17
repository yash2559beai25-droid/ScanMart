// FormInput.jsx — Reusable Input Component
//
// CONCEPT: Reusable Component with Props
// Instead of writing <label>, <input>, and error messages repeatedly,
// we build one simple component that takes props and displays them nicely.

function FormInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  rightElement
}) {
  // If there is an error, highlight input with the 'input-error' red border class
  let inputClassName = 'text-input';
  if (error) {
    inputClassName = 'text-input input-error';
  }

  return (
    <div className="form-input-group">
      {/* Label for the input */}
      <label htmlFor={id}>
        {label}
        {required && <span className="required-mark"> *</span>}
      </label>

      {/* Input container (can hold an eye icon button on the right) */}
      <div className="input-wrapper">
        <input
          id={id}
          className={inputClassName}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        {rightElement && (
          <div className="input-right">
            {rightElement}
          </div>
        )}
      </div>

      {/* Show error message in red if there is any */}
      {error && (
        <p className="error-text">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormInput;
