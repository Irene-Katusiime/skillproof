import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import RequireAuth from './components/RequireAuth'
import RequireRole from './components/RequireRole'
import Layout from './components/Layout'

// Public pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Discover from './pages/Discover'
import TalentProfile from './pages/TalentProfile'
import ConfirmProject from './pages/ConfirmProject'

// Onboarding
import TellYourStory from './pages/onboarding/TellYourStory'
import AISkills from './pages/onboarding/AISkills'
import ProveSkills from './pages/onboarding/ProveSkills'
import VerifiedSkills from './pages/onboarding/VerifiedSkills'

// Main app
import Dashboard from './pages/Dashboard'
import SkillPassport from './pages/SkillPassport'
import Projects from './pages/Projects'
import AddProject from './pages/AddProject'
import AddSkill from './pages/AddSkill'
import Endorse from './pages/Endorse'
import FindOpportunities from './pages/FindOpportunities'
import PitchDemo from './pages/PitchDemo'
import EmployerRegister from './pages/EmployerRegister'
import EmployerLogin from './pages/EmployerLogin'
import EmployerDashboard from './pages/EmployerDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>

          {/* Fully public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public worker discovery */}
          <Route path="/discover" element={<Discover />} />
          <Route path="/talent/:id" element={<TalentProfile />} />

          {/* Public client project confirmation */}
          <Route
            path="/confirm-project/:token"
            element={<ConfirmProject />}
          />


          {/* Employer authentication */}
          <Route
            path="/employer/register"
            element={<EmployerRegister />}
          />

          <Route
            path="/employer/login"
            element={<EmployerLogin />}
          />

          {/* Employer application */}
          <Route element={<RequireRole role="employer" />}>
            <Route
              path="/employer/dashboard"
              element={<EmployerDashboard />}
            />
          </Route>

          {/* Authentication required */}
          <Route element={<RequireAuth />}>

            {/* Onboarding */}
            <Route
              path="/onboarding/story"
              element={<TellYourStory />}
            />

            <Route
              path="/onboarding/ai-skills"
              element={<AISkills />}
            />

            <Route
              path="/onboarding/prove"
              element={<ProveSkills />}
            />

            <Route
              path="/onboarding/verified"
              element={<VerifiedSkills />}
            />

            {/* Main application */}
            <Route element={<Layout />}>

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/passport"
                element={<SkillPassport />}
              />

              <Route
                path="/projects"
                element={<Projects />}
              />

              <Route
                path="/projects/add"
                element={<AddProject />}
              />

              <Route
                path="/skills/add"
                element={<AddSkill />}
              />

              <Route
                path="/endorse"
                element={<Endorse />}
              />

              <Route
                path="/opportunities"
                element={<FindOpportunities />}
              />

              <Route
                path="/pitch"
                element={<PitchDemo />}
              />

            </Route>
          </Route>

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
