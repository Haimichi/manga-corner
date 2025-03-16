import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';

function MainLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default MainLayout; 