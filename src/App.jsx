import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Villages from './pages/Villages';
import VillageDetail from './pages/VillageDetail';
import NgoDashboard from './pages/NgoDashboard';
import DonorBrowse from './pages/DonorBrowse';
import PledgeFlow from './pages/PledgeFlow';
import Login from './pages/Login';

function NotFound() {
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-950 flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-6xl font-display font-bold text-warm-200 dark:text-warm-800 mb-4">404</p>
        <h1 className="font-display font-semibold text-warm-800 dark:text-warm-200 text-2xl mb-3">Page not found</h1>
        <p className="text-warm-500 dark:text-warm-400 mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-saffron-500 text-white rounded-xl text-sm font-semibold hover:bg-saffron-600 transition-colors">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-warm-50 dark:bg-warm-950 transition-colors duration-200">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/villages" element={<Villages />} />
                  <Route path="/village/:id" element={<VillageDetail />} />
                  <Route path="/ngo" element={<NgoDashboard />} />
                  <Route path="/donate" element={<DonorBrowse />} />
                  <Route path="/pledge/:villageId" element={<PledgeFlow />} />
                  <Route path="/pledge/:villageId/:recommendationId" element={<PledgeFlow />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
