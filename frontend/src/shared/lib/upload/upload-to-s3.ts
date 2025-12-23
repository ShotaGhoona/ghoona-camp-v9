import { uploadApi } from '@/shared/api/upload/upload-api';

/**
 * 画像をS3にアップロードする
 *
 * @param file アップロードするファイル
 * @returns 公開URL
 * @throws Error アップロードに失敗した場合
 */
export async function uploadImageToS3(file: File): Promise<string> {
  // 1. 署名付きURLを取得
  const { uploadUrl, publicUrl } = await uploadApi.getUploadUrl({
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
  });

  // 2. S3に直接アップロード
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!response.ok) {
    throw new Error('画像のアップロードに失敗しました');
  }

  // 3. 公開URLを返す
  return publicUrl;
}
