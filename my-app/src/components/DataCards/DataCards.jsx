import "./DataCards.css"
import DataCard from "../DataCard/DataCard"
const DataCards = ({ content }) => {
    return (
      <div className="data-cards">
        {Object.entries(content).map(([key, value], index) => (
          <DataCard key={index} label={key} value={value} />
        ))}
      </div>
    );
  };
  
  export default DataCards;