import { Navigation } from '@/components/layout/Navigation';

export default function HomePage() {
  return (
    <div>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Safety News App
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Your Guardian in an Uncertain World. Stay informed with local crime & safety alerts, 
            real-time updates, and comprehensive safety information for your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
              Get Started
            </button>
            <button className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
