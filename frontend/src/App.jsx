import react from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import NotFound from "./pages/NotFound"
import UserDetail from './pages/UserDetail'
import ProtectedRoute from "./components/ProtectedRoute"
import Visits from "./pages/Visits";
import Logout from "./components/Logout"
import JoinAsPetsitter from "./pages/JoinAsPetsitter";
import MyAccount from "./components/MyAccount";
import AdminPage from "./pages/AdminPage"

// function Logout() {
//   localStorage.clear()
//   return <Navigate to="/login" />
// }

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/visits" element={<Visits />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/join-petsitter" element={<JoinAsPetsitter />} />
        <Route path="/account" element={<MyAccount />} />
        <Route path="/admin-users" element={<AdminPage />} />
        <Route path="*" element={<NotFound />}></Route>
        <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
        />
        <Route
                    path="/users/:id"
                    element={
                        <ProtectedRoute>
                            <UserDetail />
                        </ProtectedRoute>
                    }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App