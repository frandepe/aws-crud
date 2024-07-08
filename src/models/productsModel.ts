import mongoose, { Schema } from "mongoose";

interface IProducts {
  name: string;
  description: string;
  imageKey: string;
}

//schema
const ProductSchemma = new mongoose.Schema<IProducts>(
  {
    name: {
      type: String,
      required: [true, "El titulo es requerido"],
    },
    description: {
      type: String,
      required: [true, "La descripción es requerida"],
    },
    imageKey: {
      // esto va a ser la imagen encriptada
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Products ||
  mongoose.model("Products", ProductSchemma);
