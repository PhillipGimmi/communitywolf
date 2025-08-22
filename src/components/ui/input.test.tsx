import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './input';

describe('Input Component', () => {
  it('should render input with label', () => {
    render(<Input id="test" placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('should handle disabled state', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should handle different input types', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should handle value changes', () => {
    render(<Input defaultValue="initial" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('initial');
  });
});
