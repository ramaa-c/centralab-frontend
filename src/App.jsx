import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Registro from './pages/Auth/Registro';
import NuevaReceta from './pages/Recetas/NuevaReceta.jsx';
import Receta from './pages/Recetas/Receta.jsx';
import NuevoPaciente from './pages/Pacientes/NuevoPaciente.jsx';
import Paciente from './pages/Pacientes/Paciente.jsx';
import UserProfile from './pages/Perfil/PerfilUsuario.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

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
