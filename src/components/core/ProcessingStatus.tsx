'use client';

import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';

interface ProcessingStep {
  name: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  description: string;
}

interface ProcessingStatusProps {
  isActive: boolean;
}

export function ProcessingStatus({ isActive }: ProcessingStatusProps) {
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { name: 'SearchAgent', status: 'pending', description: 'Searching for crime news' },
    { name: 'News Filtering', status: 'pending', description: 'Filtering crime-related content' },
    { name: 'GeoAgent', status: 'pending', description: 'Extracting locations and geocoding' },
    { name: 'Classification', status: 'pending', description: 'Classifying crime types and severity' },
    { name: 'JSON Generation', status: 'pending', description: 'Saving to results file' }
  ]);

  useEffect(() => {
    if (!isActive) {
      setSteps(prevSteps => prevSteps.map(step => ({ ...step, status: 'pending' })));
      return;
    }

    // Simulate processing steps
    const updateStep = (index: number, status: ProcessingStep['status']) => {
      setSteps(prev => prev.map((step, i) => 
        i === index ? { ...step, status } : step
      ));
    };

    const sequence = async () => {
      // Step 1: SearchAgent
      updateStep(0, 'active');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStep(0, 'complete');
      
      // Step 2: Filtering
      updateStep(1, 'active');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStep(1, 'complete');
      
      // Step 3: GeoAgent
      updateStep(2, 'active');
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateStep(2, 'complete');
      
      // Step 4: Classification
      updateStep(3, 'active');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStep(3, 'complete');
      
      // Step 5: JSON Generation
      updateStep(4, 'active');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStep(4, 'complete');
    };

    sequence();
  }, [isActive]);

  if (!isActive) return null;

  const getStatusIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'active': return '🔄';
      case 'complete': return '✅';
      case 'error': return '❌';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Agent Processing</h3>
        
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-lg">{getStatusIcon(step.status)}</span>
              <div className="flex-1">
                <div className="font-medium text-sm">{step.name}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
              {step.status === 'active' && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}