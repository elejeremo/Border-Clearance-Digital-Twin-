import './App.css';
import Sidebar from './components/sidebar/Sidebar';
import MainDash from './components/MainDashboard/MainDash';
function App() {
  return (
    <div className="App">
        <div className ="AppGlass">
          <Sidebar/>
          <MainDash/>
          <div></div>
        </div>
    </div>
  );
}

export default App;
