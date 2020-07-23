const express = require("express");
const request = require("request");
const UserAgent = require("user-agents");
const dotenv = require("dotenv").config();

const app = express();
const userAgent = new UserAgent();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

/**
 * Search
 */
app.get("/search", async (req, res) => {
  let keyword = "";
  if (req.query.keyword) {
    keyword = req.query.keyword; // grabs value from input box
  }
  // found the request dependency documentation
  let options = {
    url: "https://api.rawg.io/api/games",
    headers: {
      "User-Agent": userAgent.toString(), // api requires user-agent
    },
    qs: { page_size: "5", search: keyword }, // qs is needed to append query string
  };

  let gamesArray = await callAPI(options);
  res.render("results", { gamesArray: gamesArray["results"] });
});

/**
 * Details
 */
app.get("/details", async (req, res) => {
  let gameID = req.query.gameID;

  options = {
    url: `https://api.rawg.io/api/games/${gameID}`,
    headers: {
      "User-Agent": userAgent.toString(),
    },
    // useQuerystring: true,
    // qs: { gameID },
  };

  console.log(gameID); // tracer
  let gameDetails = await callAPI(options);
  //   console.log(gameDetails);
  return res.redirect("details", { gameDetails: gameDetails });
});

app.listen(process.env.PORT, process.env.IP, () => {
  console.log("Express server is running...");
});

/**
 * Takes an objects object refer to the documentation
 * https://github.com/request/request#forms
 * @param {object} options
 * @returns the parsed request
 */
function callAPI(options) {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let parsedData = JSON.parse(body);
        console.log("success"); //tracer
        resolve(parsedData);
      } else {
        console.log("error", error);
        console.log("statusCode:", response && response.statusCode);
        reject(error);
      }
    });
  });
}
