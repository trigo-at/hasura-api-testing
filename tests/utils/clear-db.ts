import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

let connected = false;
const client = new Client(process.env.POSTGRES_CONNECTION);
const getClient = async (): Promise<Client> => {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client;
};

export const closeConnection = async () => {
  if (connected) {
    await client.end();
  }
};

export default async (): Promise<void> => {
  const client = await getClient();
  await client.query("TRUNCATE todo;");
};
