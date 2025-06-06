'use client';

import React, { useState, useEffect } from 'react';
import { 
  Menu, Bell, User, FileText, MapPin, Folder, Settings, LogOut, 
  Navigation, Upload, Wifi, WifiOff
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [userName] = useState('Alex Rodriguez');
  const [showMenu, setShowMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingUploads] = useState(2);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  
  const router = useRouter();

  // Location effect
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          console.warn('Location access not available:', error.message);
          setCurrentLocation(null);
        },
        {
          timeout: 10000,
          maximumAge: 60000,
          enableHighAccuracy: false
        }
      );
    }
  }, []);

  // Online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navigateTo = (path: string) => {
    router.push(path);
    setShowMenu(false);
  };

  const handleLogout = () => {
    router.push('/');
    setShowMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white safe-area-top safe-area-bottom">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-6 sm:py-8 flex items-center justify-between shadow-xl sticky top-0 z-30 border-b border-gray-700/50 backdrop-blur-md">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 btn-touch ripple flex items-center justify-center backdrop-blur-sm"
        >
          <Menu size={24} className="text-white" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">RestoInspect</h1>
        <div className="flex items-center space-x-3">
          {/* Sync status indicator */}
          {pendingUploads > 0 && (
            <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs bg-yellow-600/20 text-yellow-300 border border-yellow-500/30">
              <Upload size={12} />
              <span>{pendingUploads}</span>
            </div>
          )}
          <button className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 relative btn-touch backdrop-blur-sm">
            <Bell size={22} className="text-white" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg border-2 border-gray-900">3</span>
          </button>
          <button className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 btn-touch backdrop-blur-sm">
            <User size={22} className="text-white" />
          </button>
        </div>
      </div>

      <div className="container-mobile py-8 sm:py-12 pb-32 sm:pb-36">
        {/* Enhanced Welcome Section */}
        <div className="mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">👋 Welcome back, {userName}</h2>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-10">Ready to inspect properties and help communities recover</p>
          
          {currentLocation && (
            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-10 bg-gray-800/50 rounded-xl px-4 py-4 backdrop-blur-sm border border-gray-700/30">
              <Navigation size={16} />
              <span>Current location: {currentLocation}</span>
            </div>
          )}
          
          {/* Daily Progress Bar */}
          <div className="bg-gray-800/40 rounded-2xl p-8 border border-gray-700/30 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <span className="text-white text-base font-semibold">Daily Goal Progress</span>
              <span className="text-gray-400 text-sm">12/15 inspections</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500" style={{ width: '80%' }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>80% complete</span>
              <span>3 remaining</span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 gap-6 sm:gap-8 mb-18 sm:mb-24">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-center shadow-xl border border-blue-500/20">
            <div className="text-white text-4xl font-bold mb-4">12</div>
            <div className="text-blue-100 text-sm font-medium">Inspections Today</div>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-center shadow-xl border border-green-500/20">
            <div className="text-white text-4xl font-bold mb-4">47</div>
            <div className="text-green-100 text-sm font-medium">Total This Week</div>
          </div>
        </div>

        {/* Daily Progress & Quick Stats */}
        <div className="mb-18 sm:mb-24">
          <h3 className="text-xl font-bold text-white mb-10">📊 Today&apos;s Progress</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700/30 text-center">
              <div className="text-yellow-400 text-2xl font-bold mb-4">8</div>
              <div className="text-gray-300 text-sm">Pending</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700/30 text-center">
              <div className="text-green-400 text-2xl font-bold mb-4">4</div>
              <div className="text-gray-300 text-sm">Completed</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700/30 text-center">
              <div className="text-blue-400 text-2xl font-bold mb-4">2.4km</div>
              <div className="text-gray-300 text-sm">Distance</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700/30 text-center">
              <div className="text-purple-400 text-2xl font-bold mb-4">3.2h</div>
              <div className="text-gray-300 text-sm">Time Spent</div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Cards */}
        <div className="space-y-4 sm:space-y-5 mb-16 sm:mb-20">
          <button
            onClick={() => navigateTo('/inspection/address')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl p-8 flex items-center space-x-6 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-xl hover:shadow-2xl ripple haptic-medium border border-blue-500/20"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 flex-shrink-0">
              <FileText size={32} className="text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h3 className="text-white text-xl font-bold truncate mb-3">📝 New Inspection</h3>
              <p className="text-blue-100 text-sm opacity-90 leading-relaxed">Start documenting property damage</p>
            </div>
          </button>

          <button
            onClick={() => navigateTo('/map')}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-2xl p-8 flex items-center space-x-6 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-xl hover:shadow-2xl ripple haptic-medium border border-orange-500/20"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 flex-shrink-0">
              <MapPin size={32} className="text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h3 className="text-white text-xl font-bold truncate mb-3">📍 Spot a Damaged Property</h3>
              <p className="text-orange-100 text-sm opacity-90 leading-relaxed">Quick pin drop while walking around</p>
            </div>
          </button>

          <button
            onClick={() => navigateTo('/submissions')}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-2xl p-8 flex items-center space-x-6 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-xl hover:shadow-2xl ripple haptic-medium border border-purple-500/20"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 flex-shrink-0">
              <Folder size={32} className="text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h3 className="text-white text-xl font-bold truncate mb-3">📂 My Submissions</h3>
              <p className="text-purple-100 text-sm opacity-90 leading-relaxed">View your inspection reports</p>
            </div>
          </button>
        </div>

        {/* Recent Inspections */}
        <div className="mb-20 sm:mb-26">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-xl font-bold text-white">🕐 Recent Activity</h3>
            <button 
              onClick={() => navigateTo('/submissions')}
              className="text-blue-400 text-sm hover:text-blue-300 transition-colors font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-8">
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                    <span className="text-white font-semibold">123 Oak Street</span>
                  </div>
                  <p className="text-gray-400 text-sm">Completed • 8 photos • 2 hours ago</p>
                </div>
                <div className="text-green-400 text-xs bg-green-400/10 px-3 py-2 rounded-full font-medium">
                  ✓ Done
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                    <span className="text-white font-semibold">456 Pine Avenue</span>
                  </div>
                  <p className="text-gray-400 text-sm">In Progress • 5 photos • 1 hour ago</p>
                </div>
                <div className="text-yellow-400 text-xs bg-yellow-400/10 px-3 py-2 rounded-full font-medium">
                  ⚡ Active
                </div>
              </div>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                    <span className="text-white font-semibold">789 Maple Drive</span>
                  </div>
                  <p className="text-gray-400 text-sm">Submitted • 12 photos • 3 hours ago</p>
                </div>
                <div className="text-blue-400 text-xs bg-blue-400/10 px-3 py-2 rounded-full font-medium">
                  📤 Sent
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-20 sm:mb-26">
          <h3 className="text-xl font-bold text-white mb-12">⚡ Quick Actions</h3>
          <div className="grid grid-cols-2 gap-8 sm:gap-10">
            <button 
              onClick={() => navigateTo('/inspection/media')}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-gray-700/30 hover:bg-gray-700/50 transition-all btn-touch ripple haptic-medium"
            >
              <div className="text-center">
                <div className="text-3xl mb-6">📷</div>
                <div className="text-white text-base font-semibold mb-3">Quick Photo</div>
                <div className="text-gray-400 text-sm">Capture damage</div>
              </div>
            </button>
            <button 
              onClick={() => navigateTo('/map')}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-gray-700/30 hover:bg-gray-700/50 transition-all btn-touch ripple haptic-medium"
            >
              <div className="text-center">
                <div className="text-3xl mb-6">📍</div>
                <div className="text-white text-base font-semibold mb-3">Drop Pin</div>
                <div className="text-gray-400 text-sm">Mark location</div>
              </div>
            </button>
          </div>
        </div>
        </div>

      {/* Enhanced Menu Drawer */}
              {showMenu && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowMenu(false)}
            ></div>
            <div className="fixed left-0 top-0 bottom-0 w-72 sm:w-80 bg-gray-800 z-50 slide-in-left shadow-2xl">
              <div className="p-4 sm:p-6 safe-area-top">
                <div className="flex items-center space-x-3 mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-base sm:text-lg font-bold">A</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm sm:text-base truncate">{userName}</p>
                    <p className="text-xs sm:text-sm text-gray-400">Field Inspector</p>
                  </div>
                </div>
              
              {/* Connection status in menu */}
              <div className="mb-6">
                {isOnline ? (
                  <div className="flex items-center space-x-2 text-green-400 text-sm">
                    <Wifi size={16} />
                    <span>Connected</span>
                    {pendingUploads > 0 && <span>({pendingUploads} pending)</span>}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                    <WifiOff size={16} />
                    <span>Offline mode</span>
                  </div>
                )}
              </div>

                              <nav className="space-y-1 sm:space-y-2">
                  <button onClick={() => navigateTo('/dashboard')} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors btn-touch text-left">
                    <FileText size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Home</span>
                  </button>
                  <button onClick={() => navigateTo('/inspection/address')} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors btn-touch text-left">
                    <FileText size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">New Inspection</span>
                  </button>
                  <button onClick={() => navigateTo('/map')} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors btn-touch text-left">
                    <MapPin size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Spot a Damaged Property</span>
                  </button>
                  <button onClick={() => navigateTo('/submissions')} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors btn-touch text-left">
                    <Folder size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">My Submissions</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors btn-touch text-left">
                    <Settings size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Settings</span>
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-red-400 btn-touch text-left">
                    <LogOut size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Logout</span>
                  </button>
                </nav>
            </div>
          </div>
        </>
      )}

      {/* Connection status indicator */}
      {!isOnline && (
        <div className="fixed top-24 right-4 z-40">
          <div className="flex items-center space-x-1 offline-badge text-white px-3 py-2 rounded-full text-xs shadow-lg border border-yellow-500/30">
            <WifiOff size={14} />
            <span>Offline Mode</span>
          </div>
        </div>
      )}
    </div>
  );
} 