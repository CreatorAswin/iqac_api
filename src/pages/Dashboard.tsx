import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { ManagementDashboard } from '@/components/dashboards/ManagementDashboard';
import { IQACDashboard } from '@/components/dashboards/IQACDashboard';
import { FacultyDashboard } from '@/components/dashboards/FacultyDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  const renderDashboard = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'management':
        return <ManagementDashboard />;
      case 'iqac':
        return <IQACDashboard />;
      case 'faculty':
        return <FacultyDashboard />;
      default:
        return <div>Unknown role: {user?.role}</div>;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}
