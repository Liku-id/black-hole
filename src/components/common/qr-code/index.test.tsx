import { render, screen, waitFor } from '@testing-library/react';
import { toDataURL } from 'qrcode';

import { QRCode } from './index';

jest.mock('qrcode', () => ({
  toDataURL: jest.fn()
}));

const mockToDataURL = toDataURL as jest.Mock;

describe('QRCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows error state immediately when value is empty or whitespace', async () => {
    render(<QRCode className="qr-empty" value="   " />);
    await waitFor(() => {
      expect(screen.getByText('QR code not available')).toBeInTheDocument();
    });
    expect(mockToDataURL).not.toHaveBeenCalled();
  });

  it('shows loading state then renders generated QR image', async () => {
    let resolveQr: (val: string) => void;
    mockToDataURL.mockReturnValue(
      new Promise<string>((resolve) => {
        resolveQr = resolve;
      })
    );

    const { container } = render(
      <QRCode className="qr-custom" size={200} value="TICKET-123" />
    );

    expect(container.querySelector('.qr-custom')).toBeInTheDocument();
    expect(
      screen.queryByRole('img', { name: 'QR Code' })
    ).not.toBeInTheDocument();

    resolveQr!('data:image/png;base64,qrdata');

    await waitFor(() => {
      const img = screen.getByRole('img', { name: 'QR Code' });
      expect(img).toHaveAttribute('src', 'data:image/png;base64,qrdata');
    });
    expect(mockToDataURL).toHaveBeenCalledWith('TICKET-123', {
      width: 200,
      margin: 0
    });
  });

  it('shows fallback error message when toDataURL rejects', async () => {
    mockToDataURL.mockRejectedValueOnce(new Error('qr error'));

    render(<QRCode value="TICKET-ERR" />);

    await waitFor(() => {
      expect(screen.getByText('QR code not available')).toBeInTheDocument();
    });
  });
});
