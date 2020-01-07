import axios from "axios";
import dotenv from "dotenv";
import { Parser } from "xml2js";
import mongoose from "mongoose";
import ArticleCollection from "./articleSchema";
import SubscriberCollection from "./subsribersSchema";
import nodemailer from "nodemailer";
import { pre, row, post } from "./html";
import express from "express";
import keepAlive from "./keepAlive";

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
  ArticleCollection.updateOne(
    { nr: article.nr },
    { $set: article },
    { upsert: true },
    err => {
      if (err) console.log(err);
    }
  );
  if (found && article.Prisinklmoms < found.Prisinklmoms) {
    return { old: found, update: article };
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
const sendEmail = async changes => {
  const subscribers = await SubscriberCollection.find({});
  const transporter = nodemailer.createTransport({
    pool: true,
    host: "mail.hover.com",
    port: 465,
    secure: true, // use TLS
    auth: {
      user: process.env.SEND_EMAIL,
      pass: process.env.SEND_PASSWORD
    }
  });
  let html = pre;
  for (const change of changes) {
    const { old, update } = change;
    html = html + row(old, update);
  }
  html = html + post;
  for (const subscriber of subscribers) {
    const message = {
      from: process.env.SEND_EMAIL,
      to: subscriber.email,
      subject: "Price change alert!",
      html
    };
    transporter.verify(function(error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Sending email");
        transporter.sendMail(message);
      }
    });
  }
};

const init = async () => {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const changes = await updateDatabase();
  if (changes.length > 0) {
    sendEmail(changes);
  }
};

const webserver = express();
webserver.use(express.json());
webserver.use(express.urlencoded({ extended: false }));
webserver.get("/", (req, res) => res.send("Alive"));
webserver.set("port", process.env.PORT || 3000);
webserver.listen(webserver.get("port"), () =>
  console.log(`Example app listening on port ${webserver.get("port")}!`)
);
webserver.set(
  "url",
  process.env.APP_URL || "localhost:" + webserver.get("port")
);
keepAlive(webserver);
dotenv.config();
init();
