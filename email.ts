import express from "express";
import nodemailer from "nodemailer";
import { randomInt } from "crypto";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
