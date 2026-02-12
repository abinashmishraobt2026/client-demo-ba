import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserPlusIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  PhotoIcon,
  UsersIcon,
  CogIcon,
  BellIcon,
  ClockIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { isAdmin } from '../../utils/auth';

const Sidebar = ({ sidebarOpen, isMobile }) => {
  const location = useLocation();
  
  const associateMenuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Add Lead', href: '/add-lead', icon: UserPlusIcon },
    { name: 'My Leads', href: '/my-leads', icon: DocumentTextIcon },
    { name: 'My Commission', href: '/my-commission', icon: CurrencyDollarIcon },
    { name: 'Commission Policy', href: '/commission-policy', icon: ClipboardDocumentListIcon },
    { name: 'Package Showcase', href: '/packages-showcase', icon: PhotoIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
  ];

  const adminMenuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Pending Approvals', href: '/admin/pending-approvals', icon: ClockIcon },
    { name: 'All Leads', href: '/admin/leads', icon: DocumentTextIcon },
    { name: 'All Associates', href: '/admin/associates', icon: UsersIcon },
    { name: 'Packages', href: '/admin/packages', icon: ClipboardDocumentListIcon },
    { name: 'Commission Payments', href: '/admin/commission-payments', icon: CurrencyDollarIcon },
    { name: 'Package Images', href: '/admin/package-images', icon: PhotoIcon },
    { name: 'Commission Policy', href: '/admin/commission-policy', icon: CogIcon },
    { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
    { name: 'System Management', href: '/admin/system-management', icon: ServerIcon },
  ];

  const menuItems = isAdmin() ? adminMenuItems : associateMenuItems;

  return (
    <aside className={`
      fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl z-40 sidebar
      transition-all duration-300 ease-in-out transform
      ${isMobile ? 
        (sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full') : 
        (sidebarOpen ? 'w-64' : 'w-20')
      }
    `}>
      <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
        {/* Toggle */}
        <div className="p-1.5 border-b border-blue-800 flex-shrink-0">
          <button
              onClick={() => window.toggleSidebar && window.toggleSidebar()}
              className="p-2 rounded-lg text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-95"
              aria-label="Toggle sidebar"
            >
              <div className="relative w-6 h-6">
                {sidebarOpen ? (
                  // Cross icon when sidebar is open - with rotation animation
                  <svg 
                    className="w-6 h-6 transition-all duration-300 ease-in-out transform rotate-0 hover:rotate-90" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M6 18L18 6M6 6l12 12"
                      className="transition-all duration-300 ease-in-out"
                    />
                  </svg>
                ) : (
                  // Hamburger menu when sidebar is closed - with scale animation
                  <svg 
                    className="w-6 h-6 transition-all duration-300 ease-in-out transform scale-100 hover:scale-110" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <g className="transition-all duration-300 ease-in-out">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M4 6h16"
                        className="transition-all duration-200 ease-in-out"
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M4 12h16"
                        className="transition-all duration-200 ease-in-out delay-75"
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M4 18h16"
                        className="transition-all duration-200 ease-in-out delay-150"
                      />
                    </g>
                  </svg>
                )}
              </div>
            </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-2 space-y-1 sidebar">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ease-in-out group transform hover:scale-105 active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white hover:shadow-md'
                }`}
                title={(!sidebarOpen && !isMobile) ? item.name : ''}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: sidebarOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none'
                }}
              >
                <Icon className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
                  isActive ? 'text-white scale-110' : 'text-current group-hover:scale-110'
                } ${
                  (!sidebarOpen && !isMobile) ? 'w-6 h-6' : 'w-5 h-5'
                }`} />
                
                {(sidebarOpen || isMobile) && (
                  <span className={`truncate font-medium transition-all duration-300 ease-in-out ${
                    isActive ? 'text-white' : 'text-current'
                  }`}>
                    {item.name}
                  </span>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-blue-800 transition-all duration-300 ease-in-out ${
          (sidebarOpen || isMobile) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}>
          {(sidebarOpen || isMobile) && (
            <div className="text-xs text-blue-300 space-y-1 animate-fadeInScale">
              <p className="font-medium transition-all duration-300 ease-in-out">© 2026 OffbeatTrips</p>
              <p className="text-blue-400 transition-all duration-300 ease-in-out">Business Portal</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;