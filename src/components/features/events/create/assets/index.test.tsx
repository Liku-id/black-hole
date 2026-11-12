import { act, fireEvent, render, screen } from '@testing-library/react';

import { EventAssetsForm } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

describe('EventAssetsForm', () => {
  const mockOnFilesChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-preview');
    global.URL.revokeObjectURL = jest.fn();
  });

  it('selects and removes thumbnail and supporting images and notifies parent', async () => {
    const { container } = render(
      <EventAssetsForm onFilesChange={mockOnFilesChange} showError={true} />
    );

    expect(screen.getByText('Event Thumbnail*')).toBeInTheDocument();

    const inputs = container.querySelectorAll('input[type="file"]');
    const thumbFile = new File(['thumb'], 'thumb.jpg', { type: 'image/jpeg' });
    const suppFile = new File(['supp'], 'supp.jpg', { type: 'image/jpeg' });

    await act(async () => {
      fireEvent.change(inputs[0], { target: { files: [thumbFile] } });
    });
    expect(mockOnFilesChange).toHaveBeenCalledWith({
      thumbnail: thumbFile,
      supportingImages: [null, null, null, null]
    });

    await act(async () => {
      fireEvent.change(inputs[1], { target: { files: [suppFile] } });
    });
    expect(mockOnFilesChange).toHaveBeenCalledWith({
      thumbnail: thumbFile,
      supportingImages: [suppFile, null, null, null]
    });

    const removeIcons = container.querySelectorAll('#clear_icon');
    fireEvent.click(removeIcons[0]);
    expect(mockOnFilesChange).toHaveBeenCalledWith({
      thumbnail: null,
      supportingImages: [suppFile, null, null, null]
    });

    fireEvent.click(container.querySelectorAll('#clear_icon')[0]);
    expect(mockOnFilesChange).toHaveBeenLastCalledWith({
      thumbnail: null,
      supportingImages: [null, null, null, null]
    });
  });
});
