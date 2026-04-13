import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { VisibilityProvider } from './contexts/VisibilityContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import VisibilityGuard from './components/VisibilityGuard';
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
import ScnatDb from './pages/ScnatDb';
import Schulungen from './pages/Schulungen';
import SoftwareAntraege from './pages/SoftwareAntraege';
import MeineUebersicht from './pages/MeineUebersicht';

import CpDashboard from './pages/cp/CpDashboard';
import CpContent from './pages/cp/CpContent';
import CpEvents from './pages/cp/CpEvents';
import CpAntraege from './pages/cp/CpAntraege';
import CpUsers from './pages/cp/CpUsers';
import CpMassnahmen from './pages/cp/CpMassnahmen';
import CpThemen from './pages/cp/CpThemen';
import CpScnatDb from './pages/cp/CpScnatDb';
import CpChanges from './pages/cp/CpChanges';
import CpLiveInfos from './pages/cp/CpLiveInfos';
import CpNews from './pages/cp/CpNews';
import CpAdminStuff from './pages/cp/CpAdminStuff';
import CpAdminStuffView from './pages/cp/CpAdminStuffView';
import CpInbox from './pages/cp/CpInbox';
import CpSichtbarkeit from './pages/cp/CpSichtbarkeit';
import Sprints from './pages/Sprints';
import Where from './pages/Where';
import HowBuilt from './pages/HowBuilt';
import CpSprints from './pages/cp/CpSprints';
import CpSprintEditor from './pages/cp/CpSprintEditor';

function V({ k, children }) {
  return <VisibilityGuard vKey={k}>{children}</VisibilityGuard>;
}

function App() {
  return (
    <ThemeProvider>
    <Router>
      <AuthProvider>
        <VisibilityProvider>
        <NotificationProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<V k="home"><Home /></V>} />
            <Route path="/strategie" element={<V k="strategie"><Strategie /></V>} />
            <Route path="/handlungsfelder" element={<V k="handlungsfelder"><Handlungsfelder /></V>} />
            <Route path="/massnahmen" element={<V k="massnahmen"><Massnahmen /></V>} />
            <Route path="/systemlandschaft" element={<V k="systemlandschaft"><Systemlandschaft /></V>} />
            <Route path="/ki-hub" element={<V k="ki-hub"><KiHub /></V>} />
            <Route path="/schulungen" element={<V k="schulungen"><Schulungen /></V>} />
            <Route path="/software-antraege" element={<V k="software-antraege"><SoftwareAntraege /></V>} />
            <Route path="/meine-uebersicht" element={<MeineUebersicht />} />
            <Route path="/prozesse" element={<V k="prozesse"><Prozesse /></V>} />
            <Route path="/team" element={<V k="team"><Team /></V>} />
            <Route path="/faqs" element={<V k="faqs"><Faqs /></V>} />
            <Route path="/glossar" element={<V k="glossar"><Glossar /></V>} />
            <Route path="/sprints" element={<V k="sprints"><Sprints /></V>} />
            <Route path="/where" element={<V k="cp-admin-stuff"><Where /></V>} />
            <Route path="/scnat-db" element={<V k="systemlandschaft"><ScnatDb /></V>} />
            <Route path="/how-built" element={<V k="cp-admin-stuff"><HowBuilt /></V>} />
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
            <Route path="/cp/live-infos" element={<CpLiveInfos />} />
            <Route path="/cp/news" element={<CpNews />} />
            <Route path="/cp/nachrichten" element={<CpInbox />} />
            <Route path="/cp/scnat-db" element={<CpScnatDb />} />
            <Route path="/cp/sichtbarkeit" element={<CpSichtbarkeit />} />
            <Route path="/cp/admin-stuff" element={<CpAdminStuff />} />
            <Route path="/cp/admin-stuff/:page" element={<CpAdminStuffView />} />
            <Route path="/cp/sprints" element={<CpSprints />} />
            <Route path="/cp/sprints/:id" element={<CpSprintEditor />} />
          </Route>
        </Routes>
        </NotificationProvider>
        </VisibilityProvider>
      </AuthProvider>
    </Router>
    </ThemeProvider>
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
