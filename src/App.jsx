import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import Login from './pages/Auth/Login';
import Registro from './pages/Auth/Registro';
import RecuperarClave from './pages/Auth/RecuperarClave';
import CambiarClave from './pages/Auth/CambiarClave';
import PerfilUsuario from './pages/Perfil/PerfilUsuario';
import Prescripciones from "./pages/Recetas/Prescripciones";
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedChangePasswordRoute from './components/ProtectedChangePasswordRoute';
import PublicRoute from './components/PublicRoute';
import SideBar from "./components/SideBar.jsx";
import Resultados from './pages/Perfil/Resultados';

const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <SideBar>{children}</SideBar>
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/registro"
            element={
              <PublicRoute>
                <Registro />
              </PublicRoute>
            }
          />
          <Route
            path="/recuperarclave"
            element={
              <PublicRoute>
                <RecuperarClave />
              </PublicRoute>
            }
          />

          {/* Rutas protegidas */}
          <Route
            path="/cambiarclave"
            element={<ProtectedChangePasswordRoute><CambiarClave /></ProtectedChangePasswordRoute>}
          />
          <Route
            path="/prescripciones"
            element={<ProtectedLayout><Prescripciones /></ProtectedLayout>}
          />
          <Route
            path="/resultados"
            element={<ProtectedLayout><Resultados /></ProtectedLayout>}
          />
          <Route
            path="/perfil"
            element={<ProtectedLayout><PerfilUsuario /></ProtectedLayout>}
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
