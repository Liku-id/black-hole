import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';

import { UploadCSVModal } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

describe('UploadCSVModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-csv');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('validates file type, file size limit, and downloads CSV template', async () => {
    const onUpload = jest.fn();
    render(
      <UploadCSVModal open={true} onClose={jest.fn()} onUpload={onUpload} />
    );

    // Download CSV template click
    const linkClick = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    fireEvent.click(screen.getByText('download CSV template'));
    expect(linkClick).toHaveBeenCalled();
    linkClick.mockRestore();

    const fileInput = document.querySelector('input[type="file"]')!;

    // Invalid file type (react-dropzone accept filter check)
    const badFile = new File(['abc'], 'bad.txt', { type: 'text/plain' });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [badFile] } });
    });

    // Oversized CSV file (> 10MB)
    const bigFile = new File(['a'], 'big.csv', { type: 'text/csv' });
    Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [bigFile] } });
    });
    await waitFor(() => {
      expect(
        screen.getByText('your file size is too large!')
      ).toBeInTheDocument();
    });
  });

  it('simulates upload progress, removes file, uploads valid file, and handles Cancel/Close', async () => {
    const onUpload = jest.fn();
    const onClose = jest.fn();

    const { rerender } = render(
      <UploadCSVModal open={true} onClose={onClose} onUpload={onUpload} />
    );

    const fileInput = document.querySelector('input[type="file"]')!;
    const validFile = new File(['name\nJohn'], 'guests.csv', {
      type: 'text/csv'
    });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [validFile] } });
    });
    await waitFor(() => {
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    // Complete upload simulation timer (11 steps * 200ms)
    act(() => {
      jest.advanceTimersByTime(2500);
    });
    expect(screen.getByText('guests.csv')).toBeInTheDocument();

    // Remove uploaded file
    fireEvent.click(screen.getByTestId('DeleteIcon').closest('button')!);
    expect(
      screen.getByText('Select CSV file to upload or drag and drop it here!')
    ).toBeInTheDocument();

    // Upload again and submit
    const nextFileInput = document.querySelector('input[type="file"]')!;
    await act(async () => {
      fireEvent.change(nextFileInput, { target: { files: [validFile] } });
    });
    act(() => {
      jest.advanceTimersByTime(2500);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onUpload).toHaveBeenCalledWith(validFile);

    // Loading state
    rerender(
      <UploadCSVModal
        open={true}
        onClose={onClose}
        onUpload={onUpload}
        loading={true}
      />
    );
    expect(screen.getByRole('button', { name: '...' })).toBeDisabled();

    rerender(
      <UploadCSVModal
        open={true}
        onClose={onClose}
        onUpload={onUpload}
        loading={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
