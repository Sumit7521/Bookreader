'use client';

import { useState } from 'react';
import { toggleUserStatus } from '@/actions/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpenIcon, ShieldIcon, UserIcon, ShieldAlertIcon } from 'lucide-react';

export default function UserTable({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isPending, setIsPending] = useState(false);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setIsPending(true);
    try {
      await toggleUserStatus(userId, currentStatus);
      // Optimistic update
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isActive: !currentStatus } : u
      ));
    } catch (error) {
      console.error("Failed to toggle status", error);
      alert("Failed to toggle user status.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Last Seen</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <UserIcon size={16} />
                    </div>
                    <div>
                      <p className="font-medium">{user.name || 'No Name'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.role === 'admin' ? (
                    <Badge variant="outline" className="gap-1 border-primary/20 text-primary">
                      <ShieldIcon size={12} /> Admin
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">User</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {user.isActive !== false ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-0">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-muted-foreground">Disabled</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {user.lastActiveAt ? (
                    new Date().getTime() - new Date(user.lastActiveAt).getTime() < 5 * 60 * 1000 ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Online Now
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {new Date(user.lastActiveAt).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    )
                  ) : (
                    <span className="text-muted-foreground italic">Never</span>
                  )}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Dialog>
                      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
                        <BookOpenIcon size={14} />
                        Books ({user.books?.length || 0})
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
                        <DialogHeader>
                          <DialogTitle>{user.name || user.email}&apos;s Books</DialogTitle>
                          <DialogDescription>
                            They have {user.books?.length || 0} books in their library.
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="flex-1 -mx-4 px-4 overflow-y-auto">
                          {user.books?.length > 0 ? (
                            <div className="grid gap-3 py-4">
                              {user.books.map((book: any) => (
                                <div key={book._id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                                  {book.coverImage ? (
                                    <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                                  ) : (
                                    <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                                      <BookOpenIcon size={16} className="text-muted-foreground" />
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-semibold text-sm leading-tight mb-1">{book.title}</h4>
                                    {book.author && <p className="text-xs text-muted-foreground mb-2">{book.author}</p>}
                                    <Badge variant="secondary" className="text-[10px] uppercase px-1.5 py-0">
                                      {book.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-12 text-center text-muted-foreground">
                              No books found for this user.
                            </div>
                          )}
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    {user.role !== 'admin' && (
                      <Button 
                        variant={user.isActive !== false ? "destructive" : "default"}
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleToggleStatus(user._id, user.isActive !== false)}
                      >
                        {user.isActive !== false ? 'Disable' : 'Enable'}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
