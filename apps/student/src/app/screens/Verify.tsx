import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Bus, CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { apiCall } from '../../lib/api';

type State = 'verifying' | 'ok' | 'failed';

/** Where the emailed verification link lands. The token in the URL *is* the
 * credential, so this route is public — it exchanges the token for an activated
 * account, then sends the student to log in. */
export function Verify() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState<State>('verifying');

  useEffect(() => {
    if (!token) {
      setState('failed');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await apiCall((api) => api.GET('/auth/verify-email', { params: { query: { token } } }));
        if (!cancelled) setState('ok');
      } catch {
        if (!cancelled) setState('failed');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
      <div className="bg-gradient-to-br from-[#1A3C8F] to-[#2d5bb7] text-white px-6 pt-12 pb-24 rounded-b-[32px]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl">UniTrack BD</h1>
            <p className="text-white/80 text-sm">Email verification</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 -mt-16 pb-8">
        <div className="bg-white rounded-[16px] shadow-lg p-6 text-center">
          {state === 'verifying' && (
            <>
              <Loader2 className="w-10 h-10 text-[#1A3C8F] animate-spin mx-auto mb-4" />
              <h2 className="text-xl text-gray-900">Verifying your email…</h2>
            </>
          )}
          {state === 'ok' && (
            <>
              <div className="w-16 h-16 rounded-full bg-[#1DB954]/10 flex items-center justify-center mx-auto mb-4">
                <CircleCheck className="w-8 h-8 text-[#1DB954]" />
              </div>
              <h2 className="text-2xl text-gray-900 mb-2">You're verified</h2>
              <p className="text-gray-500 text-sm mb-6">Your account is active. Log in to get started.</p>
              <Button onClick={() => navigate('/login')} className="w-full bg-[#1A3C8F] hover:bg-[#152f6f] h-12 rounded-[12px]" size="lg">
                Go to Login
              </Button>
            </>
          )}
          {state === 'failed' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <CircleX className="w-8 h-8 text-[#EF4444]" />
              </div>
              <h2 className="text-2xl text-gray-900 mb-2">Link didn't work</h2>
              <p className="text-gray-500 text-sm mb-6">
                This verification link is invalid or has expired. Sign up again or request a new link from the login screen.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full bg-[#1A3C8F] hover:bg-[#152f6f] h-12 rounded-[12px]" size="lg">
                Back to Login
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
