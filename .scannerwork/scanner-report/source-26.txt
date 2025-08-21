import { Navigation } from '@/components/layout/Navigation';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { ProfileContent } from './profile-content';

export default function ProfilePage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <ProfileContent />
      </div>
    </AuthWrapper>
  );
}
