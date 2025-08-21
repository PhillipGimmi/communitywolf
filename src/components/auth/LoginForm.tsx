'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="w-full max-w-sm sm:max-w-md border-gray-200 shadow-lg">
      <CardHeader className="text-center border-b border-gray-200">
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

        <CardTitle className="text-xl sm:text-2xl text-gray-900">Welcome Back</CardTitle>
        <p className="text-gray-600">Sign in to your account to continue</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
          className="w-full bg-gray-900 hover:bg-gray-800 text-white border border-gray-900 transition-colors"
        >
          Sign In
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <a href="/auth/signup" className="text-gray-900 hover:text-gray-700 hover:underline font-medium cursor-pointer transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
