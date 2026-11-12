import { fireEvent, render, screen } from '@testing-library/react';

import { createMockEventOrganizer } from '@/test-utils/factories';

import { ProfileContent } from './profile-content';

jest.mock('../styles', () => ({
  AvatarBox: ({ children }: any) => <div>{children}</div>,
  ProfileMenuBox: ({ children, onClick }: any) => (
    <div onClick={onClick}>{children}</div>
  )
}));

describe('ProfileContent', () => {
  it('renders regular user with and without avatar and default role fallback', () => {
    const { rerender } = render(
      <ProfileContent
        user={
          {
            fullName: 'Test User',
            role: { name: 'admin' },
            profilePicture: { url: 'https://example.com/pic.png' }
          } as any
        }
        anchorEl={document.createElement('div')}
        onProfileMenuOpen={() => {}}
      />
    );
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByAltText('Profile Picture')).toHaveAttribute(
      'src',
      'https://example.com/pic.png'
    );

    rerender(
      <ProfileContent
        user={{ fullName: '', role: {} } as any}
        anchorEl={null}
        onProfileMenuOpen={() => {}}
      />
    );
    expect(screen.getByText('U')).toBeInTheDocument();
    expect(screen.getByText('EKUID Creative Organizer')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders event organizer with and without asset url', () => {
    const eoWithAsset = createMockEventOrganizer({
      name: 'EO With Pic',
      organizer_type: 'individual',
      asset: { id: 'a1', url: 'https://example.com/eo.png' } as any
    });

    const { rerender } = render(
      <ProfileContent
        user={eoWithAsset}
        anchorEl={null}
        onProfileMenuOpen={() => {}}
      />
    );
    expect(screen.getByText('EO With Pic')).toBeInTheDocument();
    expect(screen.getByText('Event Organizer PIC')).toBeInTheDocument();
    expect(screen.getByAltText('Profile Picture')).toHaveAttribute(
      'src',
      'https://example.com/eo.png'
    );

    const eoWithoutAsset = createMockEventOrganizer({
      name: '',
      organizer_type: 'institutional',
      asset: undefined
    });
    rerender(
      <ProfileContent
        user={eoWithoutAsset}
        anchorEl={null}
        onProfileMenuOpen={() => {}}
      />
    );
    expect(screen.getByText('U')).toBeInTheDocument();
    expect(screen.getByText('EKUID Creative Organizer')).toBeInTheDocument();
  });

  it('calls onProfileMenuOpen when user is null', () => {
    const handleOpen = jest.fn();
    render(
      <ProfileContent
        user={null}
        anchorEl={null}
        onProfileMenuOpen={handleOpen}
      />
    );
    fireEvent.click(screen.getByText('U'));
    expect(handleOpen).toHaveBeenCalled();
  });
});
