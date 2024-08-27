// $("h1").addClass("big-title").text("Bye.").removeClass("big-title");
// $("body").css("background-color", "lightblue");
// $("button:first").html("<em>Click</em>");
$("button").click(function (){
    $("h1").css("color", "red")
});


$(document).keypress(function(event){
    $("h1").text(event.key)
});

$("h1").on("mouseover", function(){
    $("h1").css("color", "green")
});