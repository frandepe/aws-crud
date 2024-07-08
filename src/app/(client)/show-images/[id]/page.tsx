import productsModel from "@/models/productsModel";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Image from "next/image";
import React from "react";

const bucketName = process.env.AWS_BUCKET_NAME!;

const ShowImage = async ({ params }: { params: { id: string } }) => {
  const product = await productsModel.findById(params.id);
  const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
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
  console.log(product.imageKey);
  /*
  RECORDATORIO:
  Si queremos que nos devuelva la url completa de la imagen y no solamente el id,
  tenemos que generar un nuevo GetObjectCommand y llegar a product.imageKey = url;
  */

  return (
    <div>
      <h3 className="text-2xl">Producto con el id: {product._id.toString()}</h3>
      <p>Nombre: {product.name}</p>
      <p>Descripcion: {product.description}</p>
      <Image
        src={product.imageKey}
        alt={product.name}
        width={200}
        height={200}
      />
    </div>
  );
};

export default ShowImage;
