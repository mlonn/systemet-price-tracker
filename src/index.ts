import axios from "axios";
import dotenv from "dotenv";
import { Parser } from "xml2js";
import mongoose from "mongoose";
import ArticleCollection from "./articleSchema";

const xmlurl = "https://www.systembolaget.se/api/assortment/products/xml";

const getXML = async () => {
  console.log("Getting XML");
  const response = await axios.get(xmlurl);
  const xml: string = response.data;
  const parser = new Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xml);
  console.log("Done getting XML");
  return result.artiklar.artikel;
};
const checkArticle = async article => {
  const found = await ArticleCollection.findOne({ nr: article.nr });
  // ArticleCollection.updateOne(
  //   { nr: article.nr },
  //   { $set: article },
  //   { upsert: true },
  //   err => {
  //     if (err) console.log(err);
  //   }
  // );

  if (found && article.Prisinklmoms < found.Prisinklmoms) {
    return { old: found, new: article };
  } else {
    return null;
  }
};
const updateDatabase = async () => {
  const newArticles = await getXML();
  const promises = [];
  for (const article of newArticles) {
    promises.push(checkArticle(article));
  }
  const pricechanges = await Promise.all(promises);
  return pricechanges.filter(change => change !== null);
};
const sendEmail = async () => {};
const init = async () => {
  console.log(process.env.MONGODB_URI);
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const changes = await updateDatabase();
  console.log(changes);
};

dotenv.config();
init();
