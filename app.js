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
    qs: { ordering: "-rating" }, // qs is needed to append query string
  };
  let featuredArray = await callAPI(options);
  let dbGameDetails = await dbGameData();
  //   console.log(dbGameDetails); // diagnostic
  //   console.log(featuredArray); // diagnostic
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
    res.render("error", { page_name: "error" });
  }
  // found the request dependency documentation
  let options = {
    url: "https://api.rawg.io/api/games",
    headers: {
      "User-Agent": userAgent.toString(), // api requires user-agent
    },
    qs: { page_size: "10", search: keyword }, // qs is needed to append query string
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
      "User-Agent": userAgent.toString(), // required by API
    },
  };
  screenOptions = {
    url: `https://api.rawg.io/api/games/${gameID}/screenshots`,
    headers: {
      "User-Agent": userAgent.toString(),
    },
  };

  // console.log(gameID); // diagnostic
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
  const name = req.query.name;
  const rating = req.query.rating;
  const imageUrl = req.query.imageUrl;
  const action = req.query.action == "rgb(0, 0, 0)" ? 0 : 1;

  //   console.log(
  //     `gameID: ${gameID} \n
  //     name: ${name} \n
  //     rating: ${rating} \n
  //     imageUrl: ${imageUrl} \n
  //     action: ${action}`
  //   ); // diagnostic

  let sql;
  let sqlParams;

  if (action == 1) {
    sql =
      "REPLACE INTO gameRatings (gameID, name, rating, imageUrl) VALUES (?,?,?,?)";
    sqlParams = [gameID, name, rating, imageUrl];
  } else if (action == 0) {
    sql = "DELETE FROM gameRatings WHERE gameID = ?";
    sqlParams = [gameID];
  }

  console.log(sql, sqlParams); // diagnostic

  pool.query(sql, sqlParams, (err, rows, fiels) => {
    if (err) throw err;
    res.send(rows.affectedRows.toString());
  });

  //   console.log(`GameID: ${gameID} Icon: ${icon} action: ${action}`); // diagnostic
});

/**
 * Returns the rated page
 */
app.get("/rated", async (req, res) => {
  let thumbsUpRes = await dbGameData("thumbs-up");
  let thumbsDownRes = await dbGameData("thumbs-down");

  res.render("rated", {
    dbThumbsUp: thumbsUpRes,
    dbThumbsDown: thumbsDownRes,
    page_name: "rated",
  });
});

/**
 * Starts Server
 */
app.listen(process.env.PORT, process.env.IP, () => {
  console.log("Express server is running...");
});

/*
 * *****************************************************************************
 *                             Helper Functions                                *
 * *****************************************************************************
 */

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
 * Overloaded function
 * Pass 1 argument to get the rows with specific ratings
 * Pass NO arguments to get all rows back.
 * @param {String} rating
 */
function dbGameData(rating) {
  //Note to self: need to find a better way of doing "overloading" functions
  let sql;
  let sqlParams;
  switch (arguments.length) {
    case 1:
      sql =
        "SELECT DISTINCT * FROM gameRatings WHERE rating = ? ORDER BY rating DESC, name ";
      sqlParams = rating;

      return new Promise((resolve, reject) => {
        pool.query(sql, sqlParams, (err, rows, field) => {
          if (!err) {
            resolve(rows);
          } else {
            console.log("error", error);
            reject(err);
          }
        });
      });
      break;
    default:
      sql = "SELECT DISTINCT * FROM gameRatings ORDER BY rating DESC, name ";

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
      break;
  }
}
