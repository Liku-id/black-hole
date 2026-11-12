import {
  convertFileToBase64,
  convertFileToDataURL,
  downloadFile,
  fileUtils,
  getFileExtension,
  getFileSize,
  isValidFileSize,
  isValidFileType
} from './fileUtils';

describe('fileUtils', () => {
  const OriginalFileReader = global.FileReader;

  afterEach(() => {
    global.FileReader = OriginalFileReader;
    jest.restoreAllMocks();
  });

  describe('convertFileToBase64', () => {
    it('extracts base64 content after comma', async () => {
      const mockFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      const mockReader: any = {
        readAsDataURL: jest.fn(function () {
          Promise.resolve().then(() => {
            mockReader.result = 'data:text/plain;base64,aGVsbG8=';
            mockReader.onload?.();
          });
        })
      };
      global.FileReader = jest.fn(() => mockReader) as any;

      const result = await convertFileToBase64(mockFile);
      expect(result).toBe('aGVsbG8=');
    });

    it('rejects on FileReader error', async () => {
      const mockFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      const err = new Error('read failed');
      const mockReader: any = {
        readAsDataURL: jest.fn(function () {
          Promise.resolve().then(() => {
            mockReader.onerror?.(err);
          });
        })
      };
      global.FileReader = jest.fn(() => mockReader) as any;

      await expect(convertFileToBase64(mockFile)).rejects.toBe(err);
    });
  });

  describe('convertFileToDataURL', () => {
    it('returns full data URL string', async () => {
      const mockFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      const mockReader: any = {
        readAsDataURL: jest.fn(function () {
          Promise.resolve().then(() => {
            mockReader.result = 'data:text/plain;base64,aGVsbG8=';
            mockReader.onload?.();
          });
        })
      };
      global.FileReader = jest.fn(() => mockReader) as any;

      const result = await convertFileToDataURL(mockFile);
      expect(result).toBe('data:text/plain;base64,aGVsbG8=');
    });

    it('rejects on FileReader error', async () => {
      const mockFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      const err = new Error('dataurl failed');
      const mockReader: any = {
        readAsDataURL: jest.fn(function () {
          Promise.resolve().then(() => {
            mockReader.onerror?.(err);
          });
        })
      };
      global.FileReader = jest.fn(() => mockReader) as any;

      await expect(convertFileToDataURL(mockFile)).rejects.toBe(err);
    });
  });

  describe('getFileExtension', () => {
    it('extracts lowercase extension', () => {
      expect(getFileExtension('photo.PNG')).toBe('png');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
    });

    it('handles empty filename', () => {
      expect(getFileExtension('')).toBe('');
    });
  });

  describe('getFileSize', () => {
    it('formats 0 bytes and multi-unit sizes', () => {
      expect(getFileSize(0)).toBe('0 Bytes');
      expect(getFileSize(512)).toBe('512 Bytes');
      expect(getFileSize(1024)).toBe('1 KB');
      expect(getFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
    });
  });

  describe('isValidFileType and isValidFileSize', () => {
    it('validates allowed MIME types and file size limit', () => {
      const file = new File(['a'.repeat(100)], 'doc.pdf', {
        type: 'application/pdf'
      });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      expect(isValidFileType(file, ['application/pdf', 'image/png'])).toBe(
        true
      );
      expect(isValidFileType(file, ['image/png'])).toBe(false);
      expect(isValidFileSize(file, 1)).toBe(true);
      expect(isValidFileSize(file, 0.5)).toBe(false);
    });
  });

  describe('downloadFile', () => {
    it('creates object URL, clicks anchor, and revokes URL for string and Blob data', () => {
      const createObjectURLSpy = jest
        .spyOn(URL, 'createObjectURL')
        .mockReturnValue('blob:test-url');
      const revokeObjectURLSpy = jest
        .spyOn(URL, 'revokeObjectURL')
        .mockImplementation(() => {});
      const clickMock = jest.fn();
      const origCreateElement = document.createElement.bind(document);
      jest
        .spyOn(document, 'createElement')
        .mockImplementation((tag: string) => {
          const el = origCreateElement(tag);
          if (tag === 'a') {
            el.click = clickMock;
          }
          return el;
        });

      downloadFile('csv,data', 'export.csv', 'text/csv');
      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      expect(clickMock).toHaveBeenCalledTimes(1);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-url');

      const blob = new Blob(['binary'], { type: 'application/pdf' });
      downloadFile(blob, 'report.pdf');
      expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
      expect(clickMock).toHaveBeenCalledTimes(2);
    });
  });

  it('exports all helpers on fileUtils object', () => {
    expect(fileUtils.getFileExtension).toBe(getFileExtension);
    expect(fileUtils.getFileSize).toBe(getFileSize);
    expect(fileUtils.downloadFile).toBe(downloadFile);
  });
});
