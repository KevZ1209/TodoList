const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

var item = "";

var workItems = [];
// use ejs as view engine
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// connect to mongoDB
mongoose.connect('mongodb://localhost:27017/todolistDB', { useNewUrlParser: true });


// create new items schema
const itemsSchema = new mongoose.Schema({
  name: String
});

// create mongoose model using the schema
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome!"
});

const item2 = new Item({
  name: "Click the + button to add new items"
});

const item3 = new Item({
  name: "<-- hit checkbox to delete an item"
});

const defaultItems = [item1, item2, item3];

// create a collection of Lists of Items for different routes
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// print out all the items
Item.find(function (err, items) {
  console.log(items);
});

app.get("/", function (req, res) {

  Item.find(function (err, items) {

    if (items.length == 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("success!");
        }
      });
      res.redirect("/");
    }

    res.render("list", { listTitle: "Today", newListItems: items });
  });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // List doesn't exist, so create new list

        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();

        res.redirect("/" + customListName);
      }
      else {
        // List exists, so just show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
})

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.get("/delete", function (req, res) {
  res.redirect("/");
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.deleteOne({ _id: checkedItemId }, function (err) {
      if (!err) {
        console.log("Deleted document with id: " + checkedItemId);
      }
    });
  
    res.redirect("/");
  } 
  else {
    // delete from custom list
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
  

});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started");
});
