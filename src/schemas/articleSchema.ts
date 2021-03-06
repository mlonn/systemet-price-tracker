import { Schema, model } from "mongoose";
import { IArticle } from "../types";

export const articleSchema = new Schema({
  _id: String,
  nr: String,
  Artikelid: String,
  Varnummer: String,
  Namn: String,
  Namn2: String,
  Prisinklmoms: String,
  Volymiml: String,
  PrisPerLiter: String,
  Saljstart: String,
  Utgått: String,
  Varugrupp: String,
  Typ: String,
  Stil: String,
  Forpackning: String,
  Forslutning: String,
  Ursprung: String,
  Ursprunglandnamn: String,
  Producent: String,
  Leverantor: String,
  Argang: String,
  Provadargang: String,
  Alkoholhalt: String,
  Sortiment: String,
  SortimentText: String,
  Ekologisk: String,
  Etiskt: String,
  Koscher: String,
  RavarorBeskrivning: String
});

export default model<IArticle>("Article", articleSchema);
