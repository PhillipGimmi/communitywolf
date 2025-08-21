'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { secureSignInAction } from '@/lib/auth/secure-server-actions';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export function SecureLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Card className="w-full max-w-sm sm:max-w-md border-gray-200 shadow-lg">
      <CardContent>
        {/* Safety News Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-gray-900 rounded-2xl flex items-center justify-center mb-3">
            <svg 
              className="w-10 h-10 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety News</h2>
          <p className="text-gray-600 text-sm font-medium">&ldquo;Your Guardian in an Uncertain World&rdquo;</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <form 
          action={async (formData: FormData) => {
            setIsLoading(true);
            setError(null);
            
            try {
              const result = await secureSignInAction(formData);
              
              if (result.success && result.redirectTo) {
                // Redirect to dashboard on success
                window.location.href = result.redirectTo;
              } else if (result.error) {
                setError(result.error);
                setIsLoading(false);
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Login failed');
              setIsLoading(false);
            }
          }}
          className="space-y-4 sm:space-y-6" 
          noValidate
        >
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              autoComplete="email"
              disabled={isLoading}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isLoading}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white border border-gray-900"
          >
            {isLoading ? (
              <>
                <ButtonLoadingSpinner size="sm" />
                <span className="ml-2">Signing in...</span>
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}