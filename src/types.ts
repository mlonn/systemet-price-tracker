import { Document } from "mongoose";
export interface IArticle extends Document {
  nr: string;
  Artikelid: string;
  Varnummer: string;
  Namn: string;
  Namn2: string;
  Prisinklmoms: string;
  Volymiml: string;
  PrisPerLiter: string;
  Saljstart: string;
  Utgått: string;
  Varugrupp: string;
  Typ: string;
  Stil: string;
  Forpackning: string;
  Forslutning: string;
  Ursprung: string;
  Ursprunglandnamn: string;
  Producent: string;
  Leverantor: string;
  Argang: string;
  Provadargang: string;
  Alkoholhalt: string;
  Sortiment: string;
  SortimentText: string;
  Ekologisk: string;
  Etiskt: string;
  Koscher: string;
  RavarorBeskrivning: string;
}

export interface ISubscriber extends Document {
  email: string;
  subscriptions: string[];
}

export interface IChange {
  old: IArticle;
  update: IArticle;
}
