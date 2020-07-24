$(document).ready(() => {
  console.log("DOC READY!");

  $(".gameImg").on("click", function () {
    let gameID = $(this).attr("id");
    let imageUrl = $(this).attr("src");
    let title = $(this).next("#title").val();
    $.ajax({
      async: false, // turned off async incase someone clicks the link twice
      method: "get",
      url: "/details",
      data: { gameID: gameID },
      success: (response, status) => {
        $("#details").html(response);
        $("#myModal").modal("toggle");
        updateThumb(gameID);
        loadRating(gameID);
        console.log(`gameID: ${gameID} imageUrl: ${imageUrl} title: ${title}`);
      },
    });
  });

  function updateThumb(game) {
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
        updateRating(game, $(this).attr("id"), $(this).css("color"));
      } else {
        $(".thumb").css("color", inactiveColor); // resets colors on click
        $(this).css("color", inactiveColor);
        updateRating(game, $(this).attr("id"), $(this).css("color"));
      }
    });
  }

  function updateRating(game, icon, action) {
    $.ajax({
      async: false, // turned off async incase multiple quick requests go through
      method: "get",
      url: "/api/updateRating",
      data: {
        gameID: game.id,
        title: game.name,
        imageUrl: game.background_image,
        icon: icon,
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

  //   $(window).on("load", () => {
  //     console.log("ratings loaded");
  //     let gameDetails = $("#gameDetails").val();
  //     console.log(gameDetails);
  //     // loadRating();
  //   });
});
