import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation, useResetPasswordMutation } from './authApi';
import { Button } from '../../components/ui/Button';
import { FieldError } from '../../components/ui/ErrorMessage';

// ── OTP expires in 15 minutes (900 seconds) ──────────────────────────────────
const OTP_SECONDS = 15 * 60;

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(initialSeconds: number, active: boolean) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (!active) return;

    // Start fresh — no synchronous setState
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const next = Math.max(initialSeconds - elapsed, 0);
      setRemaining(next);
      if (next === 0) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [active, initialSeconds]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return { remaining, formatted: `${mm}:${ss}` };
}
// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {[1, 2].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
              ${n < step ? 'bg-primary text-on-primary'
                : n === step ? 'bg-primary text-on-primary ring-4 ring-primary/20'
                  : 'bg-surface-container-highest text-on-surface-variant'}`}
          >
            {n < step
              ? <span className="material-symbols-outlined text-[16px]">check</span>
              : n}
          </div>
          <span className={`text-sm font-medium ${n === step ? 'text-on-surface' : 'text-on-surface-variant'}`}>
            {n === 1 ? 'Verify Email' : 'Reset Password'}
          </span>
          {n < 2 && (
            <div className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${step > 1 ? 'bg-primary' : 'bg-surface-container-highest'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── 6-box OTP input ───────────────────────────────────────────────────────────
interface OtpInputProps {
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
}
function OtpInput({ value, onChange, error }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i: number, raw: string) => {
    // Accept only digits; if user pastes 6 digits fill all boxes
    const digits = raw.replace(/\D/g, '');
    if (digits.length > 1) {
      const next = digits.slice(0, 6).split('');
      const filled = [...Array(6)].map((_, idx) => next[idx] ?? '');
      onChange(filled);
      refs.current[Math.min(digits.length - 1, 5)]?.focus();
      return;
    }
    const next = [...value];
    next[i] = digits.slice(-1);
    onChange(next);
    if (digits && i < 5) refs.current[i + 1]?.focus();
  };

  return (
    <div>
      <div className="flex gap-2 justify-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={value[i] ?? ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            onFocus={(e) => e.target.select()}
            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-surface-container-lowest
              outline-none transition-all duration-200 caret-primary
              ${value[i] ? 'border-primary text-primary' : 'border-surface-container-highest text-on-surface'}
              ${error ? 'border-error' : 'focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-xs text-error text-center font-medium">{error}</p>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  // Step tracking
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Step 2 state
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [otpExpired, setOtpExpired] = useState(false);
  const [success, setSuccess] = useState(false);

  // Countdown (only active in step 2)
  const { remaining, formatted: countdownLabel } = useCountdown(OTP_SECONDS, step === 2);
  useEffect(() => { if (remaining === 0 && step === 2) setOtpExpired(true); }, [remaining, step]);

  // ── Step 1: send OTP ────────────────────────────────────────────────────────
  const validateEmail = (val: string) => {
    if (!val.trim()) return 'University email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Must be a valid email address';
    const domain = val.toLowerCase().split('@')[1] ?? '';
    if (!domain.endsWith('.edu')) return 'Must be a valid university .edu email address';
    return '';
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setEmailError('');
    try {
      await forgotPassword(email).unwrap();
      setOtp(Array(6).fill(''));
      setOtpExpired(false);
      setOtpError('');
      setStep(2);
    } catch (err: unknown) {
      const apiErr = err as { status?: number; data?: { message?: string } };
      if (apiErr?.status === 404) {
        setEmailError('No account found with this email');
      } else {
        toast.error(apiErr?.data?.message ?? 'Failed to send code. Please try again.');
      }
    }
  };

  // ── Resend code (reuses step 1 logic, stays on step 2) ─────────────────────
  const handleResend = useCallback(async () => {
    try {
      await forgotPassword(email).unwrap();
      setOtp(Array(6).fill(''));
      setOtpExpired(false);
      setOtpError('');
      toast.success('A new code has been sent to your email.');
    } catch {
      toast.error('Failed to resend code. Please try again.');
    }
  }, [email, forgotPassword]);

  // ── Step 2: reset password ──────────────────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    const otpString = otp.join('');
    if (otpString.length < 6) {
      setOtpError('Please enter the full 6-digit code'); valid = false;
    } else {
      setOtpError('');
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters'); valid = false;
    } else {
      setPasswordError('');
    }

    if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match'); valid = false;
    } else {
      setConfirmError('');
    }

    if (!valid) return;

    try {
      await resetPassword({ universityEmail: email, otp: otpString, newPassword }).unwrap();
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number;
        data?: { message?: string; fieldErrors?: Record<string, string> };
      };
      const data = apiErr?.data;
      if (data?.fieldErrors) {
        if (data.fieldErrors['otp']) setOtpError(data.fieldErrors['otp']);
        if (data.fieldErrors['newPassword']) setPasswordError(data.fieldErrors['newPassword']);
      } else if (data?.message?.toLowerCase().includes('otp') || data?.message?.toLowerCase().includes('expired')) {
        setOtpError(data.message ?? 'Invalid or expired OTP');
        setOtpExpired(true);
      } else {
        toast.error(data?.message ?? 'Reset failed. Please try again.');
      }
    }
  };

  // ── Left panel (shared) ─────────────────────────────────────────────────────
  const leftPanel = (
    <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-primary via-primary to-on-primary-container flex-col items-center justify-center p-12 relative overflow-hidden gap-10">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      {/* Logo */}
      <div className="relative z-10 text-center">
        <div className="text-white/90 text-3xl font-headline font-black tracking-tighter flex items-center justify-center gap-3 mb-2">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_mall</span>
          UniShare
        </div>
        <p className="text-white/60 text-sm">For University Students</p>
      </div>
      {/* Message */}
      <div className="relative z-10 text-center">
        <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-white text-[40px]">lock_reset</span>
        </div>
        <h2 className="text-white text-2xl font-headline font-semibold leading-snug mb-3">
          Reset your password
        </h2>
        <p className="text-white/70 text-sm leading-relaxed max-w-xs">
          We'll send a one-time code to your university email. Use it to set a new password securely.
        </p>
      </div>
      {/* Steps */}
      <div className="relative z-10 flex flex-col gap-3 w-full max-w-xs">
        {[
          { icon: 'mail', label: 'Enter your .edu email' },
          { icon: 'password', label: 'Enter your 6-digit code' },
          { icon: 'check_circle', label: 'Set your new password' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3 backdrop-blur-sm">
            <span className="material-symbols-outlined text-white text-[20px]">{icon}</span>
            <span className="text-white text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>
      {/* Decorative circles */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
    </div>
  );

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex">
        {leftPanel}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-tertiary-container/20 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-on-surface mb-3">Password Reset!</h1>
            <p className="text-on-surface-variant font-body mb-6">
              Your password has been updated successfully. Redirecting you to sign in…
            </p>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-[shrink_3s_linear_forwards]" style={{ width: '100%', animation: 'width 3s linear forwards' }} />
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline mt-6 text-sm">
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex">
      {leftPanel}

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface">
        <div className="w-full max-w-md">

          {/* Back link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8 group"
          >
            <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            Back to Sign In
          </Link>

          {/* Step indicator */}
          <StepIndicator step={step} />

          {/* ── STEP 1: Email input ──────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div className="mb-8">
                <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">Forgot Password?</h1>
                <p className="text-on-surface-variant font-body">
                  Enter your university email and we'll send you a verification code.
                </p>
              </div>

              <form onSubmit={handleSendCode} noValidate className="space-y-5">
                <div>
                  <label htmlFor="uni-email" className="block text-sm font-semibold text-on-surface mb-2">
                    University Email
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-3.5 text-on-surface-variant text-[20px] pointer-events-none">school</span>
                    <input
                      id="uni-email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                      className={`us-input pl-10 ${emailError ? 'border-error focus:ring-error/20' : ''}`}
                      placeholder="your@zuj.edu.jo"
                    />
                  </div>
                  {emailError && (
                    <p className="mt-1.5 text-xs text-error font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {emailError}
                    </p>
                  )}
                </div>

                <Button
                  id="send-code-btn"
                  type="submit"
                  loading={isSending}
                  disabled={isSending}
                  className="w-full justify-center"
                  size="lg"
                  leftIcon="send"
                >
                  Send Verification Code
                </Button>
              </form>

              <div className="mt-8 p-4 bg-surface-container rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">info</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  The code will be sent to your <strong>.edu</strong> university email address and expires in <strong>15 minutes</strong>.
                </p>
              </div>
            </>
          )}

          {/* ── STEP 2: OTP + new password ───────────────────────────────── */}
          {step === 2 && (
            <>
              <div className="mb-6">
                <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">Enter Your Code</h1>
                <p className="text-on-surface-variant font-body text-sm">
                  We sent a 6-digit code to{' '}
                  <strong className="text-on-surface">{email}</strong>
                </p>
              </div>

              {/* Countdown banner */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-xl mb-6 text-sm font-medium transition-colors
                ${otpExpired
                  ? 'bg-error-container/30 text-error'
                  : remaining < 120
                    ? 'bg-error-container/20 text-error'
                    : 'bg-surface-container text-on-surface-variant'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    {otpExpired ? 'timer_off' : 'timer'}
                  </span>
                  {otpExpired ? 'Code expired' : `Code expires in ${countdownLabel}`}
                </div>
                {otpExpired && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isSending}
                    className="text-primary font-semibold hover:underline text-xs flex items-center gap-1 disabled:opacity-50"
                  >
                    {isSending && <span className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />}
                    Resend Code
                  </button>
                )}
              </div>

              <form onSubmit={handleReset} noValidate className="space-y-5">
                {/* OTP boxes */}
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-3 text-center">
                    Verification Code
                  </label>
                  <OtpInput
                    value={otp}
                    onChange={(v) => { setOtp(v); if (otpError) setOtpError(''); }}
                    error={otpError}
                  />
                </div>

                {/* New password */}
                <div>
                  <label htmlFor="new-password" className="block text-sm font-semibold text-on-surface mb-2">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                    className={`us-input ${passwordError ? 'border-error' : ''}`}
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  />
                  {passwordError && <FieldError message={passwordError} />}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-semibold text-on-surface mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (confirmError) setConfirmError(''); }}
                    className={`us-input ${confirmError ? 'border-error' : ''}`}
                    placeholder="••••••••"
                  />
                  {confirmError && <FieldError message={confirmError} />}
                </div>

                <Button
                  id="reset-password-btn"
                  type="submit"
                  loading={isResetting}
                  disabled={isResetting || otpExpired}
                  className="w-full justify-center"
                  size="lg"
                  leftIcon="lock_reset"
                >
                  Reset Password
                </Button>

                {/* Resend (always available unless expired timer shows it above) */}
                {!otpExpired && (
                  <div className="text-center">
                    <span className="text-sm text-on-surface-variant">Didn't receive the code?{' '}</span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isSending}
                      className="text-sm text-primary font-semibold hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      {isSending && <span className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />}
                      Resend Code
                    </button>
                  </div>
                )}
              </form>

              {/* Wrong email? go back */}
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(Array(6).fill('')); setOtpError(''); setOtpExpired(false); }}
                className="mt-6 w-full text-center text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                Wrong email?{' '}
                <span className="font-semibold underline underline-offset-2">Change it</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
