import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ProfileContent } from './profile-content';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

jest.mock('../styles', () => ({
  AvatarBox: ({ children }: any) => <div>{children}</div>,
  ProfileMenuBox: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>
}));

describe('ProfileContent', () => {
  it('renders user info', () => {
    const user = { fullName: 'Test User', role: { name: 'admin' } };
    render(
      <ProfileContent
        user={user as any}
        anchorEl={null}
        onProfileMenuOpen={() => {}}
      />
    );
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('calls onProfileMenuOpen', () => {
    const handleOpen = jest.fn();
    render(
      <ProfileContent
        user={null}
        anchorEl={null}
        onProfileMenuOpen={handleOpen}
      />
    );
    // ProfileMenuBox has click handler
    fireEvent.click(screen.getByText('U')); // Initial
    expect(handleOpen).toHaveBeenCalled();
  });
});
