import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Importar estilos para la estética de la tarjeta
import "@fortawesome/fontawesome-free/css/all.min.css"; 
import "../../styles/login.css"; 
//import { useApi } from "../../hooks/useApi"; 
import "../../styles/Resultados.css";
import "../../styles/Prescripciones.css";


// Funciones temporales para simular datos (si no tienes la API conectada)
const useDummyResults = (endpoint) => {
    const data = [{
        DNI: '10111426', Apellido: 'TORINO', Nombre: 'MARGARITA', Fecha: '04/08/2025', Servicio: 'UCO-SSL', PetID: 'Ex Proceso', Estado: 'En Proceso'
    }, {
        DNI: '23456789', Apellido: 'FERES', Nombre: 'JUAN', Fecha: '04/08/2025', Servicio: 'CAJ-SSL', PetID: 'SSL-45', Estado: 'Parcial'
    }, {
        DNI: '38219728', Apellido: 'CAPPARECI', Nombre: 'NICOLAS', Fecha: '04/08/2025', Servicio: 'UTI-SSL', PetID: 'En Proceso', Estado: 'Finalizado'
    }];
    return { data, loading: false, error: null };
};
const useResultsData  = useDummyResults; //= useApi cambiar cuando usemos api


export default function Resultados() {
    const { data: resultados, loading, error } = useResultsData("/api/results");
    const [selectedResultsPerPage, setSelectedResultsPerPage] = useState(25);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDates, setFilterDates] = useState({ desde: '', hasta: '' });

    //if (loading) return <div className="p-6">Cargando resultados...</div>;
    //if (error) return <div className="p-6 text-red-500">Error al cargar resultados: {error.message}</div>;

    const filteredResults = resultados?.filter(r => 
        r.DNI?.toString().includes(searchTerm) || 
        r.Apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.Nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];


    return (
        <div className="results-view-container">
            <h1 className="view-title">Visualización de Resultados</h1>

            <div className="results-main-layout">
                
                {/* ================================== */}
                {/* 1. SECCIÓN DE FILTROS (IZQUIERDA) */}
                {/* ================================== */}
                <div className="results-filter-panel content-card">
                    <h3 className="filter-title">Filtros</h3>

                    <div className="filter-group">
                        <label>Desde</label>
                        <input type="date" value={filterDates.desde} onChange={(e) => setFilterDates({...filterDates, desde: e.target.value})} className="filter-input" />
                    </div>

                    <div className="filter-group">
                        <label>Hasta</label>
                        <input type="date" value={filterDates.hasta} onChange={(e) => setFilterDates({...filterDates, hasta: e.target.value})} className="filter-input" />
                    </div>

                    <div className="filter-group">
                        <label>DNI Paciente</label>
                        <input type="text" placeholder="DNI Paciente" onChange={(e) => setSearchTerm(e.target.value)} className="filter-input" />
                    </div>

                    <div className="filter-group">
                        <label>Apellido del Paciente</label>
                        <input type="text" placeholder="Apellido" className="filter-input" />
                    </div>

                    <div className="filter-group">
                        <label>ID Petición</label>
                        <input type="text" placeholder="ID Petición" className="filter-input" />
                    </div>

                    <div className="filter-group">
                        <label>Servicio Médico</label>
                        <select className="filter-select">
                            <option value="">Todos</option>
                            {/* Opciones del servicio */}
                        </select>
                    </div>

                    <div className="filter-group results-per-page">
                        <label>Resultados por página</label>
                        <select value={selectedResultsPerPage} onChange={(e) => setSelectedResultsPerPage(e.target.value)} className="filter-select">
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                    </div>

                    <button className="btn-filter-action">Buscar</button>
                </div>
                
                {/* ================================== */}
                {/* 2. TABLA DE RESULTADOS (DERECHA) */}
                {/* ================================== */}
                <div className="results-table-panel">
                    
                    <div className="table-header-controls">
                        <h3 className="section-title">Resultados del Laboratorio ({filteredResults.length})</h3>
                        <div className="header-actions">
                            <button className="header-btn"><i className="fa-solid fa-history"></i> Historia Clínica</button>
                            <button className="header-btn"><i className="fa-solid fa-eye"></i> Ver Resultados</button>
                            <button className="header-btn"><i className="fa-solid fa-download"></i> Descargar</button>
                            <button className="header-btn"><i className="fa-solid fa-pills"></i> Vademecum</button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>DNI</th>
                                    <th>Apellido</th>
                                    <th>Nombre</th>
                                    <th>Fecha</th>
                                    <th>Servicio</th>
                                    <th>PetID</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResults.map((r, index) => (
                                    <tr key={index}>
                                        <td>{r.DNI}</td>
                                        <td>{r.Apellido}</td>
                                        <td>{r.Nombre}</td>
                                        <td>{r.Fecha}</td>
                                        <td>{r.Servicio}</td>
                                        <td>{r.PetID}</td>
                                        <td><span className={`status-badge status-${r.Estado.split(' ')[0]}`}>{r.Estado}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}