import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const bucketName = process.env.AWS_BUCKET_NAME!;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const image = formData.get("image");

    if (image && typeof image === "object" && image.name) {
      const Body = (await image.arrayBuffer()) as Buffer;
      const params = {
        Bucket: bucketName,
        Key: image.name,
        // Key: generateFileName(),
        Body,
        ContentType: image.type,
      };
      const command = new PutObjectCommand(params);
      await s3.send(command);
      const getObjectParams = {
        Bucket: bucketName,
        Key: image.name, // aca se podria poner image.name + session.user._id
        // Key: generateFileName(),
        ACL: "private",
      };
      const getCommand = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, getCommand, {
        expiresIn: 50000,
      });
      return NextResponse.json({
        success: true,
        message: "archivo subido",
        data: {
          url,
        },
        status: 200,
      });
    }

    return NextResponse.json({
      success: false,
      message: "image required",
      status: 400,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        }
      );
    }
  }
}

// ESTE COMPONENTE ESTÁ INUTILIZADO Y NO SIRVE
