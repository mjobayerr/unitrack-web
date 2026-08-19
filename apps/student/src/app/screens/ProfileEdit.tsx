import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../../lib/auth';
import { apiCall } from '../../lib/api';

/** Edit the fields the backend actually stores and the student owns: display
 * name and phone. Email is the login identity and student ID is issued, so both
 * are shown read-only rather than as inputs that cannot be saved. */
export function ProfileEdit() {
  const navigate = useNavigate();
  const { user, reloadMe } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const dirty = name.trim() !== (user.name ?? '') || phone.trim() !== (user.phone ?? '');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !dirty) return;
    setError(null);
    if (name.trim().length < 1) {
      setError('Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await apiCall((api) =>
        api.PATCH('/auth/me', { body: { name: name.trim(), phone: phone.trim() || null } }),
      );
      await reloadMe();
      navigate('/profile');
    } catch {
      setError('Could not save. Check your connection and try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      <div className="bg-[#1A3C8F] px-4 pt-10 pb-4 flex items-center justify-between shrink-0">
        <button onClick={() => navigate('/profile')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-white text-lg font-semibold">Edit Profile</h1>
        <div className="w-9" />
      </div>

      <form onSubmit={save} className="flex-1 p-4 space-y-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              className="h-12 bg-gray-50 border-gray-200 rounded-[12px] px-4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={32}
              placeholder="Add a phone number"
              className="h-12 bg-gray-50 border-gray-200 rounded-[12px] px-4"
            />
          </div>

          {/* Read-only identity: shown so the screen is complete, disabled
              because these are not editable here. */}
          <div className="space-y-2">
            <Label className="text-gray-500">Email</Label>
            <Input value={user.email} disabled className="h-12 bg-gray-100 border-gray-200 rounded-[12px] px-4 text-gray-500" />
          </div>
          {user.student?.student_id_no && (
            <div className="space-y-2">
              <Label className="text-gray-500">Student ID</Label>
              <Input value={user.student.student_id_no} disabled className="h-12 bg-gray-100 border-gray-200 rounded-[12px] px-4 text-gray-500" />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-[#EF4444] bg-red-50 rounded-[12px] px-4 py-3">{error}</p>
        )}

        <Button
          type="submit"
          disabled={saving || !dirty}
          className="w-full bg-[#1A3C8F] hover:bg-[#152f6f] h-12 rounded-[12px] gap-2 disabled:opacity-60"
          size="lg"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </div>
  );
}
