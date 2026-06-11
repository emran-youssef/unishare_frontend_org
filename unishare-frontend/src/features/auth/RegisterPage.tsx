import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useRegisterMutation } from './authApi';
import { registerSchema, type RegisterFormData } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import { FieldError } from '../../components/ui/ErrorMessage';
import { Button } from '../../components/ui/Button';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const colors = ['bg-surface-container-highest', 'bg-error', 'bg-primary-container', 'bg-tertiary-container', 'bg-tertiary'];
  const labels = ['', 'Too weak', 'Weak', 'Good', 'Strong'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${i < strength ? colors[strength] : 'bg-surface-container-highest'}`} />
        ))}
      </div>
      {password && <p className={`text-xs mt-1 ${strength <= 1 ? 'text-error' : strength <= 2 ? 'text-on-surface-variant' : 'text-tertiary'}`}>{labels[strength]}</p>}
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [register, { isLoading }] = useRegisterMutation();
  const [passwordVal, setPasswordVal] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const { register: rhfReg, handleSubmit, setError, watch, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const watchedPassword = watch('password', '');
  useEffect(() => setPasswordVal(watchedPassword), [watchedPassword]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register({
        fullName:        data.fullName,
        universityEmail: data.universityEmail,
        password:        data.password,
        phone:           data.phone,
      }).unwrap();
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string; fieldErrors?: Record<string, string> } };
      if (apiErr?.data?.fieldErrors) {
        Object.entries(apiErr.data.fieldErrors).forEach(([field, msg]) => {
          setError(field as keyof RegisterFormData, { message: msg });
        });
      } else {
        toast.error(apiErr?.data?.message ?? 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-primary via-primary to-primary-container flex-col items-center justify-center p-12 relative overflow-hidden gap-8">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Logo */}
        <div className="relative z-10 text-center">
          <div className="text-white/90 text-3xl font-headline font-black tracking-tighter flex items-center justify-center gap-3 mb-1">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_mall</span>
            UniShare
          </div>
          <p className="text-white/60 text-sm">For ZUJ Students Only</p>
        </div>
        {/* Headline */}
        <div className="relative z-10 text-center">
          <h2 className="text-white text-3xl font-headline font-bold leading-tight">
            Join ZUJ's<br />rental community
          </h2>
        </div>
        {/* Trust points */}
        <div className="relative z-10 space-y-4">
          {[
            { icon: 'school',            text: 'Exclusive to @std-zuj.edu.jo holders'   },
            { icon: 'lock',              text: 'Safe, ZUJ student-verified transactions' },
            { icon: 'currency_exchange', text: 'Earn from items you already own'         },
            { icon: 'handshake',         text: 'Pre-approved ZUJ campus meetup spots'    },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[18px]">{icon}</span>
              </div>
              <p className="text-white text-sm font-medium">{text}</p>
            </div>
          ))}
        </div>
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute -top-10 -left-10 w-36 h-36 bg-white/5 rounded-full" />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="mb-5 text-center">
            <h1 className="font-headline text-3xl font-bold text-tertiary">Join UniShare</h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/80 p-6 shadow-card backdrop-blur-sm"
            noValidate
          >
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Full Name</label>
              <input {...rhfReg('fullName')} type="text" className="us-input" placeholder="Ahmed Khalil" />
              <FieldError message={errors.fullName?.message} />
            </div>

            {/* University Email */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                University Email
                <span className="ml-1 text-secondary text-xs font-normal">@std-zuj.edu.jo required</span>
              </label>
              <input {...rhfReg('universityEmail')} type="email" className="us-input" placeholder="your@std-zuj.edu.jo" />
              <FieldError message={errors.universityEmail?.message} />
            </div>

            {/* Phone (optional) */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Phone <span className="text-on-surface-variant font-normal text-xs">optional</span>
              </label>
              <input {...rhfReg('phone')} type="tel" className="us-input" placeholder="+962 7X XXX XXXX" />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Password</label>
              <input {...rhfReg('password')} type="password" className="us-input" placeholder="Min. 8 characters" />
              <PasswordStrength password={passwordVal} />
              <FieldError message={errors.password?.message} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Confirm Password</label>
              <input {...rhfReg('confirmPassword')} type="password" className="us-input" placeholder="••••••••" />
              <FieldError message={errors.confirmPassword?.message} />
            </div>

            <Button type="submit" loading={isLoading} className="w-full justify-center" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
