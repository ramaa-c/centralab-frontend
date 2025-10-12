import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import UserProfile from './pages/Perfil/UserProfile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rutas principales */}
        <Route path="/login" element={<Login />} />
        <Route path="/perfil" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
