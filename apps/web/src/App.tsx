import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./app/layouts/app-layout";
import { DashboardPage } from "./features/dashboard/pages/dashboard-page";
import { SettingsPage } from "./features/settings/pages/settings-page";
import { TestRunsPage } from "./features/test-runs/pages/test-run-page";
import { NotFoundPage } from "./app/pages/not-found-page";
import { TestConfigurationPage } from "./features/test-configuration/pages/test-configuration-page";
import { TestRunDetailPage } from "./features/test-runs/pages/test-run-detail-page";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="test-runs" element={<TestRunsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="test-configuration" element={<TestConfigurationPage />} />
        <Route path="test-runs/:id" element={<TestRunDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
