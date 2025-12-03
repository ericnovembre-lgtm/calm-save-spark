// This file is a redirect stub - Insights.tsx was merged into Analytics.tsx
// This file exists only to handle any stale imports during build
import { Navigate } from "react-router-dom";

export default function Insights() {
  return <Navigate to="/analytics?tab=cashflow" replace />;
}
