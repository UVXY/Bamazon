var mysql = require("mysql");
var inquirer = require("inquirer");

// creating connection
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "",
    database: "bamazon_DB"
});

connection.connect(function (err) {
    if (err) throw err;
    // console.log("connected!" + connection.threadId);
    // connection.end();
    runSearch();
})

function runSearch() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "Do you want to post an auction or bid on an aution?",
            choices: ["POST", "BID"]
        }).then(function (answer) {
            if (answer.action.toUpperCase() === "POST") {
                postAuction();
            } else {
                bidAuction();
            }
        })
}

function postAuction() {
    inquirer
        .prompt([{
                name: "item",
                message: "What would you like to post?"
            },
            {
                name: "category",
                message: "What category would you like to place the auction in?"
            },
            {
                name: "startingBid",
                type: "input",
                message: "What would you like your starting bid to be?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    
                    return false;
                }
            }
        ]).then(function(answer){
            connection.query(
                "INSERT INTO auctions SET ?",
                {
                    item_name: answer.item,
                    category: answer.category,
                    starting_bid: answer.starting_bid,
                    highest_bid: answer.starting_bid
                },
                function(err){
                    if (err) throw err;
                    console.log("Your auction was created successfully!");
                    connection.end();
                }
            )
        })
}

function bidAuction(){

    connection.query("SELECT * FROM auctions", function(err, results){
    inquirer
    .prompt([
        {
            name: "choice",
            type: "rawlist",
            choices: function() {
                var choiceArray = [];
                for (var i = 0; i < results.length; i++) {
                    choiceArray.push(results[i].item_name);
                }
                return choiceArray;
            },
            message: "What auction would you like to place a bid in?"
        },
        {
            name: "bid",
            message: "How much would you like to bid?"
        }
    ])
    .then(function(answer){
        var chosenItem;
        for (var i =0; i < results.length; i++) {
            if (results[i].item_name === answer.choice) {
                chosenItem = results[i];
            }
        }
        if (chosenItem.highest_bid < parseInt(answer.bid)) {
            connection.query(
                "UPDATE auctions SET ? WHERE ?",
                [
                    {
                        highest_bid: answer.bid
                    },
                    {
                        id: chosenItem.bid
                    }
                ],
                function(error){
                    if (error) throw err;
                    console.log("Bid placed successfully!")
                    connection.end();
                }
            );
        }
        else {
            console.log("Your bid was too low! Try again...");
            connection.end();
        }
        
        })
    });
}