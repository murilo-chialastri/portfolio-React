import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import RouteScroll from './components/RouteScroll'
import ProtectedRoute from './components/ProtectedRoute'
import { Loading } from './components/ui/AsyncState'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ProjectPage = lazy(() => import('./pages/ProjectPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <RouteScroll />
      <Suspense
        fallback={
          <div className="page-shell">
            <Loading label="Carregando página…" />
          </div>
        }
      >
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="projetos" element={<ProjectsPage />} />
          <Route path="projetos/:owner/:name" element={<ProjectPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <SiteFooter />
    </>
  )
}
