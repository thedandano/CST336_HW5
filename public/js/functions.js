$(document).ready(() => {
  console.log("DOC READY!");

  updateThumb();
  scrollHandler();

  /**
   * calls external API for more video game details (e.g., screenshots and descriptions)
   */
  $(".details-btn").on("click", function () {
    // let gameID = $(this).parents().next("div").children("div").attr("id");
    let gameObject = JSON.parse(
      $(this).parents().next("div").children("div").html().trim()
    );
    let gameID = gameObject.gameID;

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
      let rating = "thumbs-up";

      const inactiveColor = "rgb(0, 0, 0)"; // black
      const gameObject = JSON.parse(
        $(this).siblings(".placeholder").html().trim()
      ); // stored variables in json object in html

      if ($(this).hasClass("fa-thumbs-down")) {
        activeColor = "rgb(255, 0, 0)"; // red
        rating = "thumbs-down";
      }
      if ($(this).css("color") == inactiveColor) {
        await $(this).siblings(".thumb").css("color", inactiveColor);
        await $(this).css("color", activeColor);
        updateRating(gameObject, rating, activeColor);
      } else {
        $(this).css("color", inactiveColor); // resets colors on click
        updateRating(gameObject, rating, inactiveColor);
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
    console.log(gameObject.gameID, gameObject.name, gameObject.imageUrl); // diagnostic
    // console.log(rating, action); // diagnostic
    $.ajax({
      //async: false, // turned off async incase multiple quick requests go through
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
      interval: 2500,
    });
    console.log("carousel initialized");
  }

  /**
   * handles the scroll buttons on webpages
   */
  function scrollHandler() {
    console.log("Scroll handler started");
    /**
     * removes scroll to thumbs-down on all pages but /rated
     */
    if (location.pathname != "/rated") {
      $("#scroll-to-next").removeClass();
      $("#scroll-to-top").css("bottom", 30);
    }

    $(window).scroll(function () {
      let currLoc = $(this).scrollTop();
      // console.log(location.pathname);

      if (currLoc > 20) {
        $("#scroll-to-top").fadeIn();
        $("#scroll-to-next").fadeIn();
      } else {
        $("#scroll-to-top").fadeOut();
        $("#scroll-to-next").fadeOut();
      }
    });

    $("#scroll-to-top").click(function () {
      $("html, body").animate(
        {
          scrollTop: 0,
          // scrollTop: $("#top").offset().top,
        },
        500
      );
      return false;
    });

    $("#scroll-to-next").click(function () {
      $("html, body").animate(
        {
          // scrollTop: 0,
          scrollTop: $("#thumbs-down-div").offset().top - 100,
          // $("#thumbs-down-div").scrollTop(),
        },
        500
      );
      return false;
    });
  }
});
