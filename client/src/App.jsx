import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Notes from './pages/Notes';
import Trash from './pages/Trash';
import Profile from './pages/Profile';
import CompleteProfile from './pages/CompleteProfile';
import SharedNote from './pages/SharedNote';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes (bounces logged-in users) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/trash" element={<Trash />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Public Shared Note Route */}
          <Route path="/share/:token" element={<SharedNote />} />

          {/* Redirect root to notes */}
          <Route path="/" element={<Navigate to="/notes" replace />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/notes" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
