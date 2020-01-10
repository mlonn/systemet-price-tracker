import axios from "axios";
import dotenv from "dotenv";
import { Parser } from "xml2js";
import mongoose from "mongoose";
import ArticleCollection from "./articleSchema";
import SubscriberCollection from "./subsribersSchema";
import ChangeCollection from "./changesSchema";
import nodemailer from "nodemailer";
import { pre, row, post } from "./html";
import { IChange, IArticle } from "./types";

const xmlurl = "https://www.systembolaget.se/api/assortment/products/xml";

const getXML = async () => {
  const response = await axios.get(xmlurl);
  const xml: string = response.data;
  const parser = new Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xml);
  return result.artiklar.artikel;
};

const findOldArticle = async (oldArticles: IArticle[], article: IArticle) => {
  while (true) {
    if (oldArticles.length === 0) {
      break;
    }
    const current = oldArticles[0];
    const currentNr = parseInt(current.nr);
    const articleNr = parseInt(article.nr);
    if (current.nr === article.nr) {
      oldArticles.shift();
      return current;
    } else if (currentNr < articleNr) {
      console.log(`Searching for ${article.nr} but found ${current.nr}`);
      console.log(`Removing old article with nr ${current.nr}`);
      await ArticleCollection.deleteOne({ nr: current.nr });
      oldArticles.shift();
    } else if (currentNr > articleNr) {
      console.log(`Searching for ${article.nr} but found ${current.nr}`);
      console.log(`Adding new article with nr ${article.nr}`);
      await ArticleCollection.updateOne(
        { nr: article.nr },
        { $set: article },
        { upsert: true },
        err => {
          if (err) console.log(err);
        }
      );
      break;
    }
  }
};
const updateDatabase = async (newArticles: IArticle[]) => {
  const pricechanges = [];
  let oldArticles = await ArticleCollection.find();
  oldArticles = oldArticles.sort((a, b) => parseInt(a.nr) - parseInt(b.nr));
  newArticles = newArticles.sort((a, b) => parseInt(a.nr) - parseInt(b.nr));

  console.log(oldArticles.length, oldArticles[0].nr);
  console.log(newArticles.length, newArticles[0].nr);
  for (const article of newArticles) {
    const found = await findOldArticle(oldArticles, article);
    if (found && article.Prisinklmoms < found.Prisinklmoms) {
      const change: IChange = { old: found, update: article };
      await ArticleCollection.updateOne(
        { nr: article.nr },
        { $set: article },
        { upsert: true },
        err => {
          if (err) console.log(err);
        }
      );
      pricechanges.push(change);
    }
  }
  return pricechanges;
};
const sendEmail = async (changes: (IChange | undefined)[]) => {
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
    if (change) {
      const { old, update } = change;
      html = html + row(old, update);
    }
  }
  html = html + post;
  for (const subscriber of subscribers) {
    console.log(`Sending email to ${subscriber.email}`);
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
        transporter.sendMail(message);
      }
    });
  }
};
const saveChanges = async (changes: (IChange | undefined)[]) => {
  const changeDocument = new ChangeCollection({
    id: getDateString(new Date()),
    changes
  });
  await changeDocument.save();
};
const run = async () => {
  if (process.env.MONGODB_URI)
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
    await saveChanges(changes);
    console.log("Sending email");
    await sendEmail(changes);
    console.log("Done sending email");
  }
  mongoose.connection.close();
};
const getDateString = (date: Date) => {
  const year: number | string = date.getFullYear();
  let month: number | string = date.getMonth() + 1;
  let day: number | string = date.getDate();
  day = day < 10 ? `0${day}` : day;
  month = month < 10 ? `0${month}` : month;
  return `${year}-${month}-${day}`;
};
console.log(new Date());
dotenv.config();
run();
