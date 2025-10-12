import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Registro from './pages/Auth/Registro';
import NuevaReceta from './pages/Auth/NuevaReceta';
import Receta from './pages/Auth/Receta';
import NuevoPaciente from './pages/Auth/NuevoPaciente';
import Paciente from './pages/Auth/Paciente';
import UserProfile from './pages/Perfil/UserProfile.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta por defecto / */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rutas principales */}
        <Route path="/login" element={<Login />} />
        <Route path="/NuevoPaciente" element={<NuevoPaciente />} />
        <Route path="/NuevaReceta" element={<NuevaReceta />} />
        <Route path="/Receta" element={<Receta />} />
        <Route path="/Paciente" element={<Paciente />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/perfil" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;