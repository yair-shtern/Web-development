import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

const API_URL = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY";
const yourAPIKey = process.env.API_KEY;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
    const symbol = req.body.symbol;

    try {
        const result = await axios.get(API_URL, {
            params: {
                symbol: symbol,
                // outputsize: 'full',
                apikey: yourAPIKey
            },
        });
        res.render("index.ejs", { data: result.data });
    } catch (error) {
        res.render("index.ejs", { content: error.response ? error.response.data : 'Error fetching data' });
    }
});

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
