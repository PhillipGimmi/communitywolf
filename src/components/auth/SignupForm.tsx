'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { signUpAction } from '@/lib/supabase/server-actions';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, Shield } from 'lucide-react';

interface SignupFormProps {
  onToggleMode: () => void;
}

export function SignupForm({ onToggleMode }: Readonly<SignupFormProps>) {
  const [countryCode, setCountryCode] = useState('ZA');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength('weak');
      return;
    }
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) setPasswordStrength('weak');
    else if (score <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [password]);

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'strong': return 'text-green-500';
      default: return 'text-slate-500';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return '';
    }
  };

  // Extract nested ternary into independent function for better readability
  const getPasswordStrengthBarClasses = () => {
    if (passwordStrength === 'weak') return 'bg-red-500 w-1/3';
    if (passwordStrength === 'medium') return 'bg-yellow-500 w-2/3';
    return 'bg-green-500 w-full';
  };

  const passwordsMatch = password === confirmPassword && password.length > 0;

  return (
    <Card className="w-full max-w-sm sm:max-w-md border-gray-200 shadow-lg">
      <CardHeader className="text-center border-b border-gray-200">
        {/* Safety News Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-gray-900 rounded-2xl flex items-center justify-center mb-3">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety News</h2>
          <p className="text-gray-600 text-sm font-medium">&ldquo;Your Guardian in an Uncertain World&rdquo;</p>
        </div>
        
        <CardTitle className="text-xl sm:text-2xl text-gray-900">Create Account</CardTitle>
        <p className="text-gray-600">Join our community today</p>
      </CardHeader>
      <CardContent>
        <form action={signUpAction} className="space-y-6 sm:space-y-4" onSubmit={(e) => {
          if (!passwordsMatch || password.length < 6) {
            e.preventDefault();
            return false;
          }
        }}>
          <div className="space-y-3 sm:space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              required
              autoComplete="name"
            />
          </div>
          
          <div className="space-y-3 sm:space-y-2">
            <Label htmlFor="country">Region/Country</Label>
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger className="w-full border-slate-300 focus:border-gray-500 focus:ring-gray-500">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ZA">South Africa</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="countryCode" value={countryCode} />
          </div>
          
          <div className="space-y-3 sm:space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-3 sm:space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password (min 6 characters)"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600">Strength:</span>
                  <span className={`font-medium ${getPasswordStrengthColor()}`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthBarClasses()}`}
                  />
                </div>
              </div>
            )}
            
            <div className="text-xs text-slate-500">
              <div className="flex items-center gap-1 mb-1">
                {password.length >= 6 ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                At least 6 characters
              </div>
              <div className="flex items-center gap-1 mb-1">
                {password.length >= 8 ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                8+ characters recommended
              </div>
              <div className="flex items-center gap-1">
                {/[A-Za-z0-9]/.test(password) ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                Mix of letters and numbers
              </div>
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password match indicator */}
            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                {passwordsMatch ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Passwords match</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-600">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
            
            <div className="text-xs text-slate-500">
              Re-enter your password to confirm
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={!passwordsMatch || password.length < 6}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white border-gray-900 hover:border-gray-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed disabled:hover:bg-slate-400"
          >
            {!passwordsMatch || password.length < 6 ? 'Please fix validation errors' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-8 sm:mt-6 text-center text-base sm:text-sm text-slate-600">
          <p>Already have an account?{' '}
            <button 
              onClick={onToggleMode}
              className="text-gray-900 hover:text-gray-800 hover:underline font-medium cursor-pointer transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
