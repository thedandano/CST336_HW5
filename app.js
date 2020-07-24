const express = require("express");
const request = require("request");
const UserAgent = require("user-agents");
const dotenv = require("dotenv").config();
const pool = require("./dbPool.js");

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

  detailOptions = {
    url: `https://api.rawg.io/api/games/${gameID}`,
    headers: {
      "User-Agent": userAgent.toString(),
    },
  };
  screenOptions = {
    url: `https://api.rawg.io/api/games/${gameID}/screenshots`,
    headers: {
      "User-Agent": userAgent.toString(),
    },
  };

  console.log(gameID); // tracer
  let gameDetails = await callAPI(detailOptions);
  let gameScreenshots = await callAPI(screenOptions);

  res.render("partials/details.ejs", {
    gameDetails: gameDetails,
    gameScreenshots: gameScreenshots,
  });
});

/**
 * Update Ratings API
 */
app.get("/api/updateRating", (req, res) => {
  const gameID = req.query.gameID;
  const title = req.query.title;
  const rating = req.query.rating;
  const imageUrl = req.query.imageUrl;
  const action = req.query.action == "rgb(0, 0, 0)" ? 0 : 1;

  console.log(
    `gameID: ${gameID} \n
    title: ${title} \n
    rating: ${rating} \n
    imageUrl: ${imageUrl} \n
    action: ${action}`
  );
  let sql;
  let sqlParams;

  if (action == 1) {
    sql =
      "REPLACE INTO gameRatings (gameID, title, rating, imageUrl) VALUES (?,?,?,?)";
    sqlParams = [gameID, title, rating, imageUrl];
    console.log(sql);
  } else if (action == 0) {
    sql = "DELETE FROM gameRatings WHERE gameID = ?";
    sqlParams = [gameID];
    console.log(sql);
  }
  pool.query(sql, sqlParams, (err, rows, fiels) => {
    if (err) throw err;
    res.send(rows.affectedRows.toString());
  });

  //   console.log(`GameID: ${gameID} Icon: ${icon} action: ${action}`);
});

/**
 * get Ratings
 */
app.get("/api/getRating", (req, res) => {
  let gameID = req.query.gameID;
  let sql = "SELECT rating from gameRatings WHERE gameID = ? ORDER BY gameID";
  pool.query(sql, gameID, (err, rows, fields) => {
    if (err) throw err;
    res.send(rows);
  });
});

app.listen(process.env.PORT, process.env.IP, () => {
  console.log("Express server is running...");
});

app.get("/rated", (req, res) => {
  let sql = "SELECT DISTINCT * FROM gameRatings ORDER BY rating DESC, title ";

  var gameIDs = [];

  pool.query(sql, (err, rows, field) => {
    if (err) throw err;

    res.render("rated", { gameDetails: rows });
  });
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
        // console.log("success"); //tracer
        resolve(parsedData);
      } else {
        console.log("error", error);
        console.log("statusCode:", response && response.statusCode);
        reject(error);
      }
    });
  });
}
