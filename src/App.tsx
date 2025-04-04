import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Surveys } from './pages/Surveys';
import { CreateSurvey } from './pages/CreateSurvey';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/surveys" element={<Surveys />} />
        <Route path="/create" element={<CreateSurvey />} />
        <Route path="/survey/:id" element={<div>Survey View (Not implemented)</div>} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </Layout>
  );
}

export default App;