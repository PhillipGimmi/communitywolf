'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle, Download } from 'lucide-react';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export function SafetySearchForm() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');
    setResults([]);
    setSummary('');

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results ?? []);
      setSummary(data.summary ?? '');
    } catch {
      setError('Failed to search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Any crime or public safety news in your area?"
            className="flex-1 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
            disabled={isLoading}
          />
          <Button 
            type="submit"
            disabled={isLoading?? !query.trim()}
            className="bg-sky-600 hover:bg-sky-700 text-white border-sky-600 hover:border-sky-700 px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Results Summary */}
      {summary && (
        <Card className="border-sky-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-sky-800">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={summary}
              readOnly
              className="min-h-[100px] resize-none border-slate-200"
              placeholder="Search results summary will appear here..."
            />
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <Card className="border-sky-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-sky-800">Found Items</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/api/results', '_blank')}
                className="text-sky-600 border-sky-200 hover:bg-sky-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Latest JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result) => (
                <div key={`${result.title}-${result.url}`} className="p-3 border border-slate-200 rounded-md">
                  <h4 className="font-medium text-slate-800 mb-1">{result.title}</h4>
                  <p className="text-sm text-slate-600 mb-2">{result.snippet}</p>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sky-600 hover:text-sky-700 underline"
                  >
                    View Source
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
