'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Shield } from 'lucide-react';
import { useAuthStore } from '@/lib/auth/auth-store';

export function ProfileContent() {
  const { user } = useAuthStore();
  
  if (!user) return null;

  return (
    <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>

        {/* Profile Information */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your personal account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name</Label>
                  <Input
                    id="fullName"
                    value={user.user_metadata && typeof user.user_metadata === 'object' && 'full_name' in user.user_metadata ? String(user.user_metadata.full_name) : 'Not provided'}
                    readOnly
                    className="mt-1 border-gray-200 bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                  <Input
                    id="email"
                    value={user.email ?? 'Not provided'}
                    readOnly
                    className="mt-1 border-gray-200 bg-gray-50"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="country" className="text-gray-700 font-medium">Country</Label>
                  <Input
                    id="country"
                    value={user.user_metadata && typeof user.user_metadata === 'object' && 'country_code' in user.user_metadata ? String(user.user_metadata.country_code) : 'Not provided'}
                    readOnly
                    className="mt-1 border-gray-200 bg-gray-50"
                  />
                </div>
                                  <div>
                    <Label htmlFor="joined" className="text-gray-700 font-medium">Member Since</Label>
                    <Input
                      id="joined"
                      value="Account created"
                      readOnly
                      className="mt-1 border-gray-200 bg-gray-50"
                    />
                  </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Account Status
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your account verification and role information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Account Active</span>
              </div>
              <Badge variant="outline" className="border-gray-200 text-gray-700">
                Verified User
              </Badge>
            </div>
          </CardContent>
        </Card>

     
      </div>
    </main>
  );
}
