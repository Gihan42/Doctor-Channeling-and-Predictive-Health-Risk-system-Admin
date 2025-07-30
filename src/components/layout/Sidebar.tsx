import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboardIcon, UsersIcon, CalendarIcon,HospitalIcon, UserIcon, ShieldIcon, MailIcon, XIcon, ChevronLeftIcon, ChevronRightIcon,Kanban  } from 'lucide-react';
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}
interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  onClick?: () => void;
}
const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  isCollapsed,
  onClick
}) => {
  return <NavLink to={to} onClick={onClick} className={({
    isActive
  }) => `flex items-center px-4 py-3 text-gray-600 transition-colors duration-300 transform hover:bg-gray-100 hover:text-gray-700 ${isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600 font-medium' : ''} ${isCollapsed ? 'justify-center' : ''}`}>
      <div className="w-5 h-5">{icon}</div>
      {!isCollapsed && <span className="mx-4 font-medium">{label}</span>}
    </NavLink>;
};
const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  isCollapsed,
  toggleCollapse
}) => {
  const closeSidebar = () => {
    setIsOpen(false);
  };
  return <>
      {/* Mobile backdrop */}
      {isOpen && <div className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 bg-white shadow-lg transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          {!isCollapsed && <h2 className="text-xl font-semibold text-gray-800">MediCare</h2>}
          <div className="flex items-center">
            <button onClick={toggleCollapse} className="text-gray-500 focus:outline-none hidden md:block">
              {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
            </button>
            <button onClick={closeSidebar} className="text-gray-500 focus:outline-none md:hidden ml-2">
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        <nav className="flex flex-col h-full py-4">
          <NavItem to="/dashboard" icon={<LayoutDashboardIcon className="w-5 h-5" />} label="Dashboard" isCollapsed={isCollapsed} onClick={closeSidebar} />
          <NavItem to="/doctors" icon={<UsersIcon className="w-5 h-5" />} label="Doctors" isCollapsed={isCollapsed} onClick={closeSidebar} />
          <NavItem to="/medical-centers" icon={<HospitalIcon className="w-5 h-5" />} label="Medical Centers" isCollapsed={isCollapsed} onClick={closeSidebar} />
          <NavItem to="/scheduling" icon={<CalendarIcon className="w-5 h-5" />} label="Scheduling" isCollapsed={isCollapsed} onClick={closeSidebar} />
          <NavItem to="/patients" icon={<UserIcon className="w-5 h-5" />} label="Patients" isCollapsed={isCollapsed} onClick={closeSidebar} />
          <NavItem to="/admins" icon={<ShieldIcon className="w-5 h-5" />} label="Admins" isCollapsed={isCollapsed} onClick={closeSidebar} />
          <NavItem to="/email" icon={<MailIcon className="w-5 h-5" />} label="Email System" isCollapsed={isCollapsed} onClick={closeSidebar} />
          <NavItem to="/comments" icon={<Kanban className="w-5 h-5" />} label="Patients Comments" isCollapsed={isCollapsed} onClick={closeSidebar} />

        </nav>
      </div>
    </>;
};
export default Sidebar;