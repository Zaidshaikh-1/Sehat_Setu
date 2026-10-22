import mongoose from "mongoose";
import { DB_NAME } from "./dbname.js";

const VALID_URI = /^mongodb(\+srv)?:\/\//;
// True only when the URI already names a database, e.g.
// mongodb+srv://user:pass@cluster.mongodb.net/sehat_setu?retryWrites=true
const HAS_DATABASE = /^mongodb(\+srv)?:\/\/[^/?]+\/[^?]+/;

const resolveUri = () => {
  const raw = (process.env.MONGODB_URI || process.env.MONGO_URI || "").trim();

  if (!raw) {
    throw new Error(
      "MONGODB_URI is not set. Add it to the environment (Render dashboard or server/.env).",
    );
  }

  if (!VALID_URI.test(raw)) {
    throw new Error(
      'MONGODB_URI is malformed: it must start with "mongodb://" or "mongodb+srv://".',
    );
  }

  return raw;
};

const getDbName = (uri) =>
  HAS_DATABASE.test(uri) ? uri.split("?")[0].split("/").pop() : DB_NAME;

const connectDb = async () => {
  try {
    const uri = resolveUri();

    // Never concatenate DB_NAME onto the URI: an Atlas URI ends with
    // "?retryWrites=true&w=majority", so appending "/dbname" corrupts the
    // query string into "w=majority/dbname" and every write fails with
    // MongoWriteConcernError. Pass dbName as an option instead.
    const connection = await mongoose.connect(
      uri,
      HAS_DATABASE.test(uri) ? {} : { dbName: DB_NAME },
    );

    console.log(
      `MongoDB connected! Host: ${connection.connection.host}, DB: ${connection.connection.name}`,
    );
  } catch (error) {
    console.error(
      "MONGODB CONNECTION ERROR:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};

export { connectDb, resolveUri, getDbName };
