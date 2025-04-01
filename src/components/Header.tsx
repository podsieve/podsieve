import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center py-6 px-8">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl font-bold text-black">
          PodSieve
        </span>
      </Link>
      
      <nav className="flex items-center gap-4">
        <Link 
          to="/newsletter" 
          className="hover:bg-gray-100 text-gray-900 px-5 py-2 rounded-2xl font-medium transition-colors"
        >
          Newsletter
        </Link>
      </nav>
    </header>
  );
};

export default Header;