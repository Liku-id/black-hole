import React from 'react';
import { render, screen } from '@testing-library/react';
import { DrawerContent } from './index';

jest.mock('../styles', () => ({
  LogoContainer: ({ children }: any) => <div>{children}</div>,
  UserMenuContainer: ({ children }: any) => <div>{children}</div>
}));

jest.mock('./menu', () => ({
  MenuList: () => <div>Menu List</div>
}));

jest.mock('./profile-content', () => ({
  ProfileContent: () => <div>Profile Content</div>
}));

jest.mock('./profile-menu', () => ({
  ProfileMenu: () => <div>Profile Menu</div>
}));

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/dashboard' })
}));

describe('DrawerContent', () => {
  it('renders correctly', () => {
    render(
      <DrawerContent
        user={{}}
        anchorEl={null}
        onProfileMenuOpen={() => {}}
        onProfileMenuClose={() => {}}
        onLogout={() => {}}
      />
    );
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Menu List')).toBeInTheDocument();
  });
});
