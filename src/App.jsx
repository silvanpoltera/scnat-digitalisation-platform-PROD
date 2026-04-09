import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import CpLayout from './components/CpLayout';

import Home from './pages/Home';
import Strategie from './pages/Strategie';
import Systemlandschaft from './pages/Systemlandschaft';
import Handlungsfelder from './pages/Handlungsfelder';
import KiHub from './pages/KiHub';
import Glossar from './pages/Glossar';
import Faqs from './pages/Faqs';
import Prozesse from './pages/Prozesse';
import Team from './pages/Team';
import Login from './pages/Login';
import Massnahmen from './pages/Massnahmen';
import Schulungen from './pages/Schulungen';
import SoftwareAntraege from './pages/SoftwareAntraege';
import ScnatDb from './pages/ScnatDb';

import CpDashboard from './pages/cp/CpDashboard';
import CpContent from './pages/cp/CpContent';
import CpEvents from './pages/cp/CpEvents';
import CpAntraege from './pages/cp/CpAntraege';
import CpUsers from './pages/cp/CpUsers';
import CpMassnahmen from './pages/cp/CpMassnahmen';
import CpThemen from './pages/cp/CpThemen';
import CpKi from './pages/cp/CpKi';
import CpScnatDb from './pages/cp/CpScnatDb';
import CpChanges from './pages/cp/CpChanges';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="/strategie" element={<Strategie />} />
            <Route path="/handlungsfelder" element={<Handlungsfelder />} />
            <Route path="/massnahmen" element={<Massnahmen />} />
            <Route path="/systemlandschaft" element={<Systemlandschaft />} />
            <Route path="/ki-hub" element={<KiHub />} />
            <Route path="/schulungen" element={<Schulungen />} />
            <Route path="/software-antraege" element={<SoftwareAntraege />} />
            <Route path="/scnat-db" element={<ScnatDb />} />
            <Route path="/prozesse" element={<Prozesse />} />
            <Route path="/team" element={<Team />} />
            <Route path="/faqs" element={<Faqs />} />
            <Route path="/glossar" element={<Glossar />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route element={<AdminRoute><CpLayout /></AdminRoute>}>
            <Route path="/cp" element={<CpDashboard />} />
            <Route path="/cp/content" element={<CpContent />} />
            <Route path="/cp/events" element={<CpEvents />} />
            <Route path="/cp/antraege" element={<CpAntraege />} />
            <Route path="/cp/users" element={<CpUsers />} />
            <Route path="/cp/changes" element={<CpChanges />} />
            <Route path="/cp/massnahmen" element={<CpMassnahmen />} />
            <Route path="/cp/themen" element={<CpThemen />} />
            <Route path="/cp/ki" element={<CpKi />} />
            <Route path="/cp/scnat-db" element={<CpScnatDb />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 className="text-6xl font-heading font-light text-txt-tertiary mb-4">404</h1>
      <h2 className="text-xl font-heading font-semibold text-txt-primary mb-2">Seite nicht gefunden</h2>
      <p className="text-txt-secondary mb-8">Die gesuchte Seite existiert nicht.</p>
      <a href="/" className="inline-flex items-center px-4 py-2 bg-scnat-red text-white rounded-sm text-sm font-medium hover:bg-scnat-darkred transition-colors">
        Zur Startseite
      </a>
    </div>
  );
}

export default App;
