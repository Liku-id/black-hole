import { apiUtils } from '@/utils/apiUtils';

import { registerService } from './register';

jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    post: jest.fn()
  }
}));

const mockPost = apiUtils.post as jest.Mock;

describe('registerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('requestOTP posts payload and rethrows on error', async () => {
    const res = { statusCode: 0, message: 'ok' };
    mockPost.mockResolvedValueOnce(res);

    await expect(
      registerService.requestOTP({ email: 'test@wukong.co.id' } as any)
    ).resolves.toEqual(res);
    expect(mockPost).toHaveBeenCalledWith(
      '/api/auth/otp/request',
      { email: 'test@wukong.co.id' },
      'OTP request failed'
    );

    mockPost.mockRejectedValueOnce(new Error('fail'));
    await expect(
      registerService.requestOTP({ email: 'test@wukong.co.id' } as any)
    ).rejects.toThrow('fail');
  });

  it('verifyOTP posts payload and rethrows on error', async () => {
    const res = { statusCode: 0, body: { verified: true } };
    mockPost.mockResolvedValueOnce(res);

    await expect(
      registerService.verifyOTP({ email: 'a@b.com', otp: '123456' } as any)
    ).resolves.toEqual(res);
    expect(mockPost).toHaveBeenCalledWith(
      '/api/auth/otp/verification',
      { email: 'a@b.com', otp: '123456' },
      'OTP verification failed'
    );

    mockPost.mockRejectedValueOnce(new Error('bad otp'));
    await expect(
      registerService.verifyOTP({ email: 'a@b.com', otp: '000000' } as any)
    ).rejects.toThrow('bad otp');
  });

  it('uploadAsset posts payload and rethrows on error', async () => {
    const res = { statusCode: 0, body: { id: 'asset-1' } };
    mockPost.mockResolvedValueOnce(res);

    await expect(
      registerService.uploadAsset({ file: 'abc' } as any)
    ).resolves.toEqual(res);
    expect(mockPost).toHaveBeenCalledWith(
      '/api/upload-asset',
      { file: 'abc' },
      'Asset upload failed'
    );

    mockPost.mockRejectedValueOnce(new Error('upload error'));
    await expect(
      registerService.uploadAsset({ file: 'abc' } as any)
    ).rejects.toThrow('upload error');
  });

  it('createEventOrganizer posts payload and rethrows on error', async () => {
    const res = { statusCode: 0, body: { id: 'eo-1' } };
    mockPost.mockResolvedValueOnce(res);

    await expect(
      registerService.createEventOrganizer({ name: 'Org' } as any)
    ).resolves.toEqual(res);
    expect(mockPost).toHaveBeenCalledWith(
      '/api/event-organizers',
      { name: 'Org' },
      'Event organizer creation failed'
    );

    mockPost.mockRejectedValueOnce(new Error('create error'));
    await expect(
      registerService.createEventOrganizer({ name: 'Org' } as any)
    ).rejects.toThrow('create error');
  });

  it('checkAvailability posts payload and rethrows on error', async () => {
    const res = { statusCode: 0, body: { available: true } };
    mockPost.mockResolvedValueOnce(res);

    await expect(
      registerService.checkAvailability({ email: 'a@b.com' } as any)
    ).resolves.toEqual(res);
    expect(mockPost).toHaveBeenCalledWith(
      '/api/users/check-availability',
      { email: 'a@b.com' },
      'Availability check failed'
    );

    mockPost.mockRejectedValueOnce(new Error('check error'));
    await expect(
      registerService.checkAvailability({ email: 'a@b.com' } as any)
    ).rejects.toThrow('check error');
  });
});
