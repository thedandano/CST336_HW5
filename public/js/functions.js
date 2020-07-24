$(document).ready(() => {
  console.log("DOC READY!");

  $(".details-btn").on("click", function () {
    let gameID = $(this).attr("id");
    let title = $(this).parents(".card-body").children("#title").html();
    let imageUrl = $(this).parents(".card").children(".gameImg").attr("src");
    console.log(gameID, title, imageUrl);

    let gameObject = {
      gameID: gameID,
      title: title,
      imageUrl: imageUrl,
    };
    $.ajax({
      async: false, // turned off async incase someone clicks the link twice
      method: "get",
      url: "/details",
      data: { gameID: gameID },
      success: (response, status) => {
        $("#details").html(response);
        $("#myModal").modal("toggle");
        updateThumb(gameObject);
        loadRating(gameID);
        initializeCarousel();
      },
    });
  });

  function updateThumb(gameObject) {
    $(".thumb").on("click", function () {
      // used rgb values because jquery returns rgb values
      let activeColor = "rgb(0, 128, 0)"; // green
      let inactiveColor = "rgb(0, 0, 0)"; // black

      // checks for which thumb was clicked and changes color
      if ($(this).attr("id") == "thumbs-down") {
        activeColor = "rgb(128, 0, 0)"; // red
      }

      if ($(this).css("color") == inactiveColor) {
        $(".thumb").css("color", inactiveColor); // resets colors on click
        $(this).css("color", activeColor);
        updateRating(gameObject, $(this).attr("id"), $(this).css("color"));
      } else {
        $(".thumb").css("color", inactiveColor); // resets colors on click
        $(this).css("color", inactiveColor);
        updateRating(gameObject, $(this).attr("id"), $(this).css("color"));
      }
    });
  }

  function updateRating(gameObject, rating, action) {
    console.log(gameObject.gameID, gameObject.title, gameObject.imageUrl);
    $.ajax({
      async: false, // turned off async incase multiple quick requests go through
      method: "get",
      url: "/api/updateRating",
      data: {
        gameID: gameObject.gameID,
        title: gameObject.title,
        imageUrl: gameObject.imageUrl,
        rating: rating,
        action: action,
      },
      success: (data, status) => {},
    });
  }

  function loadRating(gameID) {
    $.ajax({
      method: "get",
      url: "/api/getRating",
      data: {
        gameID: gameID,
      },
      success: (data, status) => {
        try {
          if (data[0].rating == "thumbs-up") {
            $("#thumbs-up").css("color", "rgb(0, 128, 0)");
          } else if (data[0].rating == "thumbs-down") {
            $("#thumbs-down").css("color", "rgb(128, 0, 0)");
          }
        } catch (e) {
          $(".thumb").css("color", "rgb(0, 0, 0)");
        }
      },
    });
  }

  function initializeCarousel() {
    $(".carousel").carousel({
      interval: 3000,
    });
  }
});
