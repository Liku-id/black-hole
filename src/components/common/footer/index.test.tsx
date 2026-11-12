import { render, screen } from '@testing-library/react';

import Footer from './index';

describe('Footer', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('renders correctly with default env values', () => {
    delete process.env.NEXT_PUBLIC_WUKONG_URL;
    delete process.env.NEXT_PUBLIC_BLOG_URL;
    delete process.env.NEXT_PUBLIC_APP_VERSION;

    render(<Footer />);
    expect(screen.getByText('PT Aku Rela Kamu Bahagia')).toBeInTheDocument();
    expect(screen.getByText('EVENT TYPE')).toBeInTheDocument();
    expect(screen.getByText('ABOUT WUKONG')).toBeInTheDocument();
    expect(screen.getByText('FOLLOW US ON')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about us/i })).toHaveAttribute(
      'href',
      'https://wukong.co.id/about-us'
    );
  });

  it('uses configured NEXT_PUBLIC URLs and app version when provided', () => {
    process.env.NEXT_PUBLIC_WUKONG_URL = 'https://custom.wukong.id';
    process.env.NEXT_PUBLIC_BLOG_URL = 'https://custom.blog.id';
    process.env.NEXT_PUBLIC_APP_VERSION = '9.9.9';

    render(<Footer />);
    expect(screen.getByRole('link', { name: /about us/i })).toHaveAttribute(
      'href',
      'https://custom.wukong.id/about-us'
    );
    expect(screen.getByRole('link', { name: /blog/i })).toHaveAttribute(
      'href',
      'https://custom.blog.id'
    );
    expect(screen.getByText(/Version 9\.9\.9/)).toBeInTheDocument();
  });
});
