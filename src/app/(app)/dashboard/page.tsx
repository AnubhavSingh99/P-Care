import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Pill, CalendarCheck, AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

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
  // Mock data - replace with actual data fetching
  const stats = {
    activePatients: 78,
    upcomingAppointments: 12,
    medicationsToReview: 5,
    criticalAlerts: 2,
  };

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
          description="+5 from last week"
          className="bg-card"
        />
        <StatCard 
          title="Upcoming Appointments" 
          value={stats.upcomingAppointments.toString()}
          icon={CalendarCheck}
          description="3 today"
          className="bg-card"
        />
        <StatCard 
          title="Medications to Review" 
          value={stats.medicationsToReview.toString()}
          icon={Pill}
          description="2 overdue"
          className="bg-card"
        />
        <StatCard 
          title="Critical Alerts" 
          value={stats.criticalAlerts.toString()}
          icon={AlertTriangle}
          description="Needs immediate attention"
          className="border-destructive bg-destructive/10 text-destructive-foreground"
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="text-sm">Dr. Smith updated Alice Wonderland&apos;s medication.</li>
              <li className="text-sm">New patient Bob The Builder scheduled an appointment.</li>
              <li className="text-sm">Nurse Jane Doe logged vitals for Charlie Brown.</li>
            </ul>
            {/* In a real app, this would be a dynamic list */}
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <a href="/patients?filter=critical" className="text-primary hover:underline">View Critical Patients</a>
            <a href="/appointments?date=today" className="text-primary hover:underline">Today&apos;s Appointments</a>
            <a href="/patients/new" className="text-primary hover:underline">Add New Patient</a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
