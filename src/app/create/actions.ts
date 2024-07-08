"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import crypto from "crypto";
// Opción 1
const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

// Opción 2
// const generateFileName = (bytes = 32) => {
//     const array = new Uint8Array(bytes)
//     crypto.getRandomValues(array)
//     return [...array].map((b) => b.toString(16).padStart(2, "0")).join("")
// }

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const acceptedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "/image/gif",
  "video/mp4",
  "video/webm",
];

const maxFileSize = 1024 * 1024 * 10; //10MB

export async function getSignedURL(
  type: string,
  size: number,
  checksum: string
) {
  if (!acceptedTypes.includes(type)) {
    return { failure: "Invalid file type" };
  }
  if (size > maxFileSize) {
    return { failure: "File too large" };
  }
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: generateFileName(), // cada imagen necesita una key única
    ContentType: type,
    ContentLength: size,
    ChecksumSHA256: checksum,
    Metadata: {
      userId: "asd123",
      // userId: session.user.id
    },
  });
  const signedURL = await getSignedUrl(s3, putObjectCommand, {
    expiresIn: 60,
  });

  const mediaResult = signedURL.split("?")[0];
  console.log(mediaResult); // Esto va a la db

  return { success: { url: signedURL } };
}
