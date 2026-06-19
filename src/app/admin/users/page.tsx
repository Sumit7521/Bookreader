import { getUsersWithBooks } from '@/actions/admin';
import UserTable from './user-table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Users',
};

export default async function AdminUsersPage() {
  const users = await getUsersWithBooks();

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
        <p className="text-muted-foreground">
          View all registered users, their reading lists, and manage their account status.
        </p>
      </div>

      <UserTable initialUsers={users} />
    </div>
  );
}
