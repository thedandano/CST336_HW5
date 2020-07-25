const express = require("express");
const request = require("request");
const UserAgent = require("user-agents");
const dotenv = require("dotenv").config();
const pool = require("./dbPool.js");

const app = express();
const userAgent = new UserAgent();

app.set("view engine", "ejs");
app.use(express.static("public"));

/**
 * Loads Index and pulls data from external api and sends rating info from database.
 */
app.get("/", async (req, res) => {
  let options = {
    url: "https://api.rawg.io/api/games",
    headers: {
      "User-Agent": userAgent.toString(), // api requires user-agent
    },
    qs: { page_size: "5" }, // qs is needed to append query string
  };
  let featuredArray = await callAPI(options);
  let dbGameDetails = await dbGameData();
  //   console.log(dbGameDetails);
  //   console.log(featuredArray);
  res.render("index", {
    gamesArray: featuredArray["results"],
    dbGameDetails: dbGameDetails,
    page_name: "home",
  });
});

/**
 * Handles the user's search and returns the results page with info.
 */
app.get("/search", async (req, res) => {
  let keyword = "";
  let pattern = /^[A-Za-z0-9 _']*[A-Za-z0-9][A-Za-z0-9 _']*$/;

  if (req.query.keyword) {
    keyword = req.query.keyword; // grabs value from input box
  }
  // sends error page for bad search if HTML is bypassed
  if (!pattern.test(keyword)) {
    console.log("i'm here");
    res.render("error", { page_name: "error" });
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
  let dbGameDetails = await dbGameData();
  res.render("results", {
    gamesArray: gamesArray["results"],
    dbGameDetails: dbGameDetails,
    page_name: "results",
  });
});

/**
 * Handles the search which returns additional video game information from external
 * API.
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
  //   console.log(gameDetails);
  res.render("partials/details.ejs", {
    gameDetails: gameDetails,
    gameScreenshots: gameScreenshots,
  });
});

/**
 * Updates the video game rating in the database.
 */
app.get("/api/updateRating", (req, res) => {
  const gameID = req.query.gameID;
  const title = req.query.title;
  const rating = req.query.rating;
  const imageUrl = req.query.imageUrl;
  const action = req.query.action == "rgb(0, 0, 0)" ? 0 : 1;

  //   console.log(
  //     `gameID: ${gameID} \n
  //     title: ${title} \n
  //     rating: ${rating} \n
  //     imageUrl: ${imageUrl} \n
  //     action: ${action}`
  //   );
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
// app.get("/api/getRating", (req, res) => {
//   let gameID = req.query.gameID;
//   let sql = "SELECT rating from gameRatings WHERE gameID = ? ORDER BY gameID";
//   pool.query(sql, gameID, (err, rows, fields) => {
//     if (err) throw err;
//     res.send(rows);
//   });
// });

// app.listen(process.env.PORT, process.env.IP, () => {
//   console.log("Express server is running...");
// });

/**
 * Returns the rated page
 */
app.get("/rated", async (req, res) => {
  let rows = await dbGameData();
  res.render("rated", { gameDetails: rows, page_name: "rated" });
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

/**
 * Calls the database for stored video game info.
 */
function dbGameData() {
  let sql = "SELECT DISTINCT * FROM gameRatings ORDER BY rating DESC, title ";

  var gameIDs = [];
  return new Promise((resolve, reject) => {
    pool.query(sql, (err, rows, field) => {
      if (!err) {
        resolve(rows);
      } else {
        console.log("error", error);
        reject(err);
      }
    });
  });
}
