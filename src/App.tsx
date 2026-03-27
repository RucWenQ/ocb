import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import NavHeader from './components/NavHeader'
import AIEditorPage from './pages/AIEditorPage'
import BriefingPage from './pages/BriefingPage'
import ChatPage from './pages/ChatPage'
import ConsentPage from './pages/ConsentPage'
import DebriefPage from './pages/DebriefPage'
import MoralDisengagementPage from './pages/MoralDisengagementPage'
import MoralIdentityPage from './pages/MoralIdentityPage'
import OCBScenarioPage from './pages/OCBScenarioPage'
import PEBScalePage from './pages/PEBScalePage'
import ReceiptPage from './pages/ReceiptPage'
import ShoppingTaskPage from './pages/ShoppingTaskPage'
import { useExperimentStore } from './store/experimentStore'
import { pageForPath, pathForPage } from './utils/flow'

function RootRedirect() {
  const currentPage = useExperimentStore((state) => state.currentPage)
  return <Navigate to={pathForPage(currentPage)} replace />
}

function FlowGuard() {
  const location = useLocation()
  const currentPage = useExperimentStore((state) => state.currentPage)
  const requestedPage = pageForPath(location.pathname)
  const expectedPath = pathForPage(currentPage)

  if (requestedPage === null) {
    return <Navigate to={expectedPath} replace />
  }
  if (requestedPage !== currentPage) {
    return <Navigate to={expectedPath} replace />
  }

  return <Outlet />
}

function ExperimentLayout() {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-20 sm:px-6">
        <div className="page-shell">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route element={<FlowGuard />}>
          <Route element={<ExperimentLayout />}>
            <Route path="/consent" element={<ConsentPage />} />
            <Route path="/briefing" element={<BriefingPage />} />
            <Route path="/ai-editor" element={<AIEditorPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/receipt" element={<ReceiptPage />} />
            <Route path="/measure/ocb-scenarios" element={<OCBScenarioPage />} />
            <Route path="/measure/shopping-task" element={<ShoppingTaskPage />} />
            <Route path="/measure/peb-scale" element={<PEBScalePage />} />
            <Route path="/measure/moral-disengagement" element={<MoralDisengagementPage />} />
            <Route path="/measure/moral-identity" element={<MoralIdentityPage />} />
            <Route path="/debrief" element={<DebriefPage />} />
          </Route>
        </Route>
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
