// Logo component.
// Displays the ScanMart barcode icon (made with SVG) and the brand name.
// This component is reused in the Navbar and Footer.

function Logo() {
  return (
    <span className="logo">
      {/* SVG drawing of a barcode */}
      <svg className="logo-mark" viewBox="0 0 36 36" aria-hidden="true">
        {/* Background rounded rectangle */}
        <rect width="36" height="36" rx="10" fill="#0F766E" />
        {/* White vertical bars representing the barcode */}
        <rect x="8" y="9" width="2.2" height="18" rx="1" fill="#ECFDF5" />
        <rect x="12.2" y="9" width="1.6" height="18" rx="0.8" fill="#ECFDF5" />
        <rect x="16" y="9" width="3.2" height="18" rx="1" fill="#ECFDF5" />
        <rect x="21.2" y="9" width="1.6" height="18" rx="0.8" fill="#ECFDF5" />
        <rect x="25" y="9" width="3" height="18" rx="1" fill="#ECFDF5" />
      </svg>
      ScanMart
    </span>
  );
}

export default Logo;
