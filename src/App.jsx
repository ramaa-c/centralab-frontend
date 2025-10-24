import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import Login from './pages/Auth/Login';
import Registro from './pages/Auth/Registro';
import CambiarClave from './pages/Auth/CambiarClave';
import PerfilUsuario from './pages/Perfil/PerfilUsuario';
import Prescripciones from "./pages/Recetas/Prescripciones";
import ProtectedRoute from './components/ProtectedRoute';
import SideBar from "./components/SideBar.jsx";
import Resultados from './pages/Perfil/Resultados';



const ProtectedLayout = ({ children }) => (
    <ProtectedRoute>
        <SideBar>
            {children}
        </SideBar>
    </ProtectedRoute>
);



function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />
                    
                    
                    {/* Rutas protegidas (Usan el layout combinado) */}

                    <Route 
                        path="/cambiarclave" 
                        element={<ProtectedRoute><CambiarClave/></ProtectedRoute>} 
                    />|
                    
                    <Route 
                        path="/cambiarclave" 
                        element={<ProtectedLayout><CambiarClave /></ProtectedLayout>} 
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
                    
                    {/* ... (otras rutas) ... */}

                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
