$(document).ready(() => {
  console.log("DOC READY!");
  updateThumb();
  //   initializeCarousel();

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
        // updateThumb(gameObject);
        // loadRating(gameID);
        initializeCarousel();
      },
    });
  });


  function updateThumb() {
    $(".thumb").on("click", async function () {
      console.log($(this).css("color"));
      // used rgb values because jquery returns rgb values
      let activeColor = "rgb(0, 128, 0)"; // green
      let inactiveColor = "rgb(0, 0, 0)"; // black
      let gameObject = {
        gameID: $(this).siblings("div").attr("id"),
        title: $(this).siblings("div").attr("class"),
        imageUrl: $(this).siblings("div").attr("src"),
      };

      if ($(this).attr("id") == "thumbs-down") {
        activeColor = "rgb(255, 0, 0)"; // red
      }
      if ($(this).css("color") == inactiveColor) {
        console.log("inside IF");
        await $(this).siblings(".thumb").css("color", inactiveColor);
        await $(this).css("color", activeColor);
        console.log($(this).css("color"), "after");
        updateRating(gameObject, $(this).attr("id"), activeColor);
      } else {
        $(this).css("color", inactiveColor); // resets colors on click
        updateRating(gameObject, $(this).attr("id"), inactiveColor);
      }
    });
  }


  function updateRating(gameObject, rating, action) {
    console.log(gameObject.gameID, gameObject.title, gameObject.imageUrl);
    console.log(rating, action);
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

//   function loadRating(gameID) {
//     $.ajax({
//       method: "get",
//       url: "/api/getRating",
//       data: {
//         gameID: gameID,
//       },
//       success: (data, status) => {
//         try {
//           if (data[0].rating == "thumbs-up") {
//             $("#thumbs-up").css("color", "rgb(0, 128, 0)");
//           } else if (data[0].rating == "thumbs-down") {
//             $("#thumbs-down").css("color", "rgb(255, 0, 0)");
//           }
//         } catch (e) {
//           $(".thumb").css("color", "rgb(0, 0, 0)");
//         }
//       },
//     });
//   }

  function initializeCarousel() {
    $(".carousel").carousel({
      interval: 3000,
    });
  }
});
