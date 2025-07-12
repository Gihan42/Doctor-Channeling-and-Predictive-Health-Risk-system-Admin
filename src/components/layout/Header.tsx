import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuIcon, BellIcon, UserIcon, LogOutIcon, KeyIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
interface HeaderProps {
  toggleSidebar: () => void;
  isCollapsed?: boolean;
}
const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  isCollapsed
}) => {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none md:hidden">
            <MenuIcon className="h-6 w-6" />
          </button>
          <h1 className={`text-xl font-semibold text-gray-800 ml-2 md:ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-2' : 'md:ml-0'}`}>
            MediCare Admin
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700 focus:outline-none relative">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center focus:outline-none">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <UserIcon className="h-5 w-5" />
              </div>
              <span className="ml-2 font-medium text-gray-700 hidden md:block">
                {user?.name || 'Admin'}
              </span>
            </button>
            {dropdownOpen && <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button onClick={() => {
              navigate('/change-password');
              setDropdownOpen(false);
            }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                  <KeyIcon className="h-4 w-4 mr-2" />
                  Change Password
                </button>
                <button onClick={handleLogout} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>}
          </div>
        </div>
      </div>
    </header>;
};
export default Header;