import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__panel surface-elevated">
        <Outlet />
      </div>
    </div>
  )
}
