import LoginPage from "pages/LoginPage";
import SignupPage from "pages/SignupPage";
import { Routes, Route } from "react-router";
import { ProtectedRoute } from "components/ProtectedRoutes";
import { AppLayout } from "components/layout/AppLayout";
import Dashboard from "pages/Dashboard";
import MetricsPage from "pages/MetricsPage";
import ApiKeysPage from "pages/ApiKeysPage";
import PlaygroundPage from "pages/PlaygroundPage";
const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="/keys" element={<ApiKeysPage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
