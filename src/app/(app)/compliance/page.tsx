import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Lock, FileText } from 'lucide-react';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `HIPAA Compliance - ${siteConfig.name}`,
};

export default function CompliancePage() {
  return (
    <div>
      <PageHeader
        title="HIPAA Compliance"
        description="Information regarding data privacy and security measures."
      />
      
      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ShieldCheck className="mr-3 h-6 w-6 text-primary" />
              Our Commitment to Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>PatientCare Central is designed with data security and privacy as a top priority. We are committed to implementing measures to help healthcare providers meet their HIPAA compliance obligations when using our platform.</p>
            <p>Please note: While PatientCare Central provides tools and features that support HIPAA compliance, ultimate responsibility for compliance rests with the healthcare provider (Covered Entity).</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Lock className="mr-3 h-6 w-6 text-primary" />
              Key Security Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li><strong>Data Encryption:</strong> All sensitive patient data is intended to be encrypted in transit (e.g., using HTTPS) and at rest (e.g., database-level encryption). Specific implementations depend on your chosen backend and database setup.</li>
              <li><strong>Role-Based Access Control:</strong> Access to patient data is restricted based on user roles (Doctor, Nurse, Admin), ensuring that individuals only see information necessary for their duties.</li>
              <li><strong>Authentication:</strong> Secure login mechanisms, with recommendations for Multi-Factor Authentication (MFA) via your chosen provider (e.g., Firebase Auth).</li>
              <li><strong>Audit Trails (Recommended):</strong> Implementation of audit logs to track access and modifications to patient records is a crucial aspect of HIPAA, to be handled by the backend system.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="mr-3 h-6 w-6 text-primary" />
              Responsibilities & Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>As a user of PatientCare Central, it is important to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Use strong, unique passwords and enable MFA if available.</li>
              <li>Ensure that devices used to access patient data are secure.</li>
              <li>Adhere to your organization&apos;s privacy and security policies.</li>
              <li>Understand that this platform is a tool, and compliant usage is key.</li>
              <li>Consult with legal and compliance experts to ensure your organization's specific HIPAA requirements are met.</li>
            </ul>
          </CardContent>
        </Card>
        
        <p className="text-sm text-center text-muted-foreground">
          This information is for guidance only and not legal advice.
        </p>
      </div>
    </div>
  );
}
