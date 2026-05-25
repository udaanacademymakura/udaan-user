import { Box } from "@mui/material";
import DashboardAnalytics from "./components/pages/Dashboard/DashboardAnalytics";
import DashboardDailyQuiz from "./components/pages/Dashboard/DashboardDailyQuiz";
import DashboardGorkhapatraListing from "./components/pages/Dashboard/DashboardGorkhapatraListing";
import DashboardProgressCharts from "./components/pages/Dashboard/DashboardProgressCharts";
import DashboardPurchasedCourseListing from "./components/pages/Dashboard/DashboardPurchasedCourseListing";
import DashboardTopBanners from "./components/pages/Dashboard/DashboardTopBanners";
import LiveClassAndTestFilter from "./components/pages/Dashboard/LiveClassAndTestFilter";

export default function App() {
  return (
    <div className="h-full overflow-auto pr-2">
      <Box
        className="flex flex-col xl:grid xl:grid-cols-12"
        sx={{
          gap: "18px",
          alignItems: "start",
          pb: 4,
        }}
      >
        <Box className="xl:col-span-8" sx={{ display: "flex", flexDirection: "column", gap: "18px", overflow: "hidden" }}>
          <DashboardTopBanners />
          <DashboardAnalytics />
          <DashboardProgressCharts />
          <DashboardPurchasedCourseListing />
          <DashboardGorkhapatraListing />
          <DashboardDailyQuiz />
        </Box>


        <Box className="xl:col-span-4 w-full" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <LiveClassAndTestFilter />
        </Box>
      </Box>
    </div>
  );
}
