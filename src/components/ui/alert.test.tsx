import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertDescription, AlertTitle } from './alert';

describe('Alert Components', () => {
  describe('Alert', () => {
    it('should render alert with children', () => {
      render(<Alert>Alert message</Alert>);
      expect(screen.getByText('Alert message')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Alert className="custom-alert">Alert</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-alert');
    });

    it('should have alert role', () => {
      render(<Alert>Alert</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('AlertTitle', () => {
    it('should render alert title', () => {
      render(<AlertTitle>Alert Title</AlertTitle>);
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
    });
  });

  describe('AlertDescription', () => {
    it('should render alert description', () => {
      render(<AlertDescription>Alert description</AlertDescription>);
      expect(screen.getByText('Alert description')).toBeInTheDocument();
    });
  });

  describe('Alert with title and description', () => {
    it('should render complete alert structure', () => {
      render(
        <Alert>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>
      );
      
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});
