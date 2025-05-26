import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, UserCog } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { mockUsers } from '@/data/mock'; // Assuming mock users exist
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const metadata: Metadata = {
  title: `User Management - ${siteConfig.name}`,
};

// Helper function to get initials
const getInitials = (name?: string) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

export default function UserManagementPage() {
  // This is a placeholder. In a real app, you'd fetch and manage users.
  const users = mockUsers;

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Administer user accounts and roles."
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New User
          </Button>
        }
      />
      
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                   <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl || `https://placehold.co/100x100/B39DDB/FFFFFF?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="avatar person" />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'doctor' ? 'default' : 'secondary'} className="capitalize">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <UserCog className="h-4 w-4" />
                    <span className="sr-only">Edit User</span>
                  </Button>
                  {/* Add more actions like Delete */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       {users.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No users found.
        </div>
      )}
    </div>
  );
}
