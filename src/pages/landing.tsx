import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MailIcon,
  LockIcon,
  ArrowRightIcon,
  BarChart3Icon,
  UsersIcon,
  LineChartIcon,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LandingPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;
      toast.success('Welcome back!');
    } catch (error) {
      toast.error('Failed to sign in');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Left side - Hero section */}
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
          <div className="max-w-xl">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              FeedbackPulse
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              One-click feedback system that helps you collect and analyze customer satisfaction in
              real-time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Real-time Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track feedback instantly</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <UsersIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Team Management</h3>
                  <p className="text-sm text-muted-foreground">Organize your team</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <LineChartIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">NPS Tracking</h3>
                  <p className="text-sm text-muted-foreground">Measure satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex-1 p-8 lg:p-16 flex items-center justify-center bg-muted/30">
          <div className="w-full max-w-sm space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
              <p className="text-muted-foreground">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="pl-10"
                    placeholder="name@company.com"
                  />
                  <MailIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    className="pl-10"
                    placeholder="••••••••"
                  />
                  <LockIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full">
                Sign in
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
