import { render, screen } from '@testing-library/react';
import RegistrationContent from './index';

describe('RegistrationContent', () => {
  it('renders default steps correctly', () => {
    render(<RegistrationContent />);
    
    expect(screen.getByText('Imagine & define your gathering')).toBeInTheDocument();
    expect(screen.getByText('Guide, celebrate, reflect')).toBeInTheDocument();
    expect(screen.getByText('publish & open doors')).toBeInTheDocument();
    expect(screen.getByText('Connect & invite')).toBeInTheDocument();
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders custom steps correctly', () => {
    const customSteps = [
      { number: '1', title: 'Step 1', description: 'Desc 1' },
      { number: '2', title: 'Step 2', description: 'Desc 2' },
    ];
    
    render(<RegistrationContent steps={customSteps} />);
    
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Desc 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });
});
