import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label Component', () => {
  it('should render label with children', () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Label className="custom-label">Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveClass('custom-label');
  });

  it('should associate with form control', () => {
    render(
      <div>
        <Label htmlFor="input-id">Input Label</Label>
        <input id="input-id" />
      </div>
    );
    const label = screen.getByText('Input Label');
    const input = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', 'input-id');
    expect(input).toHaveAttribute('id', 'input-id');
  });

  it('should handle accessibility attributes', () => {
    render(<Label aria-label="Accessible label">Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveAttribute('aria-label', 'Accessible label');
  });
});
