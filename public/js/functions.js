$(document).ready(() => {
  console.log("DOC READY!");

  $(".gameImg").on("click", function () {
    let gameID = $(this).attr("id");
    $.ajax({
      method: "get",
      url: "/details",
      data: { gameID: gameID },
      success: (response, status) => {
        $("#details").html(response);
        $("#myModal").modal("toggle");
        updateThumb(gameID);
        loadRating(gameID);
      },
    });
  });

  function updateThumb(gameID) {
    $(".thumb").on("click", function () {
      //   console.log($(this).css("color"));

      if ($(this).css("color") == "rgb(0, 128, 0)") {
        $(".thumb").css("color", "rgb(0,0,0)"); // resets colors on click
        $(this).css("color", "rgb(0, 0, 0)");
        console.log(`ID: ${$(this).attr("id")} COLOR: ${$(this).css("color")}`);
        updateRating(gameID, $(this).attr("id"), $(this).css("color"));
      } else {
        $(".thumb").css("color", "rgb(0,0,0)"); // resets colors on click
        $(this).css("color", "rgb(0, 128, 0)");
        console.log(`ID: ${$(this).attr("id")} COLOR: ${$(this).css("color")}`);
        updateRating(gameID, $(this).attr("id"), $(this).css("color"));
      }
    });
  }

  function updateRating(gameID, icon, action) {
    $.ajax({
      method: "get",
      url: "/api/updateRating",
      data: {
        gameID: gameID,
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
        // console.log(data[0].rating);
        try {
          if (data[0].rating == "thumbs-up") {
            $("#thumbs-up").css("color", "rgb(0, 128, 0)");
            console.log("thumbs up");
          } else if (data[0].rating == "thumbs-down") {
            $("#thumbs-down").css("color", "rgb(128, 0, 0)");
            console.log("thumbs down");
          }
        } catch (e) {
          $(".thumb").css("color", "rgb(0, 0, 0)");
          console.log("no thumbs");
        }
      },
    });
  }
});
