import WelcomeBanner from "../../components/widgets/WelcomeBanner/WelcomeBanner";
import StatsGrid from "../../components/widgets/StatsGrid/StatsGrid";
import ModulesGrid from "../../components/widgets/ModulesGrid/ModulesGrid";
import DashboardBottom from "../../components/widgets/DashboardBottom/DashboardBottom";

function Dashboard() {
  return (
    <>
      <WelcomeBanner />
      <StatsGrid />
      <ModulesGrid />
      <DashboardBottom />
    </>
  );
}

export default Dashboard;