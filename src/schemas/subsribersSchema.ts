import { Schema, model } from "mongoose";
import { ISubscriber } from "../types";

const subscriberSchema = new Schema({
  email: String,
  subscriptions: [String]
});

export default model<ISubscriber>("Subscribers", subscriberSchema);
