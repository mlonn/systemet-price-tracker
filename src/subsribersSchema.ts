import { Schema, model } from "mongoose";
const subscriberSchema = new Schema({
  email: String,
  subscriptions: [String]
});

export default model("Subscribers", subscriberSchema);
