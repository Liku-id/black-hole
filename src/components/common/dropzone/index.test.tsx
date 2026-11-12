import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Dropzone } from './index';

describe('Dropzone', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders upload prompt with order variants and error styling', () => {
    const { rerender } = render(<Dropzone order={1} error />);
    expect(
      screen.getByText('Click or drag file to upload thumbnail')
    ).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    rerender(<Dropzone order={2} />);
    expect(
      screen.getByText('Click or drag file to upload image')
    ).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('handles file selection via drop/input, renders preview with order, and removes file', async () => {
    const onFileSelect = jest.fn();
    const onFileRemove = jest.fn();
    const createUrlSpy = jest
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:preview-url');
    const revokeUrlSpy = jest
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {});

    const { container } = render(
      <Dropzone
        order={1}
        onFileSelect={onFileSelect}
        onFileRemove={onFileRemove}
      />
    );

    const file = new File(['img-bytes'], 'banner.png', { type: 'image/png' });
    const input = container.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(file);
      expect(screen.getByRole('img', { name: /preview/i })).toHaveAttribute(
        'src',
        'blob:preview-url'
      );
    });
    expect(createUrlSpy).toHaveBeenCalledWith(file);

    const removeBtn = container.querySelector('#clear_icon')!;
    fireEvent.click(removeBtn);

    expect(revokeUrlSpy).toHaveBeenCalledWith('blob:preview-url');
    expect(onFileRemove).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText('Click or drag file to upload thumbnail')
    ).toBeInTheDocument();
  });

  it('displays existing file and allows removal without revoking null previewUrl', () => {
    const onFileRemove = jest.fn();
    const url = 'https://example.com/image.jpg';
    const { container } = render(
      <Dropzone
        existingFileUrl={url}
        order={2}
        error
        onFileRemove={onFileRemove}
      />
    );
    const img = screen.getByRole('img', { name: /preview/i });
    expect(img).toHaveAttribute('src');

    fireEvent.click(container.querySelector('#clear_icon')!);
    expect(onFileRemove).toHaveBeenCalledTimes(1);
  });
});
