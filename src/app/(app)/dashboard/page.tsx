import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Pill, CalendarCheck, AlertTriangle, Activity } from 'lucide-react'; // Added Activity icon
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import Link from 'next/link'; // Added Link import

export const metadata: Metadata = {
  title: `Dashboard - ${siteConfig.name}`,
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
  className?: string;
}

function StatCard({ title, value, icon: Icon, description, className }: StatCardProps) {
  return (
    <Card className={`shadow-lg hover:shadow-xl transition-shadow ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}


export default function DashboardPage() {
  const stats = {
    activePatients: 0,
    upcomingAppointments: 0,
    medicationsToReview: 0,
    criticalAlerts: 0,
  };

  const recentActivities: string[] = []; // Empty array for recent activities

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Dashboard"
        description="Overview of your current patient activities and alerts."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Active Patients" 
          value={stats.activePatients.toString()} 
          icon={Users}
          description="Data will be fetched from Firestore."
          className="bg-card"
        />
        <StatCard 
          title="Upcoming Appointments" 
          value={stats.upcomingAppointments.toString()}
          icon={CalendarCheck}
          description="Data will be fetched from Firestore."
          className="bg-card"
        />
        <StatCard 
          title="Medications to Review" 
          value={stats.medicationsToReview.toString()}
          icon={Pill}
          description="Data will be fetched from Firestore."
          className="bg-card"
        />
        <StatCard 
          title="Critical Alerts" 
          value={stats.criticalAlerts.toString()}
          icon={AlertTriangle}
          description="Data will be fetched from Firestore."
          className="border-destructive bg-destructive/10 text-destructive-foreground"
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <ul className="space-y-3">
                {recentActivities.map((activity, index) => (
                   <li key={index} className="text-sm">{activity}</li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <Activity className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No recent activity to display.</p>
                <p className="text-xs text-muted-foreground">Activity logs will appear here once data is integrated.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Link href="/patients?filter=critical" className="text-primary hover:underline">View Critical Patients</Link>
            <Link href="/appointments?date=today" className="text-primary hover:underline">Today&apos;s Appointments</Link>
            <Link href="/patients/new" className="text-primary hover:underline">Add New Patient</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
