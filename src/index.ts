import axios from "axios";
import dotenv from "dotenv";
import { Parser } from "xml2js";
import mongoose from "mongoose";
import ArticleCollection from "./articleSchema";
import SubscriberCollection from "./subsribersSchema";
import ChangeCollection from "./changesSchema";
import nodemailer from "nodemailer";
import { pre, row, post } from "./html";
import schedule from "node-schedule";

const xmlurl = "https://www.systembolaget.se/api/assortment/products/xml";

const getXML = async () => {
  const response = await axios.get(xmlurl);
  const xml: string = response.data;
  const parser = new Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xml);
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
const updateDatabase = async newArticles => {
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

const run = async () => {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log("Getting XML");
  const newArticles = await getXML();
  console.log("Done getting XML");
  console.log("Checking for changes");
  const changes = await updateDatabase(newArticles);
  console.log(`Done checking for changes, found ${changes.length}`);

  if (changes.length > 0) {
    const changeDocument = new ChangeCollection({
      id: getDateString(new Date()),
      changes
    });
    changeDocument.save();
    sendEmail(changes);
  }
};
const getDateString = date => {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  day = day < 10 ? `0${day}` : day;
  month = month < 10 ? `0${month}` : month;
  return `${year}-${month}-${day}`;
};
schedule.scheduleJob("0 8 * * *", async err => {
  run();
});
dotenv.config();
