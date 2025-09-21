import { apiUtils } from '@/utils/apiUtils';

export interface UploadAssetRequest {
  type: string;
  file: string;
  filename: string;
  privacy: string;
  fileGroup: string;
}

export interface Asset {
  id: string;
  type: string;
  url: string;
  bucket: string;
  key: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadAssetResponse {
  statusCode: number;
  message: string;
  body: {
    asset: Asset;
  };
}

export interface GetAssetsResponse {
  statusCode: number;
  message: string;
  body: {
    assets: Asset[];
  };
}

// Assets Service - Only handles asset operations (GET and POST /v1/assets and /v1/upload-asset)
class AssetsService {
  async getAssets(): Promise<GetAssetsResponse> {
    try {
      return await apiUtils.get<GetAssetsResponse>(
        '/api/assets',
        {},
        'Failed to fetch assets'
      );
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  }

  async uploadAsset(data: UploadAssetRequest | File): Promise<UploadAssetResponse> {
    try {
      let requestData: UploadAssetRequest;
      
      if (data instanceof File) {
        // Convert File to base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(data);
        });

        requestData = {
          type: data.type,
          file: base64.split(',')[1], // Remove data:image/... prefix
          filename: data.name,
          privacy: 'private',
          fileGroup: 'USER'
        };
      } else {
        requestData = data;
      }

      return await apiUtils.post<UploadAssetResponse>(
        '/api/assets/upload',
        requestData,
        'Failed to upload asset'
      );
    } catch (error) {
      console.error('Error uploading asset:', error);
      throw error;
    }
  }
}

const assetsService = new AssetsService();

export { assetsService };
