
import React, { useState } from "react";
import "./DataCard.css"
const DataCard = ({ label, value }) => {
  return (
    <div className="data-card">
      <h3>{label}</h3>
      <p>{value}</p>
    </div>
  );
};

export default DataCard;
