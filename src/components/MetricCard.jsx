import React from 'react';

const MetricCard = ({ title, value, icon, isLoading }) => {
    return (
        <div className="metric-card">
            <div className="metric-icon-container">
                {isLoading ? (
                    <i className="fa-solid fa-spinner fa-spin"></i> 
                ) : (
                    <i className={`fa-solid ${icon}`}></i>
                )}
            </div>
            <div className="metric-details">
                <div className="metric-value">{value}</div>
                <div className="metric-title">{title}</div>
            </div>
        </div>
    );
};

export default MetricCard;