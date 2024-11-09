const MySvg = ({ handleZoom, zoom, selectedId }) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        style={{ cursor: 'pointer' }}
      >
        <g
          id="element1"
          onClick={() => handleZoom('element1')}
          style={{
            transform: selectedId === 'element1' && zoom === 2 ? 'scale(2)' : 'scale(1)',
            transformOrigin: 'center',
            transition: 'transform 0.3s ease'
          }}
        >
          {/* Your SVG content here */}
        </g>
        <g
          id="element2"
          onClick={() => handleZoom('element2')}
          style={{
            transform: selectedId === 'element2' && zoom === 2 ? 'scale(2)' : 'scale(1)',
            transformOrigin: 'center',
            transition: 'transform 0.3s ease'
          }}
        >
          {/* Your SVG content here */}
        </g>
        <g
          id="element3"
          onClick={() => handleZoom('element3')}
          style={{
            transform: selectedId === 'element3' && zoom === 2 ? 'scale(2)' : 'scale(1)',
            transformOrigin: 'center',
            transition: 'transform 0.3s ease'
          }}
        >
          {/* Your SVG content here */}
        </g>
      </svg>
    );
  };
  
  export default MySvg;