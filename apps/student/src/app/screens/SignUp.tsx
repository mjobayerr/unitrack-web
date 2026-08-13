import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bus, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', studentId: '', email: '', phone: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
      <div className="bg-gradient-to-br from-[#1A3C8F] to-[#2d5bb7] text-white px-6 pt-12 pb-24 rounded-b-[32px]">
        <button onClick={() => navigate('/login')} className="flex items-center gap-1 text-white/70 mb-6">
          <ChevronLeft className="w-5 h-5" /> Back to Login
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl">UniTrack BD</h1>
            <p className="text-white/80 text-sm">Create your account</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 -mt-16 pb-8">
        <div className="bg-white rounded-[16px] shadow-lg p-6">
          <h2 className="text-2xl text-gray-900 mb-6">Student Registration</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-gray-700">Full Name</Label>
              <Input id="name" placeholder="e.g., Rashidul Islam" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-12 bg-gray-50 border-gray-200 rounded-[12px] px-4" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studentId" className="text-gray-700">Student ID</Label>
              <Input id="studentId" placeholder="e.g., 2021-1-60-123" value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="h-12 bg-gray-50 border-gray-200 rounded-[12px] px-4" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-700">University Email</Label>
              <Input id="email" type="email" placeholder="rashid@university.edu.bd" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12 bg-gray-50 border-gray-200 rounded-[12px] px-4" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-gray-700">Phone (bKash)</Label>
              <Input id="phone" type="tel" placeholder="01XXXXXXXXX" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-12 bg-gray-50 border-gray-200 rounded-[12px] px-4" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="h-12 bg-gray-50 border-gray-200 rounded-[12px] px-4 pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#1A3C8F] hover:bg-[#152f6f] h-12 rounded-[12px] mt-2" size="lg">
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-[#1A3C8F] hover:underline font-medium">
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
