import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Container, styled, useTheme } from '@mui/material';
import { H3, Body1, Body2, H4 } from '@/components/common/typography';

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.common.white,
  textDecoration: 'none',
  fontSize: '14px',
  fontFamily: '"Onest", sans-serif',
  transition: 'color 0.3s',
  '&:hover': {
    color: theme.palette.success.main
  }
}));

const Footer = () => {
  const theme = useTheme();
  const wukongUrl = process.env.NEXT_PUBLIC_WUKONG_URL;
  const blogUrl = process.env.NEXT_PUBLIC_BLOG_URL;

  return (
    <Box component="footer" width="100%" pb="24px">
      <Container
        sx={{
          pt: { xs: '56px', lg: '96px' }
        }}
      >
        <Box
          bgcolor="grey.900"
          mx="auto"
          maxWidth="1140px"
          display="grid"
          p={{ xs: '56px 16px', lg: '56px' }}
          sx={{
            gridTemplateColumns: { xs: '1fr', lg: '2fr 0.75fr 1fr 1.5fr' },
            gap: { xs: '32px', lg: '108px' }
          }}
        >
          {/* Part 1: Logo and Text */}
          <Box>
            <Box mb="16px">
              <Image
                src="/logo/wukong.svg"
                alt="Logo"
                width={176}
                height={48}
              />
            </Box>
            <H4
              mb="40px"
              color={theme.palette.common.white}
              fontWeight={600}
            >
              PT Aku Rela Kamu Bahagia
            </H4>
            <Body2
            fontSize="14px"
            color={theme.palette.common.white}
            >
              Jl. Ciniru III No.2, RT.2/RW.3, Rw. Barat,Kec. Kby. Baru, Jakarta
              Selatan 12180,Indonesia
            </Body2>
          </Box>

          {/* Part 2: Event Type */}
          <Box>
            <H3
              mb="16px"
              fontWeight={400}
              fontSize="24px"
              color={theme.palette.common.white}
              sx={{
                fontFamily: 'Bebas Neue',
              }}
            >
              EVENT TYPE
            </H3>
            <Box display="flex" flexDirection="column" gap="8px">
              <StyledLink id="btn_music" href={wukongUrl}>
                Music
              </StyledLink>
              <StyledLink id="btn_sport" href={wukongUrl}>
                Sports
              </StyledLink>
              <StyledLink id="btn_exhibition" href={wukongUrl}>
                Exhibition
              </StyledLink>
              <StyledLink id="btn_festival" href={wukongUrl}>
                Festival
              </StyledLink>
            </Box>
          </Box>

          {/* Part 3: About Wukong */}
          <Box>
            <H3
              mb="16px"
              fontWeight={400}
              fontSize="24px"
              color={theme.palette.common.white}
              sx={{
                fontFamily: 'Bebas Neue',
              }}
            >
              ABOUT WUKONG
            </H3>
            <Box display="flex" flexDirection="column" gap="8px">
              <StyledLink id="btn_about_us" href={`${wukongUrl}/about-us`}>
                About Us
              </StyledLink>
              <StyledLink
                id="btn_term_and_condition"
                href={`${wukongUrl}/term-and-condition`}
              >
                Terms & Conditions
              </StyledLink>
              <StyledLink id="btn_privacy_policy" href={`${wukongUrl}/privacy-policy`}>
                Privacy Policy
              </StyledLink>
              <StyledLink id="btn_cookie_policy" href={`${wukongUrl}/cookie-policy`}>
                Cookie Policy
              </StyledLink>
              <StyledLink
                id="btn_blog_post"
                href={blogUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Blog
              </StyledLink>
            </Box>
          </Box>

          {/* Part 4: Follow Us */}
          <Box>
            <H3
              mb="16px"
              fontWeight={400}
              color={theme.palette.common.white}
              fontSize="24px"
              sx={{
                fontFamily: 'Bebas Neue'
              }}
            >
              FOLLOW US ON
            </H3>
            <Box
              mb="40px"
              display="flex"
              flexDirection="column"
              gap="8px"
            >
              <Box
                component={Link}
                href="https://www.instagram.com/wukong.co.id"
                target="_blank"
                rel="noopener noreferrer"
                display="flex"
                height="40px"
                width="40px"
                alignItems="center"
                justifyContent="center"
                borderRadius="50%"
                bgcolor={theme.palette.common.white}
              >
                <Image
                  src="/icon/instagram.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                  draggable={false}
                  priority
                />
              </Box>
            </Box>
            <Box>
              <Box
                mb="8px"
                display="flex"
                alignItems="center"
                gap="16px"
              >
                <Image src="/icon/sms.svg" alt="sms" width={24} height={24} />
                <Link
                  href="https://wa.me/6285121328284"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Body2
                    color={theme.palette.common.white}
                    sx={{
                      cursor: 'pointer',
                      transition: 'color 0.3s',
                      '&:hover': {
                        color: 'success.main'
                      }
                    }}
                  >
                    +62 851-2132-8284
                  </Body2>
                </Link>
              </Box>
              <Box display="flex" alignItems="center" gap="16px">
                <Image
                  src="/icon/email.svg"
                  alt="email"
                  width={24}
                  height={24}
                />
                <Link
                  href="mailto:support@wukong.co.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Body2
                    color={theme.palette.common.white}
                    sx={{
                      cursor: 'pointer',
                      transition: 'color 0.3s',
                      '&:hover': {
                        color: 'success.main'
                      }
                    }}
                  >
                    support@wukong.co.id
                  </Body2>
                </Link>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
      <Body1
        mt="24px"
        px={0}
        textAlign="center"
        fontWeight={400}
        color={theme.palette.common.white}
        sx={{
          '& br': {
            display: { xs: 'block', lg: 'none' }
          }
        }}
      >
        Version 1.0.0 | Hak Cipta 2025 - <br />
        PT Aku Rela Kamu Bahagia
      </Body1>
    </Box>
  );
};

export default Footer;
