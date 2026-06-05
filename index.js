import express from "express";
import cors from "cors";
import router from "./Routes/Router/Router.js";

// dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/", router);

console.log("MySQL connected successfully");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
