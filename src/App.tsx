import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";  // ✅ Correct path
import Login from "./pages/Login";  // ✅ Correct path
import Signup from "./pages/Signup";  // ✅ Correct path
import Dashboard from "./pages/Dashboard";  // ✅ Correct path
import ExploreJobs from "./pages/ExploreJobs";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/explore" element={<ExploreJobs />} />

    </Routes>
  );
}

export default App;
