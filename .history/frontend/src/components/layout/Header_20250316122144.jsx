import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto">
        <Link to="/" className="text-xl font-bold">MANGA CORNER</Link>
        </div>
    </nav>
  );
};

export default Header;