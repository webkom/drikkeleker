import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NavBar } from '@/components';
import NotFound from '@/pages/404NotFound';
import Home from '@/pages/Home';
import Lambo from '@/pages/Lambo';

import './index.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <NavBar />
        <Routes>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="*" element={<NotFound />} />
          <Route path="lambo" element={<Lambo />} />
        </Routes>
    </BrowserRouter>
  );
};

export default App;
