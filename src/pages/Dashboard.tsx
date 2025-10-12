import DashboardCards from "../components/DashBoard_component/DashboardCards"
import DashboardChart from "../components/DashBoard_component/DashboardChart"  
import SocialAnalyticsDashboard from "../components/DashBoard_component/SocialAnalyticsDashboard"


const Dashboard = () => {
  return (
    <div>
      <DashboardCards />
      <DashboardChart />
      <SocialAnalyticsDashboard />
    </div>
  )
}

export default Dashboard
