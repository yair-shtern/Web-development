import express from "express";
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("<h1>Home Page</h1>")
});

app.listen(port, () => {
    console.log(`Server started on port ${port}.`);
});

app.get("/about", (req, res) => {
    res.send("<h1>About Me</h1><p>My name is Yair.</p>");
});

app.get("/contact", (req, res) => {
    res.send("<h1>Contact Me</h1><p>Phone: 0541234556</p>");
});