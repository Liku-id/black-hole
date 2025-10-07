import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';

import { withAuth } from '@/components/Auth/withAuth';
import DashboardLayout from '@/layouts/dashboard';
import { Box } from '@mui/material';
import { Caption, H2, Body2, Body1 } from '@/components/common';

function PrivacyPolicy() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <Head>
        <title>Privacy Policy</title>
      </Head>

      {/* Back Button */}
      <Box
        alignItems="center"
        display="flex"
        gap={1}
        mb={2}
        sx={{ cursor: 'pointer' }}
        onClick={() => router.push(`/dashboard`)}
      >
        <Image alt="Back" height={24} src="/icon/back.svg" width={24} />
        <Caption color="text.secondary" component="span">
          Back To Dashboard
        </Caption>
      </Box>

      {/* Title */}
      <H2 color="text.primary" fontWeight={700} mb="21px">
        Privacy Policy
      </H2>

      <Box
        sx={{
          backgroundColor: 'common.white',
          boxShadow: '0 4px 20px 0 rgba(40, 72, 107, 0.05)',
          padding: 3
        }}
      >
        <Body2 color="text.secondary" mb={3}>
          This Privacy Policy was last updated on [Date up on Platform].
        </Body2>

        <Body2 color="text.secondary" mb={3}>
          WUKONG is the "Organizer" of a web-based platform (wukong.co.id)
          providing ticket purchase services for various events (concerts,
          performances, seminars, etc.) through its "Ticket Management system"
          ("Our Services"). The platform is managed by "PT Aku Rela Kamu
          Bahagia" (the "Company").
        </Body2>

        <Body2 color="text.secondary" mb={3}>
          "Seller" (Promoter, Event Organizer, Event Owner, etc.) is the event
          organizer, and "Customer" is those who use the service to purchase
          tickets.
        </Body2>

        <Body2 color="text.secondary" mb={4}>
          This Privacy Policy details how personal data is collected, stored,
          used, disclosed, and protected. By using the Platform, you agree to
          this policy, and if you do not agree, you should not use the services.
        </Body2>

        <Body1 fontWeight={600} color="text.secondary" sx={{ mb: 2 }}>
          A. COLLECTION OF INFORMATION
        </Body1>

        <Body2 color="text.secondary" mb={2}>
          We may collect information about the Personal Data you provide when
          using Our Services, including but not limited to:
        </Body2>

        <Box component="ol" sx={{ pl: 3, mb: 3 }}>
          <Box component="li" sx={{ mb: 1, color: 'text.secondary' }}>
            <Body2 color="text.secondary">
              <strong>Personal identity:</strong> name, gender, date of birth,
              profile photo
            </Body2>
          </Box>
          <Box component="li" sx={{ mb: 1, color: 'text.secondary' }}>
            <Body2 color="text.secondary">
              <strong>Contact:</strong> email address, home address, phone
              number
            </Body2>
          </Box>
          <Box component="li" sx={{ mb: 1, color: 'text.secondary' }}>
            <Body2 color="text.secondary">
              <strong>Payment account:</strong> debit/credit card information,
              bank name, account number, verification code, and expiration date
            </Body2>
          </Box>
          <Box component="li" sx={{ mb: 1, color: 'text.secondary' }}>
            <Body2 color="text.secondary">
              <strong>Transaction data:</strong> ticket purchase history,
              payment information, invoice number
            </Body2>
          </Box>
          <Box component="li" sx={{ mb: 1, color: 'text.secondary' }}>
            <Body2 color="text.secondary">
              <strong>Technical data:</strong> IP address, browser type and
              version, device used, operating system
            </Body2>
          </Box>
          <Box component="li" sx={{ mb: 1, color: 'text.secondary' }}>
            <Body2 color="text.secondary">
              <strong>Profile data:</strong> such as customer name and password,
              purchases, orders or preference intentions
            </Body2>
          </Box>
          <Box component="li" sx={{ mb: 1, color: 'text.secondary' }}>
            <Body2 color="text.secondary">
              <strong>Usage data:</strong> such as information about how
              Customers use our platform, products and Services
            </Body2>
          </Box>
          <Box component="li" sx={{ mb: 1, color: 'text.secondary' }}>
            <Body2 color="text.secondary">
              <strong>Marketing and communication preferences:</strong> your
              choices regarding promotional communications from us or our
              partners
            </Body2>
          </Box>
          <Box component="li" sx={{ mb: 1, color: 'text.secondary' }}>
            <Body2 color="text.secondary">
              <strong>Direct interactions:</strong> messages, reports, questions
              or suggestions that you send to our team
            </Body2>
          </Box>
        </Box>

        <Body2 color="text.secondary" mb={3}>
          You must provide accurate and non-misleading information, keep it
          updated, and inform of changes. You can update your personal
          information via your account on the Platform.
        </Body2>

        <Body2 color="text.secondary">
          If you provide personal information from a third party, you confirm
          you have obtained permission from that party.
        </Body2>
      </Box>
    </DashboardLayout>
  );
}

export default withAuth(PrivacyPolicy, { requireAuth: true });
