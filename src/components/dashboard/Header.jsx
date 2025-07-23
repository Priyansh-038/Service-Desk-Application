import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { LogOut, User, Shield, Crown, Sparkles, Bell } from 'lucide-react';

const Header = () => {
  const { currentUser, userProfile, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl shadow-lg transform transition-all duration-300 hover:rotate-6 hover:scale-110">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Service Desk
              </h1>
            </div>
            
            <Badge 
              variant={userProfile?.role === 'admin' ? 'default' : 'secondary'} 
              className={`${
                userProfile?.role === 'admin' 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-xl' 
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              } transition-all duration-300 transform hover:scale-105`}
            >
              {userProfile?.role === 'admin' ? (
                <>
                  <Crown className="h-3 w-3 mr-1" />
                  Administrator
                </>
              ) : (
                <>
                  <User className="h-3 w-3 mr-1" />
                  User
                </>
              )}
            </Badge>
          </div>
          
          {/* User Section */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </Button>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm">
              <Avatar className="border-2 border-white shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {getInitials(userProfile?.name || currentUser?.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {userProfile?.name || currentUser?.displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userProfile?.department || 'No Department'}
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="h-10 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;