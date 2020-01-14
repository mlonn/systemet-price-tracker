import { Schema, model } from "mongoose";
import { articleSchema } from "./articleSchema";

const change = {
  update: articleSchema,
  old: articleSchema
};

const changeSchema = new Schema({
  _id: String,
  changes: [change]
});

export default model("Changes", changeSchema);
