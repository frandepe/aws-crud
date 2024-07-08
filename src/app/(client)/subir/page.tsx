"use client";

import axios from "axios";
import Image from "next/image";
import { FormEvent, useState } from "react";

export default function SubirPage() {
  const [image, setImage] = useState<string>();
  const [selectedImage, setSelectedImage] = useState<File>();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (selectedImage) {
        const formData = new FormData();
        formData.append("imageKey", selectedImage);
        formData.append("name", name);
        formData.append("description", description);
        const headers = {
          "Content-Type": "multipart/form-data",
        };
        const { data } = await axios.post("/api/image", formData, { headers });
        if (data.success) {
          setImage(data.data.url);
        }
        console.log(data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };
  return (
    <div>
      {image && (
        <Image
          src={image}
          width={200}
          height={200}
          alt={image}
          className="rounded-md"
        />
      )}
      <form onSubmit={onSubmit}>
        <h2>Selecciona tu imagen</h2>
        <input type="file" onChange={handleFileChange} />
        <input type="text" placeholder="name" onChange={handleNameChange} />
        <input
          type="text"
          placeholder="description"
          onChange={handleDescriptionChange}
        />
        <button type="submit" className="bg-blue-500 p-2 rounded-md">
          Submit
        </button>
      </form>
    </div>
  );
}
