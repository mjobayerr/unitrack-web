import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Bus, CircleCheck, CircleX, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ApiError, apiCall } from '../../lib/api';

type State = 'form' | 'ok' | 'expired';

/** Where the emailed reset link lands. The token in the URL is the whole
 * credential, so this route is public: it swaps the token plus a new password
 * for an updated account, then sends the student to log in. */
export function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [state, setState] = useState<State>(token ? 'form' : 'expired');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !token) return;
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await apiCall((api) => api.POST('/auth/reset-password', { body: { token, password } }));
      setState('ok');
    } catch (err) {
      // 400 means the link is bad, used, or expired — no retry of the same token
      // will help, so send them to ask for a fresh one. Anything else is transient.
      if (err instanceof ApiError && err.status === 400) {
        setState('expired');
      } else {
        setError('Could not reach the server. Check your connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
      <div className="bg-gradient-to-br from-[#1A3C8F] to-[#2d5bb7] text-white px-6 pt-12 pb-24 rounded-b-[32px]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl">UniTrack BD</h1>
            <p className="text-white/80 text-sm">Choose a new password</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 -mt-16 pb-8">
        <div className="bg-white rounded-[16px] shadow-lg p-6">
          {state === 'form' && (
            <>
              <h2 className="text-2xl text-gray-900 mb-6">Set a new password</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">
                    New password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={show ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-gray-50 border-gray-200 rounded-[12px] px-4 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-gray-700">
                    Confirm password
                  </Label>
                  <Input
                    id="confirm"
                    type={show ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter your new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
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
                  {submitting ? 'Saving…' : 'Reset password'}
                </Button>
              </form>
            </>
          )}

          {state === 'ok' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#1DB954]/10 flex items-center justify-center mx-auto mb-4">
                <CircleCheck className="w-8 h-8 text-[#1DB954]" />
              </div>
              <h2 className="text-2xl text-gray-900 mb-2">Password updated</h2>
              <p className="text-gray-500 text-sm mb-6">Log in with your new password to continue.</p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-[#1A3C8F] hover:bg-[#152f6f] h-12 rounded-[12px]"
                size="lg"
              >
                Go to Login
              </Button>
            </div>
          )}

          {state === 'expired' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <CircleX className="w-8 h-8 text-[#EF4444]" />
              </div>
              <h2 className="text-2xl text-gray-900 mb-2">Link didn't work</h2>
              <p className="text-gray-500 text-sm mb-6">
                This reset link is invalid, already used, or expired. Request a fresh one and try again.
              </p>
              <Button
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-[#1A3C8F] hover:bg-[#152f6f] h-12 rounded-[12px]"
                size="lg"
              >
                Request a new link
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
