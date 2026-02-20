import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dropzone } from './index';

describe('Dropzone', () => {
  it('renders upload prompt', () => {
    render(<Dropzone />);
    expect(screen.getByText(/Click or drag file/i)).toBeInTheDocument();
  });

  it('displays existing file', () => {
    const url = 'https://example.com/image.jpg';
    render(<Dropzone existingFileUrl={url} />);
    const img = screen.getByRole('img', { name: /preview/i });
    expect(img).toHaveAttribute('src');
    // next/image might change src, but we check presence
  });
});
