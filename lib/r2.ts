import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.STORAGE_ENDPOINT || process.env.R2_ENDPOINT;
const region = process.env.STORAGE_REGION || "auto";
const accessKeyId =
  process.env.STORAGE_ACCESS_KEY || process.env.R2_ACCESS_KEY_ID;
const secretAccessKey =
  process.env.STORAGE_SECRET_KEY || process.env.R2_SECRET_ACCESS_KEY;

const r2Client = new S3Client({
  region,
  endpoint: endpoint || undefined,
  credentials:
    accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey }
      : undefined,
});

export async function uploadToR2(
  bucketName: string,
  key: string,
  body: Buffer | Uint8Array | Blob | string,
  contentType: string
) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  try {
    const response = await r2Client.send(command);
    return { success: true, data: response };
  } catch (error) {
    console.error("R2上传失败:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getPresignedR2Url(
  bucketName: string,
  fileKey: string,
  expiresIn: number = 3600
) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });
  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
  return signedUrl;
}

const BUCKET_ENV = process.env.STORAGE_BUCKET || process.env.R2_BUCKET_NAME || "";

export function getR2Bucket(): string {
  return BUCKET_ENV;
}

const PUBLIC_BASE = process.env.STORAGE_DOMAIN || process.env.R2_PUBLIC_URL || "";

export function getR2PublicUrl(key: string): string {
  if (!PUBLIC_BASE) return "";
  const base = PUBLIC_BASE.replace(/\/$/, "");
  return `${base}/${key}`;
}

export async function uploadFromUrl(
  bucketName: string,
  key: string,
  fileUrl: string,
  contentType?: string
): Promise<{ success: true; publicUrl: string } | { success: false; error: string }> {
  try {
    const res = await fetch(fileUrl);
    if (!res.ok) {
      return { success: false, error: `fetch failed: ${res.status}` };
    }
    const arrayBuffer = await res.arrayBuffer();
    const body = Buffer.from(arrayBuffer);
    const type = contentType || res.headers.get("content-type") || "application/octet-stream";
    const result = await uploadToR2(bucketName, key, body, type);
    if (!result.success) {
      return { success: false, error: result.error || "upload failed" };
    }
    const publicUrl = getR2PublicUrl(key);
    return {
      success: true,
      publicUrl: publicUrl || (await getPresignedR2Url(bucketName, key, 86400 * 7)),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }
}
