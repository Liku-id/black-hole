import { render, screen } from '@testing-library/react';
import React from 'react';

import Footer from './index';

describe('Footer', () => {
  it('renders correctly', () => {
    render(<Footer />);
    // Check key parts
    expect(screen.getByText('PT Aku Rela Kamu Bahagia')).toBeInTheDocument();
    expect(screen.getByText('EVENT TYPE')).toBeInTheDocument();
    expect(screen.getByText('ABOUT WUKONG')).toBeInTheDocument();
    expect(screen.getByText('FOLLOW US ON')).toBeInTheDocument();
  });

  it('contains proper links', () => {
    render(<Footer />);
    const aboutLink = screen.getByRole('link', { name: /about us/i });
    expect(aboutLink).toHaveAttribute('href');
  });
});
