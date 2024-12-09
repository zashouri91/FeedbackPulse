import { useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import * as authApi from '@/lib/api/auth';
import { toast } from 'sonner';

export function useAuthActions() {
  const { user } = useAuth();

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await authApi.signIn(email, password);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error('Failed to sign in');
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      await authApi.signUp(email, password);
      toast.success('Account created successfully');
    } catch (error) {
      toast.error('Failed to create account');
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await authApi.resetPassword(email);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      toast.error('Failed to send reset instructions');
      throw error;
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    try {
      await authApi.updatePassword(password);
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error('Failed to update password');
      throw error;
    }
  }, []);

  return {
    user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
}
