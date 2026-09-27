export type Contact = {
  id: string;
  name: string;
  phone: string;
};

export type Message = {
  id: string;
  contactId: string;
  text: string;
  fromMe: boolean;
  ts: number;
};

export type Auth = {
  idInstance: string;
  apiTokenInstance: string;
};