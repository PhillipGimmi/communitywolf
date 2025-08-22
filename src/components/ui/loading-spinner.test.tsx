import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './loading-spinner';

describe('LoadingSpinner Component', () => {
  it('should render loading spinner', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<LoadingSpinner className="custom-spinner" />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('custom-spinner');
  });

  it('should render with text when provided', () => {
    render(<LoadingSpinner text="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('should handle different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = screen.getByTestId('loading-spinner');
    let spinnerElement = spinner.querySelector('div');
    expect(spinnerElement).toHaveClass('w-4', 'h-4');

    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByTestId('loading-spinner');
    spinnerElement = spinner.querySelector('div');
    expect(spinnerElement).toHaveClass('w-8', 'h-8');
  });
});
