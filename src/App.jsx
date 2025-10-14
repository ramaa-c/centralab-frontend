import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Registro from './pages/Auth/Registro';
import CambiarClave from './pages/Auth/CambiarClave';
import PerfilUsuario from './pages/Perfil/PerfilUsuario.jsx';
import Prescripciones from "./pages/Recetas/Prescripciones.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/cambiarclave" element={<CambiarClave />} />
        <Route path="/prescripciones" element={<Prescripciones />} />
        <Route path="/perfil" element={<PerfilUsuario />} />
      </Routes>
    </Router>
  );
}

export default App;
