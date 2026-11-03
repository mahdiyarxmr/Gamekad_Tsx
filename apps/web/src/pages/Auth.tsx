import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import BrandLogo from '../components/BrandLogo';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

const loginSchema = z.object({
  username: z.string().min(1, 'نام کاربری یا ایمیل لازم است'),
  password: z.string().min(1, 'رمز لازم است'),
});
const registerSchema = z
  .object({
    username: z.string().min(3, 'نام کاربری حداقل ۳ کاراکتر انگلیسی است'),
    email: z.string().email('ایمیل نامعتبر است'),
    displayName: z.string().min(2, 'نام نمایشی لازم است'),
    gender: z.string().refine((g) => g === 'boy' || g === 'girl', 'حتماً پسر یا دختر را انتخاب کن'),
    password: z.string().min(8, 'رمز حداقل ۸ کار است'),
    confirm: z.string().min(8, 'تکرار رمز لازم است'),
  })
  .refine((d) => d.password === d.confirm, { message: 'دو رمز یکی نیستند', path: ['confirm'] });

function SecretField({
  placeholder,
  autoComplete,
  error,
  inputProps,
}: {
  placeholder: string;
  autoComplete: string;
  error?: string;
  inputProps: ReturnType<ReturnType<typeof useForm>['register']>;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="pass-wrap">
        <input
          {...inputProps}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full card px-4 py-3"
        />
        <button
          type="button"
          className="pass-eye"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'پنهان کردن رمز' : 'نمایش رمز'}
          aria-pressed={show}
        >
          {show ? <Eye size={20} strokeWidth={2.2} /> : <EyeOff size={20} strokeWidth={2.2} />}
        </button>
      </div>
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function Auth() {
  const isReg = useLocation().pathname === '/register';
  const { user, login, logout } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState('');
  const [remember, setRemember] = useState(true);
  const form = useForm({
    resolver: zodResolver(isReg ? registerSchema : loginSchema) as any,
    defaultValues: { username: '', password: '', email: '', displayName: '', gender: '', confirm: '' },
  });
  const gender = form.watch('gender');
  const errors = form.formState.errors as Record<string, { message?: string }>;

  async function onSubmit(values: any) {
    setErr('');
    try {
      const payload = isReg
        ? {
            username: values.username,
            email: values.email,
            displayName: values.displayName,
            gender: values.gender,
            password: values.password,
            confirm: values.confirm,
          }
        : { username: values.username, password: values.password };
      const data = await api(isReg ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      login(data.user, data.accessToken, data.refreshToken, isReg ? true : remember);
      nav('/account');
    } catch (ex: any) {
      setErr(ex.message);
    }
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="card auth-box text-center">
          <BrandLogo variant="emblem" className="h-14 w-14 mx-auto rounded-full object-cover" />
          <h1 className="text-2xl font-black mt-4">داخل حساب هستی</h1>
          <p className="text-sm text-ink-muted mt-2">{user.displayName} · @{user.username}</p>
          <Link to="/account" className="btn btn-brand w-full mt-6">حساب من</Link>
          <button type="button" className="btn btn-ghost w-full mt-2" onClick={() => { logout(); }}>
            خروج
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="card auth-box">
        <div className="text-center mb-6">
          <BrandLogo variant="emblem" className="h-14 w-14 mx-auto rounded-full object-cover" />
          <p className="text-xs font-bold text-brand-dark mt-3">{isReg ? 'PROFILE' : 'ENTER'}</p>
          <h1 className="text-2xl font-black mt-1">{isReg ? 'ساخت پروفایل بازیکن' : 'ورود به رکاد'}</h1>
          {isReg && (
            <p className="text-sm text-ink-muted mt-2 leading-6">
              نام کاربری انگلیسی است؛ بقیه را فارسی بنویس. جنسیت را باید بین پسر و دختر انتخاب کنی.
            </p>
          )}
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" noValidate>
          {isReg && (
            <Field label="نام نمایشی" error={errors.displayName?.message}>
              <input {...form.register('displayName')} placeholder="مثلاً آرین کاظمی" autoComplete="name" className="w-full card px-4 py-3" />
            </Field>
          )}
          <Field label={isReg ? 'نام کاربری' : 'نام کاربری یا ایمیل'} error={errors.username?.message}>
            <input
              {...form.register('username')}
              placeholder={isReg ? 'مثلاً arian' : 'arian یا ایمیل'}
              autoComplete="username"
              dir="ltr"
              className="w-full card px-4 py-3"
            />
          </Field>
          {isReg && (
            <Field label="ایمیل" error={errors.email?.message}>
              <input {...form.register('email')} type="email" placeholder="مثلاً arian@rokad.ir" autoComplete="email" dir="ltr" className="w-full card px-4 py-3" />
            </Field>
          )}
          {isReg && (
            <div>
              <p className="field-lab">پسر هستی یا دختر؟</p>
              <div className="gender-pick" role="radiogroup" aria-label="پسر یا دختر">
                <label className={`gender-card ${gender === 'boy' ? 'is-on' : ''}`}>
                  <input type="radio" value="boy" {...form.register('gender')} />
                  <b>پسر</b>
                </label>
                <label className={`gender-card ${gender === 'girl' ? 'is-on' : ''}`}>
                  <input type="radio" value="girl" {...form.register('gender')} />
                  <b>دختر</b>
                </label>
              </div>
              {errors.gender?.message && <p className="text-danger text-xs mt-1">{errors.gender.message}</p>}
            </div>
          )}
          <Field label="رمز عبور" error={errors.password?.message}>
            <SecretField
              placeholder="رمز عبور خود را وارد کنید"
              autoComplete={isReg ? 'new-password' : 'current-password'}
              inputProps={form.register('password')}
            />
          </Field>
          {isReg && (
            <Field label="تکرار رمز" error={errors.confirm?.message}>
              <SecretField
                placeholder="تکرار رمز"
                autoComplete="new-password"
                inputProps={form.register('confirm')}
              />
            </Field>
          )}
          {!isReg && (
            <label className="flex items-center gap-2 min-h-11 cursor-pointer select-none text-sm font-bold">
              <input
                type="checkbox"
                className="size-4 accent-[#58bdaf]"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              مرا به خاطر بسپار
            </label>
          )}
          {err && <p className="text-danger text-sm font-bold">{err}</p>}
          <button disabled={form.formState.isSubmitting} className="btn btn-night w-full">
            {form.formState.isSubmitting ? 'صبر کن…' : isReg ? 'ساخت پروفایل' : 'ورود'}
          </button>
        </form>
        <p className="mt-5 text-sm text-ink-muted text-center">
          {isReg ? (
            <>
              حساب داری؟ <Link to="/login" className="text-brand-dark font-bold">ورود</Link>
            </>
          ) : (
            <>
              حساب نداری؟ <Link to="/register" className="text-brand-dark font-bold">پروفایل بساز</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="field-lab">{label}</span>
      {children}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </label>
  );
}
