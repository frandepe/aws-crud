"use client";

import { useState } from "react";
import { getSignedURL } from "../app/create/actions";

export default function Home() {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);

  const computeSHA256 = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setLoading(true);
    //algo aca
    console.log({ file });
    try {
      if (file) {
        setStatusMessage("uploading file");
        const checksum = await computeSHA256(file);
        const signedURLResult = await getSignedURL(
          file.type,
          file.size,
          checksum
        );

        const url = signedURLResult.success!.url;
        await fetch(url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });
      }
    } catch (e) {
      setStatusMessage("failed");
      console.log(e);
    } finally {
      setLoading(false);
    }
    setStatusMessage("created");
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFile(file);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    } else {
      setFileUrl(undefined);
    }
  };

  return (
    <main>
      <div>
        <ol>
          <li>
            <h3>Navbar:</h3>
          </li>
          <li className="text-blue-700">
            <a href="/subir">Subir producto de una sola imagen</a>
          </li>
          <li className="text-blue-700">
            <a href="/show-images">
              Ver todos los productos de una sola imagen
            </a>
          </li>
          <li className="text-blue-700 border-t border-red-700">
            <a href="/subir-muchas-imagenes">
              Subir productos con muchas imagenes
            </a>
          </li>
          <li className="text-blue-700">
            <a href="/mostrar-productos-muchas-imagenes">
              Ver todos los productos con muchas imagenes
            </a>
          </li>
        </ol>
      </div>
      <div className="flex flex-col items-center justify-between p-24">
        SUBIENDO IMAGE A AWS CON ACTIONS
        <form onSubmit={handleSubmit}>
          <input type="file" placeholder="photo" onChange={handleChange} />
          <button>Subir</button>
        </form>
        <p>{statusMessage}</p>
      </div>
    </main>
  );
}
