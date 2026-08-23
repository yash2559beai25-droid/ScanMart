// Footer component.
// Displayed at the bottom of every page.
// We use React Router's <Link> component to navigate smoothly without reloading the page.

import { Link } from 'react-router-dom';
import Logo from './Logo';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        
        {/* About Project Section */}
        <section>
          <Logo />
          <p style={{ marginTop: '0.8rem' }}>
            ScanMart is a smart self-checkout platform that lets shoppers scan items and pay digitally.
            Created as a frontend college project.
          </p>
        </section>

        {/* Quick Shopping Links */}
        <section>
          <h3>Shop</h3>
          <p><Link to="/products">Browse products</Link></p>
          <p><Link to="/scan">Scan a product</Link></p>
          <p><Link to="/cart">View cart</Link></p>
        </section>

        {/* Additional Links */}
        <section>
          <h3>More</h3>
          <p><Link to="/profile">My profile</Link></p>
          <p><Link to="/admin">Admin dashboard</Link></p>
        </section>
        
      </div>

      <div className="container footer-bottom">
        <p>&copy; 2025 ScanMart. Built as a React college project.</p>
      </div>
    </footer>
  );
}

export default Footer;
