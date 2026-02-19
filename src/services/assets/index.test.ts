import { apiUtils } from '@/utils/apiUtils';

import { assetsService, UploadAssetRequest, GetAssetsResponse, UploadAssetResponse } from './index';


// Mock apiUtils
jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

describe('AssetsService', () => {
  const mockApiUtilsGet = apiUtils.get as jest.MockedFunction<typeof apiUtils.get>;
  const mockApiUtilsPost = apiUtils.post as jest.MockedFunction<typeof apiUtils.post>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAssets', () => {
    it('should successfully fetch assets', async () => {
      const mockAssetsResponse: GetAssetsResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          assets: [
            {
              id: '1',
              type: 'image/png',
              url: 'https://example.com/image1.png',
              bucket: 'test-bucket',
              key: 'assets/image1.png',
              createdAt: '2023-12-01T00:00:00Z',
              updatedAt: '2023-12-01T00:00:00Z'
            },
            {
              id: '2',
              type: 'image/jpeg',
              url: 'https://example.com/image2.jpg',
              bucket: 'test-bucket',
              key: 'assets/image2.jpg',
              createdAt: '2023-12-02T00:00:00Z',
              updatedAt: '2023-12-02T00:00:00Z'
            }
          ]
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockAssetsResponse);

      const result = await assetsService.getAssets();

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/assets',
        {},
        'Failed to fetch assets'
      );
      expect(result).toEqual(mockAssetsResponse);
      expect(result.body.assets).toHaveLength(2);
    });

    it('should handle error when fetching assets', async () => {
      const mockError = new Error('Network error');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(assetsService.getAssets()).rejects.toThrow('Network error');
      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/assets',
        {},
        'Failed to fetch assets'
      );
    });
  });

  describe('uploadAsset', () => {
    it('should successfully upload asset with UploadAssetRequest', async () => {
      const mockUploadRequest: UploadAssetRequest = {
        type: 'image/png',
        file: 'base64encodedstring',
        filename: 'test-image.png',
        privacy: 'private',
        fileGroup: 'USER'
      };

      const mockUploadResponse: UploadAssetResponse = {
        statusCode: 200,
        message: 'Asset uploaded successfully',
        body: {
          asset: {
            id: '1',
            type: 'image/png',
            url: 'https://example.com/test-image.png',
            bucket: 'test-bucket',
            key: 'assets/test-image.png',
            createdAt: '2023-12-01T00:00:00Z',
            updatedAt: '2023-12-01T00:00:00Z'
          }
        }
      };

      mockApiUtilsPost.mockResolvedValue(mockUploadResponse);

      const result = await assetsService.uploadAsset(mockUploadRequest);

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/assets/upload',
        mockUploadRequest,
        'Failed to upload asset'
      );
      expect(result).toEqual(mockUploadResponse);
    });

    it('should successfully upload asset with File object', async () => {
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' });

      const mockUploadResponse: UploadAssetResponse = {
        statusCode: 200,
        message: 'Asset uploaded successfully',
        body: {
          asset: {
            id: '2',
            type: 'image/png',
            url: 'https://example.com/test.png',
            bucket: 'test-bucket',
            key: 'assets/test.png',
            createdAt: '2023-12-01T00:00:00Z',
            updatedAt: '2023-12-01T00:00:00Z'
          }
        }
      };

      mockApiUtilsPost.mockResolvedValue(mockUploadResponse);

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null as any,
        result: 'data:image/png;base64,dGVzdCBjb250ZW50'
      };

      global.FileReader = jest.fn(() => mockFileReader) as any;

      // Trigger the upload
      const uploadPromise = assetsService.uploadAsset(mockFile);

      // Simulate FileReader onload
      if (mockFileReader.onload) {
        mockFileReader.onload();
      }

      const result = await uploadPromise;

      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/assets/upload',
        expect.objectContaining({
          type: 'image/png',
          file: 'dGVzdCBjb250ZW50',
          filename: 'test.png',
          privacy: 'private',
          fileGroup: 'USER'
        }),
        'Failed to upload asset'
      );
      expect(result).toEqual(mockUploadResponse);
    });

    it('should handle error when uploading asset with request object', async () => {
      const mockUploadRequest: UploadAssetRequest = {
        type: 'image/png',
        file: 'base64encodedstring',
        filename: 'test-image.png',
        privacy: 'private',
        fileGroup: 'USER'
      };

      const mockError = new Error('Upload failed');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(assetsService.uploadAsset(mockUploadRequest)).rejects.toThrow('Upload failed');
      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/assets/upload',
        mockUploadRequest,
        'Failed to upload asset'
      );
    });

    it('should handle error when uploading asset with File object', async () => {
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' });

      const mockError = new Error('Upload failed');
      mockApiUtilsPost.mockRejectedValue(mockError);

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null as any,
        result: 'data:image/png;base64,dGVzdCBjb250ZW50'
      };

      global.FileReader = jest.fn(() => mockFileReader) as any;

      const uploadPromise = assetsService.uploadAsset(mockFile);

      // Simulate FileReader onload
      if (mockFileReader.onload) {
        mockFileReader.onload();
      }

      await expect(uploadPromise).rejects.toThrow('Upload failed');
    });
  });
});
