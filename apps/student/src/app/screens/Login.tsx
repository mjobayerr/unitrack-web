import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bus, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in real app would validate credentials
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A3C8F] to-[#2d5bb7] text-white px-6 pt-12 pb-24 rounded-b-[32px]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl">UniTrack BD</h1>
            <p className="text-white/80 text-sm">Welcome back!</p>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6 -mt-16">
        <div className="bg-white rounded-[16px] shadow-lg p-6">
          <h2 className="text-2xl text-gray-900 mb-6">Login to your account</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Student ID */}
            <div className="space-y-2">
              <Label htmlFor="studentId" className="text-gray-700">
                Student ID
              </Label>
              <Input
                id="studentId"
                type="text"
                placeholder="e.g., 2021-1-60-123"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 rounded-[12px] px-4"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 rounded-[12px] px-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-[#1A3C8F] text-sm hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-[#1A3C8F] hover:bg-[#152f6f] h-12 rounded-[12px]"
              size="lg"
            >
              Login
            </Button>
            
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/helper')}
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                Helper Login
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                Admin Login
              </button>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <button onClick={() => navigate('/signup')} className="text-[#1A3C8F] hover:underline font-medium">
                Sign Up
              </button>
            </p>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6 px-4">
          Use your university student ID and password to login
        </p>
      </div>
    </div>
  );
}
