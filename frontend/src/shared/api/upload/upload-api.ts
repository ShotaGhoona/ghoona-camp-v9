import httpClient from '../client/http-client';

export interface GetUploadUrlRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface GetUploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

export const uploadApi = {
  /**
   * 署名付きアップロードURLを取得
   */
  getUploadUrl: async (
    request: GetUploadUrlRequest,
  ): Promise<GetUploadUrlResponse> => {
    const response = await httpClient.post<GetUploadUrlResponse>(
      '/api/v1/upload/url',
      {
        fileName: request.fileName,
        contentType: request.contentType,
        fileSize: request.fileSize,
      },
    );
    return response.data;
  },
};
