'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Wifi, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    
    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col safe-area-top safe-area-bottom">
      <div className="flex-1 flex flex-col justify-center container-mobile py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl border border-blue-500/20">
            <span className="text-3xl sm:text-4xl font-bold text-white">R</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">RestoInspect</h1>
          <p className="text-gray-300 text-lg sm:text-xl font-medium">Field Reporting, Simplified.</p>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-12"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white btn-touch p-1"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        <div className="flex items-center mb-8">
          <div className="flex-1 border-t border-gray-700"></div>
          <span className="px-4 text-gray-400 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-700"></div>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-900 font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 mb-4 btn-touch shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-gray-800/80 hover:bg-gray-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all duration-200 border border-gray-600/50 btn-touch shadow-lg hover:shadow-xl transform hover:scale-[1.02] backdrop-blur-sm"
        >
          Continue as Guest
        </button>
      </div>

      {/* Connection status indicator */}
      <div className="fixed top-4 right-2 sm:right-4 z-40">
        {isOnline ? (
          <div className="flex items-center space-x-1 bg-green-800 text-green-300 px-2 py-1 rounded-full text-xs shadow-lg">
            <Wifi size={12} />
            <span className="hidden sm:inline">Online</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 offline-badge text-white px-2 py-1 rounded-full text-xs shadow-lg">
            <WifiOff size={12} />
            <span className="hidden sm:inline">Offline</span>
          </div>
        )}
      </div>
    </div>
  );
}
