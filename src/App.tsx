import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";  
import Login from "./pages/Login";  
import Signup from "./pages/Signup"; 
import Dashboard from "./pages/Dashboard"; 
import ExploreJobs from "./pages/ExploreJobs";
import UploadQuestions from "./pages/UploadQuestions";
import Questions from "./pages/Questions";
import PracticePage from "./pages/PracticePage";
import ProgressPage from "./pages/ProgressPage";
import CommunityPage from "./pages/CommunityPage";
import UpdatePreferences from "./pages/UpdatePreferencesPage";
import MyDataPage from "./pages/MyData";
import MockConnectPage from "./pages/MockConnectPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyEmail from "./pages/VerifyEmail";
import ChangePassword from "./pages/ChangePassword";
import AboutUs from "./pages/AboutUs";
import AdminDashboard from "./pages/AdminDashboard";



function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/explore" element={<ExploreJobs />} />
      <Route path="/upload" element={<UploadQuestions />} />
      <Route path="/questions" element={<Questions question={{
        id: "",
        title: "",
        link: "",
        difficulty: "",
        topic: "",
        companies: []
      }} />} />
      <Route path="/practice" element={<PracticePage />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/community" element={<CommunityPage/>} />
      <Route path="/update" element={<UpdatePreferences/>} />
      <Route path="/mydata" element={<MyDataPage />} />
      <Route path="/connect" element={<MockConnectPage/>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify" element={<VerifyEmail />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/admin" element={<AdminDashboard />} />



    </Routes>
  );
}

export default App;
