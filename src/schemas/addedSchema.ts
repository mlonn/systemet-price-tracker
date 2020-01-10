import { Schema, model } from "mongoose";
import { articleSchema } from "./articleSchema";

const addedSchema = new Schema({
  id: String,
  added: [articleSchema]
});

export default model("AddedArticles-", addedSchema);
