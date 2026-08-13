import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bus, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../../lib/auth';
import { ApiError } from '../../lib/api';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/app', { replace: true });
    } catch (err) {
      // The backend returns the same message for an unknown address and a wrong
      // password, and spends the same time on both, so we do too. 403 is the one
      // distinct case: the account exists but is not active yet.
      setError(
        err instanceof ApiError && err.status === 403
          ? 'This account is not active. Check your email for the verification link.'
          : 'Incorrect email or password.',
      );
    } finally {
      setSubmitting(false);
    }
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
            {/* University Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                University Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@ulab.edu.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            {error && (
              <p className="text-sm text-[#EF4444] bg-red-50 rounded-[12px] px-4 py-3">{error}</p>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1A3C8F] hover:bg-[#152f6f] h-12 rounded-[12px] disabled:opacity-60"
              size="lg"
            >
              {submitting ? 'Signing in…' : 'Login'}
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
          Use your university email and password to login
        </p>
      </div>
    </div>
  );
}
