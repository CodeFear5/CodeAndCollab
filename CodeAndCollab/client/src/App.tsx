import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import GitHubCorner from "./components/GitHubCorner";
import Toast from "./components/toast/Toast";
import EditorPage from "./pages/EditorPage";
import HomePage from "./pages/HomePage";
import { VideoCallProvider } from "./context/VideoCallContext"; // Import VideoCallProvider

const App = () => {
  return (
    <>
      <VideoCallProvider> {/* Wrap Router with VideoCallProvider */}
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/editor/:roomId" element={<EditorPage />} />
          </Routes>
        </Router>
      </VideoCallProvider>
      <Toast /> {/* Toast component from react-hot-toast */}
      <GitHubCorner />
    </>
  );
};

export default App;