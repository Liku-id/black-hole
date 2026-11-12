import { fireEvent, screen, waitFor } from '@testing-library/react';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { CreatePartnerModal } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

describe('CreatePartnerModal', () => {
  it('validates required inputs and social media links before submit', async () => {
    const onSubmit = jest.fn();
    renderWithProviders(
      <CreatePartnerModal open={true} onClose={jest.fn()} onSubmit={onSubmit} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

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

  it('submits valid partner data, handles loading state, and closes on Escape', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();

    const { rerender } = renderWithProviders(
      <CreatePartnerModal open={true} onClose={onClose} onSubmit={onSubmit} />
    );

    fireEvent.change(screen.getByPlaceholderText('Partner Name'), {
      target: { value: 'New Partner' }
    });
    fireEvent.change(screen.getByPlaceholderText('PIC Name'), {
      target: { value: 'Bob' }
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
      target: { value: '81234567890' }
    });
    fireEvent.change(document.getElementById('instagram_url_field')!, {
      target: { value: 'https://instagram.com/newpartner' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          partnerName: 'New Partner',
          picName: 'Bob',
          picPhoneNumber: '+6281234567890',
          instagramLink: 'https://instagram.com/newpartner'
        })
      );
    });

    rerender(
      <CreatePartnerModal
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        loading={true}
      />
    );
    expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
