import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];
  
  return (
    <footer className="py-8 px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-sm order-2 sm:order-1">
          © {currentYear} <a href="https://podsieve.com" className="hover:underline">PodSieve</a>. All rights reserved.
        </p>
        
        <nav className="flex items-center gap-6 order-1 sm:order-2">
          {footerLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;