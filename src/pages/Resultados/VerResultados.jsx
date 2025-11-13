import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/login.css";
import "../../styles/Resultados.css";
import "../../styles/Prescripciones.css";

export default function Resultados() {
  return (
    <div className="results-view-container">
      <div className="results-main-layout">
        <div className="results-table-panel">
          <div
            className="iframe-wrapper"
            style={{ height: "120%", width: "98%" }}
          >
            <iframe
              src="https://resultadosonline.centralab.com.ar/ronlinesanatorios/?usuario=adrian&establecimiento=SSL,AMB-SSL,CAI-SSL,GUA-SSL,INT-SSL,NEO-SSL,PED-SSL,UCO-SSL,UTI-SSL"
              title="Web Externa Incrustada (Temporal)"
              style={{
                width: "100%",
                height: "calc(100vh - 80px)",
                border: "none",
                boxSizing: "border-box",
              }}
            >
              <p>Tu navegador no soporta iframes.</p>
            </iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
