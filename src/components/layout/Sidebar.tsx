import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Upload,
  CheckSquare,
  BarChart3,
  Users,
  Settings,
  LogOut,
  GraduationCap,
  ClipboardList,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'management', 'iqac', 'faculty'] },
  { label: 'Criteria', icon: FileText, path: '/criteria', roles: ['admin', 'iqac', 'faculty'] },
  { label: 'Upload Documents', icon: Upload, path: '/upload', roles: ['admin', 'faculty'] },
  { label: 'Verification', icon: CheckSquare, path: '/verification', roles: ['admin', 'iqac'] },
  { label: 'Assignments', icon: ClipboardList, path: '/assignments', roles: ['admin', 'iqac'] },
  { label: 'Reports', icon: BarChart3, path: '/reports', roles: ['admin', 'management', 'iqac'] },
  { label: 'Users', icon: Users, path: '/users', roles: ['admin', 'iqac'] },
  { label: 'Settings', icon: Settings, path: '/settings', roles: ['admin'] },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const filteredNavItems = navItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-rose-500 text-white';
      case 'management': return 'bg-amber-500 text-white';
      case 'iqac': return 'bg-emerald-500 text-white';
      case 'faculty': return 'bg-blue-500 text-white';
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col shadow-xl z-50 transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Section */}
        <div className="p-4 lg:p-6 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-sidebar-foreground">IQAC</h1>
              <p className="text-xs text-sidebar-foreground/60">AQAR Management</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  'nav-link w-full text-left',
                  isActive ? 'nav-link-active' : 'nav-link-inactive'
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 lg:p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-sidebar-accent rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-sidebar-accent-foreground">
                {user?.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
                getRoleBadgeColor(user?.role || 'faculty')
              )}>
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="nav-link nav-link-inactive w-full text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
