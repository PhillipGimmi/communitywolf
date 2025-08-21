'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Check Your Email
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            We&apos;ve sent you a confirmation link
          </p>
        </div>

        <Card className="bg-white shadow-xl rounded-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-sky-600 rounded-2xl flex items-center justify-center mb-3">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl text-slate-800">Confirm Your Signup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {email && (
              <div className="text-center">
                                        <p className="text-sm text-slate-600 mb-2">
                          We&apos;ve sent a confirmation link to:
                        </p>
                <p className="font-medium text-slate-800 text-lg">{email}</p>
              </div>
            )}

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-slate-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Click the link in your email to confirm your account</span>
              </div>
              
              <p className="text-sm text-slate-500">
                Once confirmed, you can sign in to your account.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-slate-500">
          <p>Didn&apos;t receive the email? Check your spam folder.</p>
        </div>
      </div>
    </div>
  );
}
