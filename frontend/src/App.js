import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Charities = lazy(() => import('./pages/Charities'));
const CharityDetail = lazy(() => import('./pages/CharityDetail'));

function App() {
  return (
    <div className="App">
      <Suspense fallback={<div className="app-loading">Loading experience...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/charities" element={<Charities />} />
          <Route path="/charities/:id" element={<CharityDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
