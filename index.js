const express = require("express");
var bodyParser = require("body-parser");
const { getCountries, addCountry, updateCountry, addCountryPost, updateCountryPost, deleteCountry, getCities, getCity,getHeads, addHead, addHeadPost } = require("./app");

const app = express();
// set engine ejs
app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.get("/", async (req, res, next) => {
  try {
    res.render("index");
  } catch (error) {
    next(error);
  }
});

app.get("/countries", getCountries);

app.get("/countries/add", addCountry);

app.get("/countries/:country/update", updateCountry);

app.post("/countries/add", addCountryPost);

app.post("/countries/:country/update", updateCountryPost);

app.get("/countries/:country/delete", deleteCountry);

app.get("/cities", getCities);

app.get("/cities/:city", getCity);

app.get("/heads-of-states", getHeads);

app.get("/heads-of-states/add", addHead);

app.post("/heads-of-states/add", addHeadPost);

app.listen(3007, () => {
  console.log("Listening on port 3007");
});
