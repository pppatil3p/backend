
import 'dotenv/config';
import connectDB from "./db/index.js";
import mongoose, { connect } from "mongoose";
import { DB_NAME } from "./constatnts.js";
import express from "express";

import { app } from "./app.js";
path:'./.env'
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB", err);
  });
