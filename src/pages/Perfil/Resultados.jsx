import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/login.css"; 
//import { useApi } from "../../hooks/useApi"; 
import "../../styles/Resultados.css";
import "../../styles/Prescripciones.css";

export default function Resultados() {
    const { data: resultados, loading, error } = useResultsData("/api/results");
    const [selectedResultsPerPage, setSelectedResultsPerPage] = useState(25);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDates, setFilterDates] = useState({ desde: '', hasta: '' });


    const filteredResults = resultados?.filter(r => 
        r.DNI?.toString().includes(searchTerm) || 
        r.Apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.Nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];


    return (
        <div className="results-view-container">
            <h1 className="view-title">Visualización de Resultados</h1>

            <div className="results-main-layout">
                
                {/* SECCIÓN DE FILTROS */}
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
                
                {/* TABLA DE RESULTADOS (DERECHA) */}
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