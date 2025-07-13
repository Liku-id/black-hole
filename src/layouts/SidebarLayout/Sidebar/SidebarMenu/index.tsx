import { useRouter } from 'next/router';
import { useContext } from 'react';

import { SidebarContext } from '@/contexts/SidebarContext';
import {
  alpha,
  Box,
  Button,
  List,
  ListItem,
  ListSubheader,
  styled
} from '@mui/material';
import NextLink from 'next/link';

import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import ArticleTwoToneIcon from '@mui/icons-material/ArticleTwoTone';
import BarChartTwoToneIcon from '@mui/icons-material/BarChartTwoTone';
import DashboardTwoToneIcon from '@mui/icons-material/DashboardTwoTone';
import DesignServicesTwoToneIcon from '@mui/icons-material/DesignServicesTwoTone';
import FolderTwoToneIcon from '@mui/icons-material/FolderTwoTone';
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';
import PeopleTwoToneIcon from '@mui/icons-material/PeopleTwoTone';
import SecurityTwoToneIcon from '@mui/icons-material/SecurityTwoTone';
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';

const MenuWrapper = styled(Box)(
  ({ theme }) => `
  .MuiList-root {
    padding: ${theme.spacing(1)};

    & > .MuiList-root {
      padding: 0 ${theme.spacing(0)} ${theme.spacing(1)};
    }
  }

    .MuiListSubheader-root {
      text-transform: uppercase;
      font-weight: bold;
      font-size: ${theme.typography.pxToRem(12)};
      color: ${theme.colors.alpha.trueWhite[50]};
      padding: ${theme.spacing(0, 2.5)};
      line-height: 1.4;
    }
`
);

const SubMenuWrapper = styled(Box)(
  ({ theme }) => `
    .MuiList-root {

      .MuiListItem-root {
        padding: 1px 0;

        .MuiBadge-root {
          position: absolute;
          right: ${theme.spacing(3.2)};

          .MuiBadge-standard {
            background: ${theme.colors.primary.main};
            font-size: ${theme.typography.pxToRem(10)};
            font-weight: bold;
            text-transform: uppercase;
            color: ${theme.palette.primary.contrastText};
          }
        }
    
        .MuiButton-root {
          display: flex;
          color: ${theme.colors.alpha.trueWhite[70]};
          background-color: transparent;
          width: 100%;
          justify-content: flex-start;
          padding: ${theme.spacing(1.2, 3)};

          .MuiButton-startIcon,
          .MuiButton-endIcon {
            transition: ${theme.transitions.create(['color'])};

            .MuiSvgIcon-root {
              font-size: inherit;
              transition: none;
            }
          }

          .MuiButton-startIcon {
            color: ${theme.colors.alpha.trueWhite[30]};
            font-size: ${theme.typography.pxToRem(20)};
            margin-right: ${theme.spacing(1)};
          }
          
          .MuiButton-endIcon {
            color: ${theme.colors.alpha.trueWhite[50]};
            margin-left: auto;
            opacity: .8;
            font-size: ${theme.typography.pxToRem(20)};
          }

          &.active,
          &:hover {
            background-color: ${alpha(theme.colors.alpha.trueWhite[100], 0.06)};
            color: ${theme.colors.alpha.trueWhite[100]};

            .MuiButton-startIcon,
            .MuiButton-endIcon {
              color: ${theme.colors.alpha.trueWhite[100]};
            }
          }
        }

        &.Mui-children {
          flex-direction: column;

          .MuiBadge-root {
            position: absolute;
            right: ${theme.spacing(7)};
          }
        }

        .MuiCollapse-root {
          width: 100%;

          .MuiList-root {
            padding: ${theme.spacing(1, 0)};
          }

          .MuiListItem-root {
            padding: 1px 0;

            .MuiButton-root {
              padding: ${theme.spacing(0.8, 3)};

              .MuiBadge-root {
                right: ${theme.spacing(3.2)};
              }

              &:before {
                content: ' ';
                background: ${theme.colors.alpha.trueWhite[100]};
                opacity: 0;
                transition: ${theme.transitions.create([
                  'transform',
                  'opacity'
                ])};
                width: 6px;
                height: 6px;
                transform: scale(0);
                transform-origin: center;
                border-radius: 20px;
                margin-right: ${theme.spacing(1.8)};
              }

              &.active,
              &:hover {

                &:before {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            }
          }
        }
      }
    }
`
);

function SidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);
  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <>
      <MenuWrapper>
        <List component="div">
          <SubMenuWrapper>
            <List component="div">
              <ListItem component="div">
                <NextLink href="/" passHref>
                  <Button
                    className={currentRoute === '/' ? 'active' : ''}
                    disableRipple
                    component="a"
                    onClick={closeSidebar}
                    startIcon={<DesignServicesTwoToneIcon />}
                  >
                    Overview
                  </Button>
                </NextLink>
              </ListItem>
            </List>
          </SubMenuWrapper>
        </List>
        
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              Dashboard
            </ListSubheader>
          }
        >
          <SubMenuWrapper>
            <List component="div">
              <ListItem component="div">
                <NextLink href="/dashboard" passHref>
                  <Button
                    className={currentRoute === '/dashboard' ? 'active' : ''}
                    disableRipple
                    component="a"
                    onClick={closeSidebar}
                    startIcon={<DashboardTwoToneIcon />}
                  >
                    Main Dashboard
                  </Button>
                </NextLink>
              </ListItem>
              <ListItem component="div">
                <NextLink href="/analytics" passHref>
                  <Button
                    className={currentRoute === '/analytics' ? 'active' : ''}
                    disableRipple
                    component="a"
                    onClick={closeSidebar}
                    startIcon={<BarChartTwoToneIcon />}
                  >
                    Analytics
                  </Button>
                </NextLink>
              </ListItem>
            </List>
          </SubMenuWrapper>
        </List>
        
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              User Management
            </ListSubheader>
          }
        >
          <SubMenuWrapper>
            <List component="div">
              <ListItem component="div">
                <NextLink href="/users" passHref>
                  <Button
                    className={currentRoute === '/users' ? 'active' : ''}
                    disableRipple
                    component="a"
                    onClick={closeSidebar}
                    startIcon={<PeopleTwoToneIcon />}
                  >
                    Users
                  </Button>
                </NextLink>
              </ListItem>
              <ListItem component="div">
                <NextLink href="/roles" passHref>
                  <Button
                    className={currentRoute === '/roles' ? 'active' : ''}
                    disableRipple
                    component="a"
                    onClick={closeSidebar}
                    startIcon={<SecurityTwoToneIcon />}
                  >
                    Roles & Permissions
                  </Button>
                </NextLink>
              </ListItem>
            </List>
          </SubMenuWrapper>
        </List>
        
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              Content Management
            </ListSubheader>
          }
        >
          <SubMenuWrapper>
            <List component="div">
              <ListItem component="div">
                <NextLink href="/content" passHref>
                  <Button
                    className={currentRoute === '/content' ? 'active' : ''}
                    disableRipple
                    component="a"
                    onClick={closeSidebar}
                    startIcon={<ArticleTwoToneIcon />}
                  >
                    Content
                  </Button>
                </NextLink>
              </ListItem>
              <ListItem component="div">
                <NextLink href="/media" passHref>
                  <Button
                    className={currentRoute === '/media' ? 'active' : ''}
                    disableRipple
                    component="a"
                    onClick={closeSidebar}
                    startIcon={<FolderTwoToneIcon />}
                  >
                    Media Library
                  </Button>
                </NextLink>
              </ListItem>
            </List>
          </SubMenuWrapper>
        </List>
        
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              System
            </ListSubheader>
          }
        >
          <SubMenuWrapper>
            <List component="div">
              <ListItem component="div">
                <NextLink href="/notifications" passHref>
                  <Button
                    className={currentRoute === '/notifications' ? 'active' : ''}
                    disableRipple
                    component="a"
                    onClick={closeSidebar}
                    startIcon={<NotificationsTwoToneIcon />}
                  >
                    Notifications
                  </Button>
                </NextLink>
              </ListItem>
              <ListItem component="div">
                <NextLink href="/settings" passHref>
                  <Button
                    className={currentRoute === '/settings' ? 'active' : ''}
                    disableRipple
                    component="a"
                    onClick={closeSidebar}
                    startIcon={<SettingsTwoToneIcon />}
                  >
                    Settings
                  </Button>
                </NextLink>
              </ListItem>
            </List>
          </SubMenuWrapper>
        </List>
        
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              Account
            </ListSubheader>
          }
        >
          <SubMenuWrapper>
            <List component="div">
              <ListItem component="div">
                <NextLink href="/profile" passHref>
                  <Button
                    className={currentRoute === '/profile' ? 'active' : ''}
                    disableRipple
                    component="a"
                    onClick={closeSidebar}
                    startIcon={<AccountCircleTwoToneIcon />}
                  >
                    My Profile
                  </Button>
                </NextLink>
              </ListItem>
            </List>
          </SubMenuWrapper>
        </List>
      </MenuWrapper>
    </>
  );
}

export default SidebarMenu;
