import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Bus, MailCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { apiCall } from '../../lib/api';

/** Ask for a reset link. The backend answers 202 for every address, so this
 * screen shows the same "check your inbox" confirmation whether or not the
 * email has an account — it must not become a way to probe who is registered. */
export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await apiCall((api) =>
        api.POST('/auth/forgot-password', { body: { email: email.trim() } }),
      );
      setSent(true);
    } catch {
      // The only failure the caller ever sees is not reaching the server —
      // the endpoint itself always accepts. Keep the address a secret either way.
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
      <div className="bg-gradient-to-br from-[#1A3C8F] to-[#2d5bb7] text-white px-6 pt-12 pb-24 rounded-b-[32px]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl">UniTrack BD</h1>
            <p className="text-white/80 text-sm">Reset your password</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 -mt-16">
        <div className="bg-white rounded-[16px] shadow-lg p-6">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#1DB954]/10 flex items-center justify-center mx-auto mb-4">
                <MailCheck className="w-8 h-8 text-[#1DB954]" />
              </div>
              <h2 className="text-2xl text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-gray-500 text-sm mb-6">
                If an account exists for <span className="font-medium text-gray-700">{email.trim()}</span>,
                we've sent a link to reset your password. It's valid for one hour.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-[#1A3C8F] hover:bg-[#152f6f] h-12 rounded-[12px]"
                size="lg"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl text-gray-900 mb-2">Forgot your password?</h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter your university email and we'll send you a link to set a new one.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    required
                    className="h-12 bg-gray-50 border-gray-200 rounded-[12px] px-4"
                  />
                </div>

                {error && (
                  <p className="text-sm text-[#EF4444] bg-red-50 rounded-[12px] px-4 py-3">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1A3C8F] hover:bg-[#152f6f] h-12 rounded-[12px] disabled:opacity-60"
                  size="lg"
                >
                  {submitting ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>

              <button
                onClick={() => navigate('/login')}
                className="mt-6 flex items-center justify-center gap-1.5 w-full text-sm text-gray-500 hover:text-[#1A3C8F]"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
