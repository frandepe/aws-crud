"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function EditImage() {
  const { id: _id } = useParams();
  console.log(_id);
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
        const { data } = await axios.put(`/api/image/${_id}`, formData, {
          headers,
        });
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
          Editar
        </button>
      </form>
    </div>
  );
}
