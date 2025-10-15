import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import Login from './pages/Auth/Login';
import Registro from './pages/Auth/Registro';
import CambiarClave from './pages/Auth/CambiarClave';
import PerfilUsuario from './pages/Perfil/PerfilUsuario';
import Prescripciones from "./pages/Recetas/Prescripciones";
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas protegidas */}
          <Route path="/cambiarclave" element={<ProtectedRoute><CambiarClave/></ProtectedRoute>} />
          <Route path="/prescripciones" element={<ProtectedRoute><Prescripciones /></ProtectedRoute>}/>
          <Route path="/perfil" element={<ProtectedRoute><PerfilUsuario /></ProtectedRoute>}/>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
