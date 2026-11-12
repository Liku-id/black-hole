import { fireEvent, render, screen } from '@testing-library/react';

import { ProfileMenu } from './profile-menu';

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush })
}));

jest.mock('../styles', () => ({
  StyledMenu: ({ children, open }: any) =>
    open ? <div>{children}</div> : null,
  StyledMenuItemOption: ({ children, onClick }: any) => (
    <div onClick={onClick}>{children}</div>
  ),
  MenuDivider: () => <hr />,
  StyledListItemIcon: ({ children }: any) => <span>{children}</span>
}));

describe('ProfileMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render menu items when anchorEl is null', () => {
    render(
      <ProfileMenu anchorEl={null} onClose={() => {}} onLogout={() => {}} />
    );
    expect(screen.queryByText('Privacy Policy')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('renders menu items when open', () => {
    render(
      <ProfileMenu
        anchorEl={document.createElement('div')}
        onClose={() => {}}
        onLogout={() => {}}
      />
    );
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('navigates to privacy policy and terms & conditions and handles image onError', () => {
    const onClose = jest.fn();

    render(
      <ProfileMenu
        anchorEl={document.createElement('div')}
        onClose={onClose}
        onLogout={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Privacy Policy'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/dashboard/privacy-policy');

    fireEvent.click(screen.getByText('Terms & Condition'));
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(mockPush).toHaveBeenCalledWith('/dashboard/term-and-condition');

    const images = screen.getAllByRole('img');
    images.forEach((img) => {
      fireEvent.error(img);
      expect(img.style.display).toBe('none');
    });
  });

  it('calls onLogout', () => {
    const handleLogout = jest.fn();
    render(
      <ProfileMenu
        anchorEl={document.createElement('div')}
        onClose={() => {}}
        onLogout={handleLogout}
      />
    );
    fireEvent.click(screen.getByText('Logout'));
    expect(handleLogout).toHaveBeenCalled();
  });
});
