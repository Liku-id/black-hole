import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';

import { withAuth } from '@/components/Auth/withAuth';
import DashboardLayout from '@/layouts/dashboard';
import { Box } from '@mui/material';
import { Caption, H2, Body2, H4, Body1 } from '@/components/common';

function TermsAndCondition() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <Head>
        <title>Terms and Condition</title>
      </Head>

      {/* Back Button */}
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        mb={2}
        sx={{ cursor: 'pointer' }}
        onClick={() => router.push('/dashboard')}
      >
        <Image alt="Back" height={24} src="/icon/back.svg" width={24} />
        <Caption color="text.secondary" component="span">
          Back To Dashboard
        </Caption>
      </Box>

      {/* Title */}
      <H2 color="text.primary" fontWeight={700} mb={2.625 /* 21px */}>
        Terms and Condition
      </H2>

      {/* Card */}
      <Box
        bgcolor="background.paper"
        boxShadow="0 4px 20px 0 rgba(40, 72, 107, 0.05)"
        p={3}
      >
        <Body2 color="text.secondary" mb={4}>
          Welcome to WUKONG ("Platform"). The Platform is managed by PT Aku Rela
          Kamu Bahagia ("Company"). We provide event ticket purchasing through
          our "Ticket Management system" ("Our Services") at{' '}
          <Box
            component="a"
            href="https://wukong.co.id"
            target="_blank"
            rel="noopener noreferrer"
            color="secondary.dark"
            sx={{
              textDecoration: 'underline',
              opacity: 0.8,
              '&:hover': { opacity: 1 }
            }}
          >
            www.wukong.co.id
          </Box>
          . By using the Platform, you agree to these Terms & Conditions. If you
          do not agree, please do not use our services.
        </Body2>

        <H4 fontWeight={600} color="text.secondary" mb={2}>
          A. GENERAL TERMS
        </H4>

        <Body1 fontWeight={600} color="text.secondary" mb={2}>
          1. Definition
        </Body1>

        <Box component="ol" pl={3} mb={3}>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Account"</strong> means the account that you create on
              the Platform to access Our Services.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"AML (Anti Money Laundering)"</strong> means the laws and
              regulations designed to prevent money laundering and terrorist
              financing.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"You" or "Customer"</strong> means any individual or
              entity that uses Our Services.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Event"</strong> means any concert, performance, seminar,
              or other event for which tickets are sold through the Platform.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Event Creator"</strong> means the organizer, promoter, or
              owner of an Event.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Event Ticket Price"</strong> means the price of a ticket
              for an Event as set by the Event Creator.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Password"</strong> means the secret word or phrase that
              you use to access your Account.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Event Ticket Trading Activities"</strong> means any
              buying, selling, or transferring of Event tickets.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"KYC (Know Your Customer) Principles"</strong> means the
              process of verifying the identity of customers.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Services"</strong> means all services provided by the
              Platform, including but not limited to ticket purchasing, event
              management, and customer support.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Partners"</strong> means third-party service providers,
              payment processors, and other entities that work with the
              Platform.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Telephone Number"</strong> means the phone number
              associated with your Account.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Customer"</strong> means any individual or entity that
              purchases tickets through the Platform.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"User"</strong> means any individual or entity that
              accesses or uses the Platform.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Bank Account"</strong> means the bank account associated
              with your Account for payment purposes.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Registration"</strong> means the process of creating an
              Account on the Platform.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Rupiah"</strong> means the currency of Indonesia.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Sign in"</strong> means the process of logging into your
              Account.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Ticket"</strong> means a digital or physical ticket that
              grants access to an Event.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Verification"</strong> means the process of confirming
              your identity or the validity of information.
            </Body2>
          </Box>
          <Box component="li" mb={1} color="text.secondary">
            <Body2 color="text.secondary">
              <strong>"Platform"</strong> means the WUKONG website and all
              related services.
            </Body2>
          </Box>
        </Box>

        <Body2 color="text.secondary">
          "WUKONG", "We", or "Platform" refers to PT Aku Rela Kamu Bahagia, a
          limited liability company incorporated under Indonesian law and
          domiciled in Central Jakarta.
        </Body2>
      </Box>
    </DashboardLayout>
  );
}

export default withAuth(TermsAndCondition, { requireAuth: true });
