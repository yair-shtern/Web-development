import express from "express";
const app = express();
const port = 3000;


app.get("/", (req, res) => {
    const date = new Date();

    let type = "weekday";
    let adv = "it's time to work hard";
    if (date.getDay() >= 5) {

        type = "weekend";
        adv = "it's time to have fun";
    }

    res.render("index.ejs",
        { dayType: type, advice: adv }
    );
});

app.listen(port, (req, res) => {
    console.log(`server running on port ${port}.`);
});