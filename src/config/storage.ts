import { S3Client } from "@aws-sdk/client-s3";

export type StorageConfig = {
  region: string;
  bucket: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  publicBaseUrl?: string;
  keyPrefix: string;
};

const DEFAULT_PREFIX = "uploads";

function normalizePrefix(prefix?: string) {
  if (!prefix) return DEFAULT_PREFIX;
  return prefix.replace(/^\/+|\/+$/g, "");
}

export function getStorageConfig(): StorageConfig {
  const region = process.env.AWS_REGION || process.env.S3_REGION || "";
  const bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET || "";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY;
  const endpoint = process.env.S3_ENDPOINT || process.env.AWS_S3_ENDPOINT;
  const publicBaseUrl =
    process.env.S3_PUBLIC_BASE_URL || process.env.AWS_S3_PUBLIC_BASE_URL;
  const keyPrefix = normalizePrefix(
    process.env.AWS_S3_KEY_PREFIX || process.env.S3_KEY_PREFIX,
  );

  const resolvedRegion = region || (endpoint ? "auto" : "");
  if (!resolvedRegion) {
    throw new Error("S3 region is required for uploads");
  }
  if (!bucket) {
    throw new Error("S3 bucket is required for uploads");
  }

  return {
    region: resolvedRegion,
    bucket,
    accessKeyId,
    secretAccessKey,
    endpoint,
    publicBaseUrl,
    keyPrefix,
  };
}

export function getS3Client() {
  const config = getStorageConfig();

  const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: Boolean(config.endpoint),
  };

  if (config.accessKeyId && config.secretAccessKey) {
    return new S3Client({
      ...clientConfig,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return new S3Client(clientConfig);
}

export function buildPublicUrl(key: string) {
  const { bucket, region, publicBaseUrl, endpoint } = getStorageConfig();
  const trimmedKey = key.replace(/^\/+/, "");
  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/+$/, "")}/${trimmedKey}`;
  }
  if (endpoint) {
    return `${endpoint.replace(/\/+$/, "")}/${bucket}/${trimmedKey}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${trimmedKey}`;
}

export function buildObjectKey(filename: string, folder?: string) {
  const { keyPrefix } = getStorageConfig();
  const parts = [keyPrefix, folder, filename].filter(Boolean).map((part) =>
    (part as string).replace(/^\/+|\/+$/g, "")
  );
  return parts.join("/");
}
