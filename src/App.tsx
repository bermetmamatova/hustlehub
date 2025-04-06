import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";  // ✅ Correct path
import Login from "./pages/Login";  // ✅ Correct path
import Signup from "./pages/Signup";  // ✅ Correct path
import Dashboard from "./pages/Dashboard";  // ✅ Correct path
import ExploreJobs from "./pages/ExploreJobs";
import UploadQuestions from "./pages/UploadQuestions";
import Questions from "./pages/Questions";
import PersonalPage from "./pages/PersonalPage";
import ProgressPage from "./pages/ProgressPage";
import CommunityPage from "./pages/CommunityPage";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/explore" element={<ExploreJobs />} />
      <Route path="/upload" element={<UploadQuestions />} />
      <Route path="/questions" element={<Questions />} />
      <Route path="/personal" element={<PersonalPage />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/community" element={<CommunityPage/>} />
      

    </Routes>
  );
}

export default App;
