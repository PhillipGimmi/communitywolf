'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { updateUserProfileAction } from '@/lib/auth/secure-server-actions';
import { getUserProfileWithDetails } from '@/lib/auth/server-utils';
import { CheckCircle, AlertCircle, User, Shield, Globe, Clock } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  verified: boolean;
  last_seen_at: string | null;
  role?: {
    name: string;
    level: number;
    description: string | null;
    permissions: Record<string, unknown>;
  };
  country?: {
    name: string;
    code: string;
    timezone: string;
    emergency_number: string | null;
  };
}

interface UserProfileManagerProps {
  userId: string;
}

export function UserProfileManager({ userId }: UserProfileManagerProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
  });

  const loadProfile = useCallback(async () => {
    try {
      const profileData = await getUserProfileWithDetails(userId);
      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || '',
          phone_number: profileData.phone_number || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateUserProfileAction(userId, formData);
      
      if (result.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        await loadProfile(); // Reload profile data
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Profile update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      full_name: profile?.full_name || '',
      phone_number: profile?.phone_number || '',
    });
    setError(null);
    setSuccess(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-slate-600">Failed to load profile</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-700">{success}</span>
            </div>
          )}

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Full Name</Label>
                {isEditing ? (
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-slate-900">{profile.full_name}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Email</Label>
                <p className="mt-1 text-slate-900">{profile.email}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Phone Number</Label>
                {isEditing ? (
                  <Input
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-slate-900">{profile.phone_number || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Role
                </Label>
                <p className="mt-1 text-slate-900 capitalize">{profile.role?.name || 'User'}</p>
                <p className="text-xs text-slate-500 mt-1">{profile.role?.description}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Country
                </Label>
                <p className="mt-1 text-slate-900">{profile.country?.name}</p>
                <p className="text-xs text-slate-500 mt-1">Code: {profile.country?.code}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Last Seen
                </Label>
                <p className="mt-1 text-slate-900">
                  {profile.last_seen_at ? new Date(profile.last_seen_at).toLocaleString() : 'Never'}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Verification Status</Label>
                <div className="mt-1 flex items-center gap-2">
                  {profile.verified ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-700 text-sm">Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-700 text-sm">Pending Verification</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <ButtonLoadingSpinner />
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gray-900 hover:bg-gray-800"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
