import { Link } from 'react-router-dom';

function Button(props) {

  let className = 'btn';

  if (props.variant) {
    className = className + ' btn-' + props.variant;
  } else {
    className = className + ' btn-primary';
  }

  if (props.size) {
    className = className + ' btn-' + props.size;
  }

  if (props.block) {
    className = className + ' btn-block';
  }

  if (props.to) {
    return (
      <Link to={props.to} className={className}>
        {props.children}
      </Link>
    );
  }

  return (
    <button
      type={props.type || 'button'}
      className={className}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

export default Button;