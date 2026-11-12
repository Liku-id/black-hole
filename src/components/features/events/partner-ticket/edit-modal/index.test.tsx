import { fireEvent, screen, waitFor } from '@testing-library/react';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { EditPartnerModal } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

describe('EditPartnerModal', () => {
  const basePartner = {
    id: 'p1',
    partnerName: 'Media Partner',
    picName: 'Alice',
    picPhoneNumber: '+628123456789',
    socialMediaLink: {
      tiktok: 'https://tiktok.com/@media',
      instagram: 'https://instagram.com/media',
      twitter: 'https://x.com/media'
    }
  };

  it('validates required fields and social media requirement when partner is null', async () => {
    const onSubmit = jest.fn();
    renderWithProviders(
      <EditPartnerModal
        open={true}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        partner={null}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Partner name is required')).toBeInTheDocument();
      expect(screen.getByText('PIC name is required')).toBeInTheDocument();
      expect(
        screen.getByText('PIC phone number is required')
      ).toBeInTheDocument();
      expect(
        screen.getAllByText('At least one social media link is required').length
      ).toBeGreaterThan(0);
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('parses JSON, TikTok, Twitter/X, Instagram/@, and fallback social media link formats and submits', async () => {
    const onSubmit = jest.fn();
    const { rerender } = renderWithProviders(
      <EditPartnerModal
        open={true}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        partner={{
          ...basePartner,
          socialMediaLink: JSON.stringify({
            tiktok: 'https://tiktok.com/@json',
            instagram: '',
            twitter: ''
          })
        }}
      />
    );

    expect(
      screen.getByDisplayValue('https://tiktok.com/@json')
    ).toBeInTheDocument();

    rerender(
      <EditPartnerModal
        open={true}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        partner={{
          ...basePartner,
          socialMediaLink: 'https://tiktok.com/@legacy'
        }}
      />
    );
    expect(
      screen.getByDisplayValue('https://tiktok.com/@legacy')
    ).toBeInTheDocument();

    rerender(
      <EditPartnerModal
        open={true}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        partner={{
          ...basePartner,
          socialMediaLink: 'https://x.com/handle'
        }}
      />
    );
    expect(
      screen.getByDisplayValue('https://x.com/handle')
    ).toBeInTheDocument();

    rerender(
      <EditPartnerModal
        open={true}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        partner={{
          ...basePartner,
          socialMediaLink: '@instauser'
        }}
      />
    );
    expect(screen.getByDisplayValue('@instauser')).toBeInTheDocument();

    rerender(
      <EditPartnerModal
        open={true}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        partner={{
          ...basePartner,
          socialMediaLink: 'unrecognized'
        }}
      />
    );
    rerender(
      <EditPartnerModal
        open={true}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        partner={{
          ...basePartner,
          socialMediaLink: ''
        }}
      />
    );

    rerender(
      <EditPartnerModal
        open={true}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        partner={basePartner}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          partnerName: 'Media Partner',
          picName: 'Alice'
        })
      );
    });
  });

  it('shows Saving... when loading and calls onClose on Back button', () => {
    const onClose = jest.fn();
    const { rerender } = renderWithProviders(
      <EditPartnerModal
        open={true}
        onClose={onClose}
        onSubmit={jest.fn()}
        partner={basePartner}
        loading={true}
      />
    );

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();

    rerender(
      <EditPartnerModal
        open={true}
        onClose={onClose}
        onSubmit={jest.fn()}
        partner={basePartner}
        loading={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
