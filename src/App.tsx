import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import MyOrders from './pages/MyOrders';
import OwnerLogin from './pages/OwnerLogin';
import OwnerDashboard from './pages/OwnerDashboard';
import EmailLogin from './components/EmailLogin';
import CustomerServiceBot from './components/CustomerServiceBot';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<EmailLogin />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        </Routes>
        <CustomerServiceBot />
      </div>
    </Router>
  );
}

export default App;