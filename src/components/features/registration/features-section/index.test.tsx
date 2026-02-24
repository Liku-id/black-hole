import { render, screen } from '@testing-library/react';

import FeaturesSection from './index';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('FeaturesSection', () => {
  it('renders correctly', () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText('Creating together, one event at a time')).toBeInTheDocument();
    expect(screen.getByText('Seamless empowerment')).toBeInTheDocument();
    expect(screen.getByText('Clarity & support')).toBeInTheDocument();
    
    // Check for images
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });
});
