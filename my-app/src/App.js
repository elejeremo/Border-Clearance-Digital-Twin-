import './App.css';
import MainDash from './components/MainDashboard/MainDash';
//import { WebSocketProvider } from './components/WebSocketContext/Websocket';
function App() {
  return (
    <div className="App">
      {/* <WebSocketProvider> */}
            <div className ="AppGlass">
                <MainDash/>
              </div>

      {/* </WebSocketProvider> */}
        
    </div>
  );
}

export default App;
