'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { secureSignUpAction } from '@/lib/auth/secure-server-actions';
import { validatePasswordStrength } from '@/lib/auth/auth-utils';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle, Shield } from 'lucide-react';

export function SecureSignupForm() {
  const [countryCode, setCountryCode] = useState('ZA');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password validation
  const passwordValidation = validatePasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  
  // Form validation
  const hasFullName = fullName.trim().length >= 2;
  const hasEmail = email.trim().length > 0;
  const hasCountry = countryCode && countryCode.length === 2;
  const hasPassword = password.length >= 8;
  const hasConfirmPassword = confirmPassword.length > 0;
  
  // Password requirements
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasMinLength = password.length >= 8;
  
  const passwordMeetsAllRequirements = hasUppercase && hasLowercase && hasNumber && hasSpecial && hasMinLength;
  
  const isFormValid = hasFullName && hasEmail && hasCountry && hasPassword && hasConfirmPassword && 
                     passwordMeetsAllRequirements && passwordsMatch;

  const getPasswordStrengthColor = () => {
    if (passwordValidation.score <= 2) return 'text-red-500';
    if (passwordValidation.score <= 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordValidation.score <= 2) return 'Weak';
    if (passwordValidation.score <= 4) return 'Medium';
    return 'Strong';
  };

  const handleFormSubmit = async (formData: FormData) => {
    console.log('Form submission started');
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    // Debug form data
    console.log('Form data entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    try {
      console.log('Calling secureSignUpAction...');
      const result = await secureSignUpAction(formData);
      
              if (result.success) {
          if (result.redirectTo) {
            // Redirect to check email page
            window.location.href = result.redirectTo;
          } else {
            setSuccess('Account created successfully! Please check your email.');
          }
        } else {
          if (result.rateLimited) {
            // Rate limited - show special message
            const errorMsg = result.error || 'Too many attempts. Please wait before trying again.';
            console.log('Setting rate limited error:', errorMsg);
            setError(errorMsg);
            console.log('Rate limited error displayed');
          } else {
            const errorMsg = result.error || 'Signup failed';
            console.log('Setting general error:', errorMsg);
            setError(errorMsg);
            console.log('General error displayed:', result.error);
          }
          setIsLoading(false);
        }
    } catch (err) {
      console.error('Signup error caught:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-md border-gray-200 shadow-lg">
      <CardContent>
        {/* Safety News Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-gray-900 rounded-2xl flex items-center justify-center mb-3">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety News</h2>
          <p className="text-gray-600 text-sm font-medium">&ldquo;Your Guardian in an Uncertain World&rdquo;</p>
        </div>

        {/* Error Message */}
        {error && !error.includes('already registered') && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Full Screen Email Exists Popup */}
        {error && error.includes('already registered') && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md mx-4 text-center border border-gray-200 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in-95 duration-500 delay-200">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 animate-in fade-in-up duration-500 delay-300">Email Already Registered</h3>
              <p className="text-gray-600 mb-6 animate-in fade-in-up duration-500 delay-400">This email address is already in use. Please sign in to your existing account.</p>
              <div className="flex gap-3 animate-in fade-in-up duration-500 delay-500">
                <Button
                  type="button"
                  onClick={() => window.location.href = '/auth/login'}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-md transition-all duration-200 hover:scale-105"
                >
                  Go to Login
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setError(null)}
                  className="flex-1 px-4 py-3 transition-all duration-200 hover:scale-105"
                >
                  Try Different Email
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-700">{success}</span>
          </div>
        )}



        <form 
          action={handleFormSubmit}
          className="space-y-4 sm:space-y-6" 
          noValidate
        >
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              required
              autoComplete="name"
              disabled={isLoading}
              className="w-full"
              minLength={2}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {fullName.length > 0 && !hasFullName && (
              <p className="text-xs text-red-600">Full name must be at least 2 characters</p>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {email.length > 0 && !hasEmail && (
              <p className="text-xs text-red-600">Please enter a valid email</p>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="countryCode" className="text-sm font-medium text-gray-700">
              Country <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Select value={countryCode} onValueChange={setCountryCode} disabled={isLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="ZA">South Africa</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="countryCode" value={countryCode} />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" aria-hidden="true" />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Password strength:</span>
                  <span className={`font-medium ${getPasswordStrengthColor()}`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordValidation.score <= 2 ? 'bg-red-500' :
                      passwordValidation.score <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(passwordValidation.score / 6) * 100}%` }}
                  />
                </div>
                
                {/* Individual Requirements Check */}
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div className={`flex items-center gap-1 ${hasMinLength ? 'text-green-700' : 'text-red-600'}`}>
                    {hasMinLength ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasUppercase ? 'text-green-700' : 'text-red-600'}`}>
                    {hasUppercase ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                    <span>One uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasLowercase ? 'text-green-700' : 'text-red-600'}`}>
                    {hasLowercase ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                    <span>One lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasNumber ? 'text-green-700' : 'text-red-600'}`}>
                    {hasNumber ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                    <span>One number</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasSpecial ? 'text-green-700' : 'text-red-600'}`}>
                    {hasSpecial ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                    <span>One special character</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm Password <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" aria-hidden="true" />
                )}
              </button>
            </div>
            
            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="mt-2 flex items-center gap-2">
                {passwordsMatch ? (
                  <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
                )}
                <span className={`text-sm ${passwordsMatch ? 'text-green-700' : 'text-red-700'}`}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className={`w-full py-3 px-4 rounded-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
              isLoading 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-gray-900 hover:bg-gray-800 active:bg-gray-700 hover:shadow-lg'
            } text-white disabled:opacity-50`}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span className="font-medium">Processing...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </Button>

          {/* Form Status */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 text-center">
              {!isFormValid && 'Please complete all required fields'}
              {isFormValid && !isLoading && 'Ready to submit'}
              {isLoading && 'Creating account...'}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}