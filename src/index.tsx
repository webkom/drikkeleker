import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from '@/pages/404NotFound';
import Home from '@/pages/Home';


import './index.css';
import { NavBar } from '@/components';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route index element={<Home />} />
        <Route path="home" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
