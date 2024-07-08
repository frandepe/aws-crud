import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { connectDB } from "@/utils/dbConfig";
import productsModel from "@/models/productsModel";
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
    const imageName = generateFileName();
    await connectDB();
    // const {body} = await req.json();
    // const product = productsModel.create(body)
    const formData = await req.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const imageKey = formData.get("imageKey");

    let newProduct = new productsModel({
      name,
      description,
      imageKey,
    });

    if (imageKey && typeof imageKey === "object" && imageKey.name) {
      const Body = (await imageKey.arrayBuffer()) as Buffer;
      const params = {
        Bucket: bucketName,
        Key: imageName,
        Body,
        ContentType: imageKey.type,
      };
      const command = new PutObjectCommand(params);
      await s3.send(command);
      newProduct.imageKey = imageName;
      newProduct = await newProduct.save();

      return NextResponse.json({
        success: true,
        message: "archivo subido",
        data: {
          newProduct,
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

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    await connectDB();
    // Este get no funciona si hay productos sin imagenes
    let products = await productsModel.find();

    for (const product of products) {
      const paramss3 = {
        Bucket: bucketName,
        Key: product.imageKey,
        // ACL: "private"
      };

      const command = new GetObjectCommand(paramss3);
      const url = await getSignedUrl(s3, command, {
        expiresIn: 50000,
      });
      product.imageKey = url;
    }
    console.log("products", products);

    return NextResponse.json(
      { message: "Productos encontrados", products },
      { status: 200 }
    );
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
