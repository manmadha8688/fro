import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastStack } from './components/ToastStack'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { AuthLayout } from './layouts/AuthLayout'
import { MainLayout } from './layouts/MainLayout'
import { ChatPage } from './pages/ChatPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { ROUTES } from './utils/constants'

function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default function App() {
  return (
    <AppProviders>
      <ToastStack />
      <Routes>
        <Route path={ROUTES.login} element={<AuthLayout />}>
          <Route index element={<LoginPage />} />
        </Route>

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppProviders>
  )
}
