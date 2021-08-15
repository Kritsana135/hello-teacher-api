import * as cors from "cors";
import * as express from "express";
import * as morgan from "morgan";
import { createConnection } from "typeorm";

const app = express();
const PORT = 3005;

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

app.listen(PORT, () => {
  console.log(`server listening at port ${PORT}`);
});
