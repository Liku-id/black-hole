import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileMenu } from './profile-menu';

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush })
}));

jest.mock('../styles', () => ({
  StyledMenu: ({ children, open }: any) => open ? <div>{children}</div> : null,
  StyledMenuItemOption: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
  MenuDivider: () => <hr />,
  StyledListItemIcon: ({ children }: any) => <span>{children}</span>
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

describe('ProfileMenu', () => {
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
