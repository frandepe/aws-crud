import productsModel from "@/models/productsModel";
import { connectDB } from "@/utils/dbConfig";
import {
  DeleteObjectCommand,
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

// export const GET = async (
//   req: NextRequest,
//   { params }: { params: { [key: string]: string } }
// ) => {
//   try {
//     await connectDB();

//     const { id } = params;

//     const product = await productsModel.findById(id);

//     return NextResponse.json(
//       { message: "Producto encontrado", product },
//       { status: 200 }
//     );
//   } catch (err) {
//     console.log(err);
//     return new Response("Product no encontrado", { status: 500 });
//   }
// };

export const GET = async (
  req: NextRequest,
  { params }: { params: { [key: string]: string } }
) => {
  try {
    await connectDB();

    const { id } = params;

    const product = await productsModel.findById(id);

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
    return NextResponse.json(
      { message: "Producto encontrado", product },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return new Response("Product no encontrado", { status: 500 });
  }
};

export async function PUT(
  req: any,
  { params }: { params: { [key: string]: string } }
) {
  await connectDB();

  const formData = await req.formData();
  const name = formData.get("name");
  const description = formData.get("description");
  const imageKey = formData.get("imageKey");

  const service = await productsModel.findById(params.id);

  if (!service) {
    return NextResponse.json({ message: "Service not found" }, { status: 404 });
  }

  let updatedProduct = {
    name,
    description,
    imageKey: service.imageKey,
  };

  try {
    if (imageKey && imageKey instanceof File) {
      const imageName = generateFileName();
      const Body = Buffer.from(await imageKey.arrayBuffer());
      const paramss3 = {
        Bucket: bucketName,
        Key: imageName,
        Body,
        ContentType: imageKey.type,
      };

      const command = new PutObjectCommand(paramss3);
      await s3.send(command);

      // Eliminar la imagen anterior de S3 si existe
      if (service.imageKey) {
        const deleteParams = {
          Bucket: bucketName,
          Key: service.imageKey,
        };
        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3.send(deleteCommand);
      }

      updatedProduct.imageKey = imageName;
    }

    const newProd = await productsModel.findByIdAndUpdate(
      params.id,
      updatedProduct,
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Service successfully updated",
        data: newProd,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(
  res: NextResponse,
  { params }: { params: { [key: string]: string } }
) {
  await connectDB();

  try {
    const product = await productsModel.findById(params.id);
    const paramsS3 = {
      Bucket: bucketName,
      Key: product.imageKey,
    };
    const command = new DeleteObjectCommand(paramsS3);
    await s3.send(command);
    await productsModel.findByIdAndDelete(params.id);
    return NextResponse.json({
      message: "Service deleted successfully",
      status: 200,
      success: true,
      data: { product },
    });
  } catch (error: any) {
    return NextResponse.json(error.message, {
      status: 400,
    });
  }
}
