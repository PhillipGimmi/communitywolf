import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button Component', () => {
  it('should render button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should render button with variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveClass('bg-destructive');
  });

  it('should render button with size classes', () => {
    render(<Button size="lg">Large Button</Button>);
    const button = screen.getByRole('button', { name: 'Large Button' });
    expect(button).toHaveClass('h-10');
  });

  it('should handle disabled state', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable Button</Button>);
    
    const button = screen.getByRole('button', { name: 'Clickable Button' });
    button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const button = screen.getByRole('button', { name: 'Custom Button' });
    expect(button).toHaveClass('custom-class');
  });
});
