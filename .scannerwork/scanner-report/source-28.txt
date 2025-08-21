import { Navigation } from '@/components/layout/Navigation';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { SearchContent } from './search-content';

export default function SearchPage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <SearchContent />
      </div>
    </AuthWrapper>
  );
}
