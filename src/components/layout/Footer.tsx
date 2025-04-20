
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-4 md:mb-0">
            © {currentYear} MedConnect - Electronic Healthcare Management
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="hover:text-medconnect-primary">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-medconnect-primary">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:text-medconnect-primary">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
