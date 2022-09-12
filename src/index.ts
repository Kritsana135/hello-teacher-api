require('dotenv').config()
import * as cors from "cors";
import * as express from "express";
import * as morgan from "morgan";
import { createConnection } from "typeorm";
import { getPati, login } from "./controllers/AdminController";
import { addData, getCertificate } from "./controllers/GuestController";
import { authMiddleWare } from "./middleware/authMiddleware";
const app = express();
const PORT = process.env.APP_PORT || 3000;

createConnection().then(() =>
  console.log("connect db successfull! 🥂", new Date().toISOString())
);

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

app.get("/", (_, res) => {
  res.json({
    hello: "world",
  });
});

app.post("/register", addData);
app.post("/certificate", getCertificate);
app.post("/login", login);

app.use(authMiddleWare);
app.get("/pati", getPati);

app.listen(PORT, () => {
  console.log(`server listening at port ${PORT}`);
});
