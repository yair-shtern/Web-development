import express from "express";
import bodyParser from "body-parser";
import session from "express-session";

const app = express();
const port = 3000;
// const names = ["yair", "Yair"];
let recipesItems = [];

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

function checkName(req, res, next) {
    const fName = req.body["fName"];
    const lName = req.body["lName"];
    // if (names.includes(fName) && (lName === "shtern" || lName === "Shtern")) {
    if (fName && lName) {
        req.session.isAuthorized = true;
        req.session.fName = fName[0].toUpperCase() + fName.slice(1).toLowerCase();
        req.session.lName = lName[0].toUpperCase() + lName.slice(1).toLowerCase();
    }
    // }
    next();
}

app.use(checkName);

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/add-recipe", (req, res) => {
    res.render("partials/add-recipe.ejs");
});

app.get("/home", (req, res) => {
    if (req.session.isAuthorized) {
        res.render("partials/home.ejs", {
            firstName: req.session.fName,
            lastName: req.session.lName
        });
    } else {
        res.redirect("/");
    }
});

app.get("/recipes", (req, res) => {
    if (req.session.isAuthorized) {
        res.render("partials/recipes.ejs", { recipes: recipesItems });
    } else {
        res.render("index.ejs");
    }
});

app.get("/recipe/:recipeName", (req, res) => {
    const recipeName = req.params.recipeName;
    const recipe = recipesItems.find(recipe => recipe.recipeName === recipeName);
    if (recipe) {
        res.render("partials/recipe-details.ejs", { recipe });
    } else {
        res.status(404).send("Recipe not found");
    }
});

app.get("/editRecipe/:recipeName", (req, res) => {
    const recipeName = req.params.recipeName;
    const recipe = recipesItems.find(recipe => recipe.recipeName === recipeName);
    if (recipe) {
        res.render("partials/edit-recipe.ejs", { recipe });
    } else {
        res.status(404).send("Recipe not found");
    }
});

app.post("/updateRecipe", (req, res) => {
    const { originalRecipeName, recipeName, ingredients, instructions } = req.body;

    // Find the recipe in the recipesItems array and update it
    const recipeToUpdate = recipesItems.find(recipe => recipe.recipeName === originalRecipeName);
    if (recipeToUpdate) {
        recipeToUpdate.recipeName = recipeName;
        recipeToUpdate.ingredients = JSON.parse(ingredients);
        recipeToUpdate.instructions = JSON.parse(instructions);
        res.redirect(`/recipe/${recipeName}`);
    } else {
        res.status(404).send("Recipe not found");
    }
});

app.post("/addItem", (req, res) => {
    if (req.session.isAuthorized) {
        const newItem = {
            recipeName: req.body.recipeName,
            ingredients: req.body.ingredients,
            instructions: req.body.instructions
        };
        recipesItems.push(newItem);
    }

    res.redirect("/home");
});

app.post("/home", (req, res) => {
    if (req.session.isAuthorized) {
        res.render("partials/home.ejs", {
            firstName: req.session.fName,
            lastName: req.session.lName
        });
    } else {
        res.redirect("/");
    }
});

app.post('/deleteItem', (req, res) => {
    const recipeName = req.body.itemToDelete;

    console.log('Delete item:', recipeName);

    // Filter out the recipe to delete from recipesItems
    recipesItems = recipesItems.filter(recipe => recipe.recipeName !== recipeName);

    res.redirect("/home");
});


app.post('/saveRecipe', (req, res) => {
    let ingredientsArray = [];
    let instructionsArray = [];

    try {
        ingredientsArray = JSON.parse(req.body.ingredients) || [];
    } catch (e) {
        ingredientsArray = [];
    }

    try {
        instructionsArray = JSON.parse(req.body.instructions) || [];
    } catch (e) {
        instructionsArray = [];
    }
    const recipeName = req.body.recipeName;

    console.log('Received name:', recipeName);
    console.log('Received ingredients:', ingredientsArray);
    console.log('Received instructions:', instructionsArray);

    const newRecipe = {
        recipeName: recipeName,
        ingredients: ingredientsArray,
        instructions: instructionsArray
    };

    recipesItems.push(newRecipe);
    res.redirect("/home");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
