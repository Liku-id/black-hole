import { render, screen } from '@testing-library/react';

import StripeText from './index';

describe('StripeText', () => {
  it('renders vertical default (bottom-to-top) and top-to-bottom directions', () => {
    const { rerender } = render(<StripeText />);
    expect(screen.getAllByText("Let's collaborate").length).toBeGreaterThan(0);

    rerender(
      <StripeText direction="vertical" scrollDirection="top-to-bottom" />
    );
    expect(screen.getAllByText("Let's create").length).toBeGreaterThan(0);
  });

  it('renders horizontal right-to-left (default) and left-to-right directions', () => {
    const { rerender } = render(<StripeText direction="horizontal" />);
    expect(screen.getAllByText("Let's connect").length).toBeGreaterThan(0);

    rerender(
      <StripeText direction="horizontal" scrollDirection="left-to-right" />
    );
    expect(screen.getAllByText('Have fun').length).toBeGreaterThan(0);
  });
});
