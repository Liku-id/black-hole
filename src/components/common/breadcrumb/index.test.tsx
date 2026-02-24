import { render, screen } from '@testing-library/react';
import React from 'react';

import Breadcrumb from './index';

describe('Breadcrumb', () => {
  const steps = [
    { label: 'Home', active: false },
    { label: 'Profile', active: true },
  ];

  it('renders all steps', () => {
    render(<Breadcrumb steps={steps} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders separator', () => {
    render(<Breadcrumb steps={steps} />);
    // MUI Breadcrumbs uses separator, default is slash, here it is '›'
    expect(screen.getByText('›')).toBeInTheDocument();
  });
});
