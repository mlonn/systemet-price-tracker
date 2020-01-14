import { Schema, model } from "mongoose";
import { articleSchema } from "./articleSchema";

const removedSchema = new Schema({
  _id: String,
  removed: [articleSchema]
});

export default model("RemovedArticles", removedSchema);
