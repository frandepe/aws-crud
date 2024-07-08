"use client";

import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface ProductsProps {
  name: string;
  description: string;
  imageKey: string;
  _id: string;
}

export default function ShowImages() {
  const [showImages, setShowImages] = useState<any>([]);
  useEffect(() => {
    const getProducts = async () => {
      const products = await axios.get("/api/image");
      setShowImages(products.data.products);
    };
    getProducts();
  }, []);
  console.log(showImages);

  return (
    <section>
      <h2 className="text-2xl">Show Products:</h2>
      <div className="flex items-center justify-between">
        {showImages.map((e: ProductsProps) => (
          <div key={e._id}>
            <p>{e.name}</p>
            <Image alt={e.name} src={e.imageKey} width={200} height={200} />
            <a href={`/edit-image/${e._id}`}>
              <button className="p-2 border-gray-600 border-2 bg-blue-600 mr-2">
                Editar
              </button>
            </a>
            <a href={`/show-images/${e._id}`}>
              <button className="p-2 border-gray-600 border-2 bg-blue-600">
                Ver
              </button>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
