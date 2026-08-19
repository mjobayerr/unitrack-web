import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Ticket, Loader2, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { apiCall, type components } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { makeSigner, boardingCode, type BoardingSigner } from '../../lib/boarding';

type TicketT = components['schemas']['TicketOut'];

type State = 'loading' | 'ready' | 'none' | 'error';

export function QRPayment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<State>('loading');
  const [ticket, setTicket] = useState<TicketT | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const signerRef = useRef<BoardingSigner | null>(null);

  // Load an active ticket and its Ed25519 signing material.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tickets = await apiCall((api) => api.GET('/shop/tickets', {}));
        const active = tickets.find((t) => t.status === 'active') ?? null;
        if (!active) {
          if (!cancelled) setState('none');
          return;
        }
        const material = await apiCall((api) =>
          api.GET('/shop/tickets/{ticket_id}/qr-material', {
            params: { path: { ticket_id: active.id } },
          }),
        );
        if (cancelled) return;
        setTicket(active);
        signerRef.current = makeSigner(material);
        setState('ready');
      } catch {
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Rotate the code while a signer is loaded. Re-signs every 10 s — well inside
  // the 30 s slice — so the QR on screen is always current and a screenshot
  // goes stale.
  useEffect(() => {
    if (state !== 'ready') return;
    let stopped = false;
    async function render() {
      const signer = signerRef.current;
      if (!signer || Date.parse(signer.validTo) < Date.now()) return;
      const code = boardingCode(signer);
      try {
        const url = await QRCode.toDataURL(code, {
          margin: 1,
          width: 240,
          color: { dark: '#1A3C8F', light: '#ffffff' },
        });
        if (!stopped) setQrUrl(url);
      } catch {
        /* a render hiccup is not worth blanking a working code */
      }
    }
    render();
    const id = setInterval(render, 10_000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [state]);

  const studentId = user?.student?.student_id_no ?? '';
  const ridesLabel =
    ticket == null
      ? ''
      : ticket.rides_remaining == null
        ? 'Unlimited rides'
        : `${ticket.rides_remaining} ride${ticket.rides_remaining === 1 ? '' : 's'} left`;

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-gradient-to-br from-[#1A3C8F] to-[#2d5bb7] px-5 pt-10 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">QR Boarding</h1>
            <p className="text-white/70 text-sm">Show to bus helper</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* QR Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col items-center">
            {state === 'loading' && (
              <div className="w-full aspect-square max-w-[220px] flex flex-col items-center justify-center gap-3 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm">Preparing your code…</p>
              </div>
            )}

            {state === 'error' && (
              <div className="w-full py-10 text-center text-gray-500 text-sm">
                Couldn't load your boarding code. Try again in a moment.
              </div>
            )}

            {state === 'none' && (
              <div className="w-full py-8 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#1A3C8F]/8 flex items-center justify-center">
                  <Ticket className="w-7 h-7 text-[#1A3C8F]" />
                </div>
                <p className="text-gray-900 font-semibold">No active ticket</p>
                <p className="text-gray-500 text-sm">Buy a ticket to get a boarding code.</p>
                <button
                  onClick={() => navigate('/wallet')}
                  className="mt-2 px-5 h-11 bg-[#1A3C8F] text-white rounded-xl font-semibold text-sm"
                >
                  Buy a Ticket
                </button>
              </div>
            )}

            {state === 'ready' && (
              <>
                <div className="w-full aspect-square max-w-[240px] bg-gray-50 rounded-2xl flex items-center justify-center p-3 mb-4">
                  {qrUrl ? (
                    <img src={qrUrl} alt="Boarding QR code" className="w-full h-full" />
                  ) : (
                    <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
                  )}
                </div>
                <div className="text-center mb-4">
                  <p className="text-gray-900 font-bold text-lg">{user?.name ?? 'Student'}</p>
                  <p className="text-gray-500 text-sm">{studentId}</p>
                </div>
                {ridesLabel && (
                  <div className="w-full bg-[#1A3C8F]/5 rounded-xl p-3 flex justify-between items-center mb-4">
                    <span className="text-gray-600 text-sm">Ticket</span>
                    <span className="text-[#1A3C8F] font-bold text-sm">{ridesLabel}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-[#1DB954]/8 rounded-xl px-4 py-2.5 w-full justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
                  <span className="text-[#1DB954] text-sm font-semibold">QR Ready for Scanning</span>
                </div>
              </>
            )}
          </div>
        </div>

        {state === 'ready' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1DB954]/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#1DB954]" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 text-sm font-medium">Signed & rotating</p>
              <p className="text-gray-400 text-xs">Refreshes every 30s — works offline, can't be screenshotted.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
