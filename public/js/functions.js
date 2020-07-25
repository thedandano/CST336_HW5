$(document).ready(() => {
  console.log("DOC READY!");

  updateThumb();

  /**
   * calls external API for more video game details (e.g., screenshots and descriptions)
   */
  $(".details-btn").on("click", function () {
    let gameID = $(this).attr("id");
    // let name = $(this).parents(".card-body").children("#title").html();
    // let imageUrl = $(this).parents(".card").children(".gameImg").attr("src");
    // console.log(gameID, title, imageUrl);

    // let gameObject = {
    //   gameID: gameID,
    //   title: title,
    //   imageUrl: imageUrl,
    // };
    $.ajax({
      async: false, // turned off async incase someone clicks the link twice
      method: "get",
      url: "/details",
      data: { gameID: gameID },
      success: (response, status) => {
        $("#details").html(response);
        $("#myModal").modal("toggle");
        initializeCarousel();
      },
    });
  });

  /**
   * Initiates event listener for all thumbs which allows thumbs to update
   * ratings in database.
   */
  function updateThumb() {
    $(".thumb").on("click", async function () {
      // used rgb values because jquery returns rgb values
      let activeColor = "rgb(0, 128, 0)"; // green
      const inactiveColor = "rgb(0, 0, 0)"; // black
      const gameObject = {
        gameID: $(this).siblings("div").attr("id"),
        name: $(this).siblings("div").attr("class"),
        imageUrl: $(this).siblings("div").attr("src"),
      };

      if ($(this).attr("id") == "thumbs-down") {
        activeColor = "rgb(255, 0, 0)"; // red
      }
      if ($(this).css("color") == inactiveColor) {
        await $(this).siblings(".thumb").css("color", inactiveColor);
        await $(this).css("color", activeColor);
        updateRating(gameObject, $(this).attr("id"), activeColor);
      } else {
        $(this).css("color", inactiveColor); // resets colors on click
        updateRating(gameObject, $(this).attr("id"), inactiveColor);
      }
    });
  }

  /**
   * Sends rating information to back end database to be updated.
   * @param {Object} gameObject
   * @param {String} rating
   * @param {Color String} action
   */
  function updateRating(gameObject, rating, action) {
    console.log(gameObject.gameID, gameObject.name, gameObject.imageUrl);
    console.log(rating, action);
    $.ajax({
      async: false, // turned off async incase multiple quick requests go through
      method: "get",
      url: "/api/updateRating",
      data: {
        gameID: gameObject.gameID,
        name: gameObject.name,
        imageUrl: gameObject.imageUrl,
        rating: rating,
        action: action,
      },
      success: (data, status) => {},
    });
  }

  /**
   * Initializes the Carousel scrolling effect
   */
  function initializeCarousel() {
    $(".carousel").carousel({
      interval: 3000,
    });
  }
});
