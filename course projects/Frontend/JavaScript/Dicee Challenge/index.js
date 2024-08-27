function play(){
    var randomNumber1 = Math.floor(Math.random() * 6) + 1;
    document.querySelector(".img1").setAttribute("src", "./images/dice" +randomNumber1+".png");

    var randomNumber2 = Math.floor(Math.random() * 6) + 1;
    document.querySelector(".img2").setAttribute("src", "./images/dice" +randomNumber2+".png");

    var result = "";
    if(randomNumber1 > randomNumber2){
        result = "🚩Player 1 Wins!";
    }
    else if(randomNumber2 > randomNumber1){
        result = "Player 2 Wins!🚩";
    }
    else{
        result = "Draw!"
    }
    document.querySelector(".title").innerHTML = result;
}

if (performance.getEntriesByType("navigation")[0].type === "reload") {
    play();
} 