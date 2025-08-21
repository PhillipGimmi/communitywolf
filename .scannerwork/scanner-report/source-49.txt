'use client';

import { Card } from '@/components/ui/card';
import { SearchResult } from '@/types/safety';
import { formatDistanceToNow } from 'date-fns';

interface SearchResultsProps {
  result: SearchResult | null;
  isLoading: boolean;
}

export function SearchResults({ result, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-4 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          <div className="text-sm text-muted-foreground">
            Processing with SimpleSearchAgent and SimpleGeoAgent...
          </div>
        </div>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Safety Summary</h3>
            <span className="text-xs bg-muted px-2 py-1 rounded">
              Rule-based Analysis
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Generated {formatDistanceToNow(new Date(result.timestamp))} ago
          </p>
          <div className="prose prose-sm max-w-none">
            <p>{result.summary}</p>
          </div>
        </div>
      </Card>

      {/* News Items */}
      {result.foundItems.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Recent Crime News ({result.foundItems.length})
            </h3>
            
            <div className="space-y-3">
              {result.foundItems.map((item, index) => (
                <div 
                  key={index}
                  className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {item.title}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {item.source}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.snippet}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(item.publishedDate))} ago
                      </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Read more
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}