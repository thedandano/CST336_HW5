$(document).ready(() => {
  console.log("DOC READY!");

  $(".gameImg").on("click", function () {
    let gameID = $(this).attr("id");
    $.ajax({
      method: "get",
      url: "/details",
      data: { gameID: gameID },
      success: (data, status) => {},
    });
  });
});
