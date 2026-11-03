import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import BrandLogo from '../components/BrandLogo';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { faDay, toman } from '../lib/fmt';

const PRESETS = Array.from({ length: 12 }, (_, i) => `/img/presets/p${i + 1}.jpg`);

function readPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('نمی‌شود عکس را بخوانم.'));
        return;
      }
      const s = Math.min(img.width, img.height);
      const sx = (img.width - s) / 2;
      const sy = (img.height - s) / 2;
      ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.86));
    };
    img.onerror = () => reject(new Error('این فایل عکس نیست.'));
    img.src = url;
  });
}

export default function Account() {
  const { user, loading, refresh, isAdmin, canGod } = useAuth();
  const qc = useQueryClient();
  const mine = useQuery({ queryKey: ['res-me'], queryFn: () => api('/reservations/me'), enabled: !!user });
  const wallet = useQuery({ queryKey: ['wallet'], queryFn: () => api('/wallet'), enabled: !!user });
  const [edit, setEdit] = useState(false);
  const [msg, setMsg] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [preview, setPreview] = useState('');
  const [chosen, setChosen] = useState('');

  const save = useMutation({
    mutationFn: async () => {
      if (preview.startsWith('data:')) {
        await api('/auth/me/avatar', { method: 'POST', body: JSON.stringify({ image: preview }) });
        return api('/auth/me', {
          method: 'PATCH',
          body: JSON.stringify({ displayName, bio, gender }),
        });
      }
      const body: Record<string, string> = { displayName, bio, gender };
      if (chosen) body.avatar = chosen;
      return api('/auth/me', { method: 'PATCH', body: JSON.stringify(body) });
    },
    onSuccess: async () => {
      setMsg('پروفایل ذخیره شد.');
      setEdit(false);
      setPreview('');
      await refresh();
      qc.invalidateQueries({ queryKey: ['pub', user?.username] });
    },
    onError: (e: any) => setMsg(e.message),
  });

  if (loading) return <p className="p-10 text-center text-ink-muted">در حال بارگذاری…</p>;
  if (!user) {
    return (
      <div className="p-16 text-center">
        <p className="mb-4">برای دیدن حساب وارد شو.</p>
        <Link to="/login" className="btn btn-night">ورود به حساب</Link>
      </div>
    );
  }

  const photo = preview || chosen || user.avatar;
  const rokad = user.membershipOrigin === 'ROKAD';

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="card p-6 flex flex-col items-center text-center">
        {photo ? (
          <img src={photo} alt="" className="avatar-frame account-photo" width={148} height={148} />
        ) : (
          <span className="avatar-frame account-photo" aria-hidden />
        )}
        <h1 className="mt-4 text-2xl font-black inline-flex items-center justify-center gap-1.5">
          {user.displayName}
          {rokad && <BrandLogo variant="membership-mark" className="rokad-mark-lg" alt="عضو رکاد" />}
        </h1>
        <p className="text-ink-muted text-sm mt-1" dir="ltr">@{user.username}</p>
        {user.bio && <p className="mt-3 text-sm leading-7 max-w-sm">{user.bio}</p>}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          <Link to={`/players/${user.username}`} className="btn btn-ghost btn-sm">پروفایل عمومی</Link>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setEdit((v) => !v);
              setDisplayName(user.displayName || '');
              setBio(user.bio || '');
              setGender(user.gender || '');
              setPreview('');
              setChosen(user.avatar && PRESETS.includes(user.avatar) ? user.avatar : '');
              setMsg('');
            }}
          >
            {edit ? 'بستن ویرایش' : 'ویرایش پروفایل'}
          </button>
        </div>
      </div>

      {(isAdmin || canGod) && (
        <div className="grid gap-2 mt-4">
          {isAdmin && <Link to="/admin" className="btn btn-night w-full">پنل مدیریت</Link>}
          {canGod && <Link to="/host/god-game" className="btn btn-ghost w-full">میزبان میز</Link>}
        </div>
      )}

      {edit && (
        <form
          className="card p-5 mt-4 space-y-4 text-right"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="photo-picker is-avatar">
            <p className="field-lab">عکس پروفایل</p>
            <div className="photo-preview is-avatar">
              {photo ? (
                <img src={photo} alt="" />
              ) : (
                <span className="avatar-frame account-photo" />
              )}
            </div>
            <div className="photo-actions">
              <label className="file-btn">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = '';
                    if (!f) return;
                    try {
                      setPreview(await readPhoto(f));
                      setChosen('');
                      setMsg('');
                    } catch (err: any) {
                      setMsg(err.message);
                    }
                  }}
                />
                <span>عکس خودم</span>
              </label>
              <span className="photo-current">{preview ? 'عکس جدید آماده ذخیره است' : chosen ? 'از عکس‌های آماده' : 'اختیاری است'}</span>
            </div>
            <p className="photo-hint">یا از عکس‌های آماده انتخاب کن — لازم نیست خودت عکس بگذاری</p>
            <div className="preset-grid" role="listbox" aria-label="عکس‌های آماده">
              {PRESETS.map((src) => (
                <button
                  key={src}
                  type="button"
                  role="option"
                  aria-selected={chosen === src && !preview}
                  className={`preset-item${chosen === src && !preview ? ' is-on' : ''}`}
                  onClick={() => {
                    setChosen(src);
                    setPreview('');
                    setMsg('');
                  }}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="field-lab">نام نمایشی</span>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full card px-4 py-3" maxLength={40} />
          </label>
          <label className="block">
            <span className="field-lab">معرفی کوتاه</span>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full card px-4 py-3 min-h-24" maxLength={280} placeholder="مثلاً بازپرس همیشگی میز کلاسیک." />
          </label>
          <div>
            <p className="field-lab">جنسیت</p>
            <div className="gender-pick" role="radiogroup" aria-label="پسر یا دختر">
              <label className={`gender-card ${gender === 'boy' ? 'is-on' : ''}`}>
                <input type="radio" name="gender" value="boy" checked={gender === 'boy'} onChange={() => setGender('boy')} />
                <b>پسر</b>
              </label>
              <label className={`gender-card ${gender === 'girl' ? 'is-on' : ''}`}>
                <input type="radio" name="gender" value="girl" checked={gender === 'girl'} onChange={() => setGender('girl')} />
                <b>دختر</b>
              </label>
            </div>
          </div>
          {msg && <p className="text-sm text-danger">{msg}</p>}
          <button disabled={save.isPending} className="btn btn-brand w-full">{save.isPending ? 'در حال ذخیره…' : 'ذخیره پروفایل'}</button>
        </form>
      )}
      {msg && !edit && <p className="text-sm mt-3 text-center">{msg}</p>}

      <div className="card p-5 mt-4 text-center">
        <p className="text-sm text-ink-muted">کیف پول</p>
        <p className="text-3xl font-black mt-1 tabular-nums">{toman(wallet.data?.balance ?? user.wallet?.balance ?? 0)}</p>
        <Link to="/account/wallet" className="btn btn-brand w-full mt-4">شارژ و گردش حساب</Link>
      </div>
      <h2 className="mt-8 font-black">رزروهای من</h2>
      <ul className="mt-2 space-y-2">
        {(mine.data || []).map((r: any) => (
          <li key={r.id} className="card p-3">
            <p className="font-bold">{r.event?.title}</p>
            <p className="text-xs text-ink-muted">{r.paymentStatus} · {r.status} · {r.event?.startsAt ? faDay(r.event.startsAt) : ''}</p>
          </li>
        ))}
        {!mine.data?.length && <p className="text-ink-muted text-sm">هنوز رزروی نداری.</p>}
      </ul>
    </div>
  );
}
