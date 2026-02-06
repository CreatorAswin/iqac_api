import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useUsers } from '@/hooks/useApiData';
import { localApi, User as ApiUser } from '@/services/localApi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Users as UsersIcon,
  Shield,
  User as UserIcon,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type UserRole = 'Admin' | 'Management' | 'IQAC' | 'Faculty';

export default function Users() {
  const { user: currentUser } = useAuth();
  const { users, isLoading, error, refetch, setUsers } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isIQAC = currentUser?.role === 'iqac';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as UserRole | '',
  });

  const { toast } = useToast();

  const filteredUsers = users.filter(user => {
    // If current user is IQAC, hide Admin and Management roles
    if (isIQAC && (user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'management')) {
      return false;
    }

    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Management': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'IQAC': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Faculty': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return '';
    }
  };

  const handleOpenDialog = (user?: ApiUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (!editingUser && !formData.password) {
      toast({
        title: 'Password required',
        description: 'Please enter a password for the new user.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        const response = await localApi.updateUser({
          ...editingUser,
          name: formData.name,
          email: formData.email,
          role: formData.role as UserRole,
          password: formData.password || undefined,
        });

        if (response.success) {
          setUsers(prev => prev.map(u =>
            u.id === editingUser.id
              ? { ...u, name: formData.name, email: formData.email, role: formData.role as UserRole }
              : u
          ));
          toast({
            title: 'User updated',
            description: `${formData.name} has been updated successfully.`,
          });
        } else {
          toast({
            title: 'Error',
            description: response.error || 'Failed to update user',
            variant: 'destructive',
          });
        }
      } else {
        const response = await localApi.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role as UserRole,
          status: 'Active',
        });

        if (response.success && response.data) {
          setUsers(prev => [...prev, response.data!]);
          toast({
            title: 'User created',
            description: `${formData.name} has been added successfully.`,
          });
        } else {
          toast({
            title: 'Error',
            description: response.error || 'Failed to create user',
            variant: 'destructive',
          });
        }
      }

      setIsDialogOpen(false);
      setFormData({ name: '', email: '', password: '', role: '' });
      setEditingUser(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to server',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    setDeletingId(userId);
    try {
      const response = await localApi.deleteUser(userId);
      if (response.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast({
          title: 'User deleted',
          description: 'The user has been removed from the system.',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete user',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to server',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate counts based on the current user's view
  const userCounts = {
    total: isIQAC
      ? users.filter(u => u.role.toLowerCase() !== 'admin' && u.role.toLowerCase() !== 'management').length
      : users.length,
    admin: isIQAC ? 0 : users.filter(u => u.role.toLowerCase() === 'admin').length,
    management: isIQAC ? 0 : users.filter(u => u.role.toLowerCase() === 'management').length,
    iqac: users.filter(u => u.role.toLowerCase() === 'iqac').length,
    faculty: users.filter(u => u.role.toLowerCase() === 'faculty').length,
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">Manage system users and their roles</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-primary/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <UsersIcon className="w-6 md:w-8 h-6 md:h-8 text-primary" />
                <div>
                  <p className="text-xl md:text-2xl font-bold">{userCounts.total}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {!isIQAC && (
            <Card className="bg-rose-50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 md:w-8 h-6 md:h-8 text-rose-600" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{userCounts.admin}</p>
                    <p className="text-xs text-muted-foreground">Admins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {!isIQAC && (
            <Card className="bg-amber-50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-6 md:w-8 h-6 md:h-8 text-amber-600" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{userCounts.management}</p>
                    <p className="text-xs text-muted-foreground">Management</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="bg-emerald-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <UserIcon className="w-6 md:w-8 h-6 md:h-8 text-emerald-600" />
                <div>
                  <p className="text-xl md:text-2xl font-bold">{userCounts.iqac}</p>
                  <p className="text-xs text-muted-foreground">IQAC</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <UserIcon className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
                <div>
                  <p className="text-xl md:text-2xl font-bold">{userCounts.faculty}</p>
                  <p className="text-xs text-muted-foreground">Faculty</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {!isIQAC && <SelectItem value="Admin">Admin</SelectItem>}
                  {!isIQAC && <SelectItem value="Management">Management</SelectItem>}
                  <SelectItem value="IQAC">IQAC</SelectItem>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">User</th>
                    <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 md:w-10 h-8 md:h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-xs md:text-sm font-semibold text-primary">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium block truncate">{user.name}</span>
                            <span className="text-xs text-muted-foreground block sm:hidden truncate">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={cn('capitalize text-xs', getRoleBadgeVariant(user.role))}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 capitalize text-xs">
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-1 md:gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(user)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          {/* Don't show delete button for currently logged-in user */}
                          {currentUser?.email !== user.email && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(user.id)}
                              disabled={deletingId === user.id}
                            >
                              {deletingId === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information and role.' : 'Create a new user account.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}</Label>
              <Input
                type="password"
                placeholder={editingUser ? 'Enter new password' : 'Enter password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {!isIQAC && <SelectItem value="Admin">Admin</SelectItem>}
                  {!isIQAC && <SelectItem value="Management">Management</SelectItem>}
                  <SelectItem value="IQAC">IQAC</SelectItem>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
