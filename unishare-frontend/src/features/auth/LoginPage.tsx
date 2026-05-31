import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLoginMutation } from './authApi';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from './authSlice';
import { loginSchema, type LoginFormData } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';
import { FieldError } from '../../components/ui/ErrorMessage';
import { Button } from '../../components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isAdmin } = useAuth();
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (isAuthenticated) navigate(isAdmin ? '/admin' : '/', { replace: true });
  }, [isAuthenticated, isAdmin, navigate]);

  const { register, handleSubmit, setError, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));
      toast.success(`Welcome back, ${result.user.fullName.split(' ')[0]}!`);
      navigate(result.user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string; fieldErrors?: Record<string, string> } };
      if (apiErr?.data?.fieldErrors) {
        Object.entries(apiErr.data.fieldErrors).forEach(([field, msg]) => {
          setError(field as keyof LoginFormData, { message: msg });
        });
      } else {
        toast.error(apiErr?.data?.message ?? 'Invalid email or password');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex">
      {/* Left panel — branding */}
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
          <p className="text-white/60 text-sm">For ZUJ Students Only</p>
        </div>
        {/* Quote */}
        <div className="relative z-10 text-center">
          <blockquote className="text-white text-2xl font-headline font-semibold leading-snug">
            "Rent what you need.<br />Share what you have.<br />Build community."
          </blockquote>
        </div>
        {/* Stats */}
        <div className="relative z-10 flex flex-col gap-3">
          {[
            { icon: 'school',      label: '8,000+ Students' },
            { icon: 'verified',    label: 'ZUJ Verified'    },
            { icon: 'location_on', label: 'Amman, Jordan'   },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3 backdrop-blur-sm">
              <span className="material-symbols-outlined text-white text-[22px]">{icon}</span>
              <span className="text-white text-sm font-semibold">{label}</span>
            </div>
          ))}
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">Welcome back</h1>
            <p className="text-on-surface-variant font-body">Sign in to your UniShare account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Email address</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="us-input"
                placeholder="your@zuj.edu.jo"
              />
              <FieldError message={errors.email?.message} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Password</label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="us-input"
                placeholder="••••••••"
              />
              <FieldError message={errors.password?.message} />
              <div className="flex justify-end mt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button type="submit" loading={isLoading} className="w-full justify-center" size="lg">
              Sign in to UniShare
            </Button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          {/* Verified badge note */}
          <div className="mt-8 p-4 bg-surface-container rounded-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">verified</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              UniShare is exclusively for Al-Zaytoonah University students. A verified <strong>@zuj.edu.jo</strong> email is required to register.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
