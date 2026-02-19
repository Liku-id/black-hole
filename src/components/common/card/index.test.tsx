import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from './index';

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <div>Test Content</div>
      </Card>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('passes other props to the root element', () => {
    render(
      <Card data-testid="custom-card">
        <div>Content</div>
      </Card>
    );
    expect(screen.getByTestId('custom-card')).toBeInTheDocument();
  });
});
