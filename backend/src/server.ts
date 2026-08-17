import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDatabase from "./config/database";

const PORT = Number(process.env.PORT) || 8000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 ONEFORM Backend running on port ${PORT}`);
  });
};

startServer();