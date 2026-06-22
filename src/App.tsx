import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/components/auth/AuthContext'
import { RequireAuth } from '@/components/auth/RequireAuth'
import AppLayout from '@/components/shared/AppLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import TropelsPage from '@/pages/TropelsPage'
import TropelDetailPage from '@/pages/TropelDetailPage'
import SignalsPage from '@/pages/SignalsPage'
import SignalDetailPage from '@/pages/SignalDetailPage'
import SectorsPage from '@/pages/SectorsPage'
import SectorStoryPage from '@/pages/SectorStoryPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tropels" element={<TropelsPage />} />
            <Route path="/tropels/:id" element={<TropelDetailPage />} />
            <Route path="/signals" element={<SignalsPage />} />
            <Route path="/signals/:id" element={<SignalDetailPage />} />
            <Route path="/sectors" element={<SectorsPage />} />
            <Route path="/sectors/:id/story" element={<SectorStoryPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
