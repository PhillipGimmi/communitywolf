import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Card className="custom-card">Content</Card>);
      const card = screen.getByText('Content').closest('div');
      expect(card).toHaveClass('custom-card');
    });
  });

  describe('CardHeader', () => {
    it('should render header with children', () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('should render title with children', () => {
      render(<CardTitle>Card Title</CardTitle>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });
  });

  describe('CardDescription', () => {
    it('should render description with children', () => {
      render(<CardDescription>Card description</CardDescription>);
      expect(screen.getByText('Card description')).toBeInTheDocument();
    });
  });

  describe('CardContent', () => {
    it('should render content with children', () => {
      render(<CardContent>Main content</CardContent>);
      expect(screen.getByText('Main content')).toBeInTheDocument();
    });
  });

  describe('CardFooter', () => {
    it('should render footer with children', () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });
  });
});
