// Memory controller
var memoryController = (function() {
    let data = {
        titleImages : ["image1.png", "image2.png", "image3.png", "image4.png", "image5.png", "image6.png"],
        gameBoardTitleImages : [],
        cards: [],
        cardsFlippedOver: 0,
        lastCardViewed: -1,
        flipArray: [],
        timer: 0,
        timerReset: -1,
        messageTimer: 0,
        countViewed: 0,
        gameIsFinished: false,
        totalScore: 100
    };

    function shuffleTitleImagesArray(originArr) {
        let newArray = originArr.slice(0),
            c; //copy of old array
        for (c = 0; c < newArray.length; c++) {
            let a, b;
            b = Math.floor(Math.random() * (c + 1));
            a = newArray[c];
            newArray[c] = newArray[b];
            newArray[b] = a;
        }
        return newArray;
    }

    let Card = function(imageName, imageSrc) {
        this.name = imageName;
        this.src = imageSrc;
        this.viewed = false;
    };

    Card.prototype = {
        get setViewed() {
            this.viewed = true;
        },

        get isViewed() {
            return this.viewed;
        }
    };

    let updateViewed = function() {
        // 1. add until all similar cards have found
        data.countViewed++;

        // 2. Set true equal images viewed property
        data.flipArray[0].setViewed;
        data.flipArray[1].setViewed;
    };


    return {
        createGameBoardCards: function() {
            let gameBoardTitleImages, shuffledArray;

            // 1. Create solution array
            data.gameBoardTitleImages = data.titleImages.concat(data.titleImages);

            shuffledArray = shuffleTitleImagesArray(data.gameBoardTitleImages); //old array is unchanged, we created new shuffled array based on unput of our shuffle function

            // 2. Create cards objects array
            data.cards = shuffledArray.map(function (image, index) {
                return new Card("image-" + (index + 1), image);
            });
        },

        showCard: function(id) {
            // Check if not more that two cards were viewed and image has not clicked twice
            let cardsFlippedUnderTwoCards = data.cardsFlippedOver < 2,
                isLastViewedCard = id != data.lastCardViewed,
                allowedToView = !(data.cards[id - 1]).isViewed;

            if (cardsFlippedUnderTwoCards && isLastViewedCard && allowedToView) {
                data.cardsFlippedOver++;
                // Array starts from zero
                data.flipArray.push(data.cards[id - 1]);
                data.lastCardViewed = id;

                return id;
            }
            else {

                return false;
            }
        },

        resetFlip: function() {
            data.flipArray = [];
            data.cardsFlippedOver = 0;
            clearInterval(data.timer);
            data.lastCardViewed = -1;
            data.timerReset = 0;
        },

        resetGame: function() {
            data.countViewed = 0;
            data.gameIsFinished = false;
            data.cards = [];
            data.totalScore = 100;
        },

        checkCardsAreEqual: function() {
            // Checking for are two cards equal
            if (data.flipArray[0].src == data.flipArray[1].src) {
                updateViewed();
                this.resetFlip();
                return true;
            }
            else {
                data.timerReset = 1;
                return false;
            }
        },

        checkGameIsFinished: function() {
            if (data.titleImages.length == data.countViewed) {
                data.gameIsFinished = true;
            }
        },

        getGameBoardCards: function () {
            return data.cards;
        },

        setScore: function() {
            data.totalScore -= 1;
        },

        getScore: function() {
            return data.totalScore;
        },

        getData: function() {
            return data;
        }
    };

})();



// UI controller
let UIController = (function() {
    let DOMStrings = {
        gameBoard: "game-board",
        defaultImage: "happy.png",
        resetBtnContainer: "game-control",
        messageBox: "message",
        gameTime: "game-time",
        card: "<div class='col-lg-2 col-md-3 col-xs-4 game-tile'><div class='game-tile-inside'>" +
        "<img src='img/happy.png' class='flip-image' id='image-%id%'/>"+
        "</div></div>",
        timeDelimiter: ":"
    };



    return {

        displayGameBoardCards: function(cards) {
            let cardsHTML = "", newCard, index, i;

            // 1. Create cards
            for (i in cards) {
                index = String(parseInt(i) + 1);
                newCard = DOMStrings.card.replace("%id%", index);
                cardsHTML += newCard;
            }

            // 2. Add cards to UI
            document.getElementById(DOMStrings.gameBoard).innerHTML = cardsHTML;
        },

        displayCardImage: function(id, image) {
            document.getElementById("image-" + id).src = "img/" + image;
        },

        hideCardImage: function(id) {
            document.getElementById(id).src = "img/" + DOMStrings.defaultImage;
        },

        displayTime: function(time) {
            document.getElementById(DOMStrings.gameTime).textContent = time;
        },

        setMessage: function(message) {
            document.getElementById(DOMStrings.messageBox).textContent = message;
        },

        setButtonText: function(text) {
            document.getElementById(DOMStrings.resetBtnContainer).textContent = text;
        },

        getDOM: function() {
            return DOMStrings;
        }
    }

})();


// Project controller
let projectController = (function(memCtrl, UICtrl) {
    let time = {
            hours: 0,
            minutes: 0,
            seconds: 0
        },
        fullTime,
        DOM,
        gameBoardData,
        eventHandler;

    DOM = UICtrl.getDOM();

    gameBoardData = memCtrl.getData();

    eventHandler = function() {

        window.addEventListener("load", function () {
            // 1. Create cards data
            memCtrl.createGameBoardCards();

            // 2. Add cards to the UI
            UICtrl.displayGameBoardCards(memCtrl.getGameBoardCards());

            // 3. Set message
            setGameMessage("Click a tile to start");
        });

        // When each card was clicked
        document.getElementById(DOM.gameBoard).addEventListener("click", function(event) {

            if (event.target.nodeName === "IMG" && !gameBoardData.gameIsFinished) {
                // 1. Get card id
                let cardId = event.target.id.split("-"),
                    ID,
                    imageToShow;

                ID = cardId[1];

                // 2. Update the card image in UI
                imageToShow = memCtrl.showCard(ID);

                // We allowed to see just two images each time
                if (!isNaN(imageToShow) && imageToShow != "") {
                    // Our data arrays starts from zero
                    UICtrl.displayCardImage(imageToShow, gameBoardData.cards[imageToShow - 1].src);
                }

                // Two cards were selected
                else if (gameBoardData.flipArray.length == 2) {
                    checkTwoCards();
                }
            }
        });

        // When reset button was clicked
        document.getElementById(DOM.resetBtnContainer).addEventListener("click", function() {
            // 1. Reset game score and isFinished variable
            memCtrl.resetGame();

            // 2. Reset and start Calculating time
            resetTime();

            calcTime();

            // 3. Create cards data
            memCtrl.createGameBoardCards();

            // 4. Add cards to the UI
            UICtrl.displayGameBoardCards(memCtrl.getGameBoardCards());

            // 5. Set message
            setGameMessage("Click a tile to start");
        });
    };

    let resetTime = function () {
        clearInterval(fullTime);
        time = {
            hours: 0,
            minutes: 0,
            seconds: 0
        };
    };

    let addTime = function() {
        memCtrl.setScore();
        time.seconds++;

        if (time.seconds >= 60) {
            time.seconds = 0;

            time.minutes++;

            if (time.minutes >= 60) {
                time.minutes = 0;

                time.hours++;
            }
        }

        let timeHours = (time.hours ? (time.hours > 9 ? time.hours : "0" + time.hours) : "00"),
            timeMinutes = (time.minutes ? (time.minutes > 9 ? time.minutes : "0" + time.minutes) : "00"),
            timeSecond = (time.seconds > 9 ? time.seconds : "0" + time.seconds),

            formatTime = timeHours + DOM.timeDelimiter + timeMinutes + DOM.timeDelimiter + timeSecond;

        UICtrl.displayTime(formatTime);

        calcTime();
    };

    let calcTime = function() {
        fullTime = setTimeout(addTime, 1000);
    };

    let setGameMessage = function (message) {
        UICtrl.setMessage(message);
        UICtrl.setButtonText("Restart Game");
        clearInterval(gameBoardData.messageTimer);
    };

    let hideCards = function() {
        if(gameBoardData.timerReset == 1) {
            // 1. Hide cards image in the UI and set it the default
            UICtrl.hideCardImage(gameBoardData.flipArray[0].name);
            UICtrl.hideCardImage(gameBoardData.flipArray[1].name);

            // 2. Reset flip array
            memCtrl.resetFlip();
        }
    };

    let checkTwoCards = function () {
        // Cards are not equal
        if (memCtrl.checkCardsAreEqual() ) {

            // 1. Show message to user
            UICtrl.setMessage("Match Found!");

            // 2. Check game is finished
            memCtrl.checkGameIsFinished();
        }
        else {
            clearInterval(gameBoardData.messageTimer);

            UICtrl.setMessage("Not Found!");

            // Is used for avoiding try to access to cleared variable after calling resetFlip()
            gameBoardData.timer = setInterval(hideCards , 1000);
        }

        if (!gameBoardData.gameIsFinished) {
            gameBoardData.messageTimer = setInterval(setGameMessage, 1000, "Find a match");
        }
        else {
            // 2. check for showing reset button
            UICtrl.setMessage("Game over! your score is " + memCtrl.getScore() + " from 100 :)");

            UICtrl.setButtonText("Play Again");

            resetTime();
        }
    };

    return {
        init: function () {
            // 1. Start Calculating time
            calcTime();

            // 2. Handle events
            eventHandler();

            // 3. Set message
            setGameMessage();
        }
    };
})(memoryController, UIController);

projectController.init();