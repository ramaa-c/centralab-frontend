import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import Login from './pages/Auth/Login';
import Registro from './pages/Auth/Registro';
import CambiarClave from './pages/Auth/CambiarClave';
import PerfilUsuario from './pages/Perfil/PerfilUsuario';
import Prescripciones from "./pages/Recetas/Prescripciones";
import ProtectedRoute from './components/ProtectedRoute';
import SideBar from "./components/SideBar.jsx";
import Resultados from './pages/Perfil/resultados';

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
          <Route 
            path="/prescripciones" 
            element={
            <SideBar>
              <ProtectedRoute>
                <Prescripciones />
                 </ProtectedRoute>
            </SideBar>
              } 
            />
            <Route 
            path="/Resultados" 
            element={
            <SideBar>
              <ProtectedRoute>
                <Resultados />
                 </ProtectedRoute>
            </SideBar>
              } 
            />
           
          <Route path="/perfil" element={<SideBar><ProtectedRoute><PerfilUsuario /></ProtectedRoute></SideBar>}/>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
