import { render, screen } from '@testing-library/react';
import React from 'react';

import StripeText from './index';

describe('StripeText', () => {
  it('renders default texts', () => {
    render(<StripeText />);
    expect(screen.getAllByText("Let's collaborate").length).toBeGreaterThan(0);
  });
});
