const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));




mongoose.connect("mongodb://localhost:27017/TOdolistDB");




const itemsSchema = new mongoose.Schema({
    item: String
})


const itemsModel = mongoose.model("item", itemsSchema);

const item1 = new itemsModel({
    item: "hello welcome guys"
})
const item2 = new itemsModel({
    item: "This is a defualt list, type and add new items"
})
const item3 = new itemsModel({
    item: "click on the list items to delete items"
})



const defaultItems = [item1, item2, item3];




const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const listModel = mongoose.model("list", listSchema);




app.get("/", function (req, res) {

    itemsModel.find({}, function (err, foundList) {
        if (foundList.length === 0) {

            itemsModel.insertMany(defaultItems, function (err) {
                if (!err) {
                    console.log("Successfully inserted");
                }
            }); res.redirect("/");
        } else {
            res.render("lists", { listTitle: "Today", newListItemArray: foundList });
        }
    });

});






app.get("/:customName", function (req, res) {
    let newRoutes = _.capitalize(req.params.customName);
    listModel.findOne({ name: newRoutes }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const listItem = new listModel({
                    name: newRoutes,
                    items: defaultItems
                })
                listItem.save();
                res.redirect("/" + newRoutes)
            } else {
                res.render("lists", { listTitle: newRoutes, newListItemArray: foundList.items })
            }
        }
    });

});






app.post("/", function (req, res) {
    const newItem = req.body.newItem;
    const addWhere = _.capitalize(req.body.addWhere);
    console.log(req.body);

    const item0 = new itemsModel({
        item: newItem
    })

    if (addWhere === "Today") {
        item0.save();
        res.redirect("/");
    } else{
        listModel.findOne({name: addWhere}, function(err, foundList){
            if(!err){
               foundList.items.push(item0);
               foundList.save();
               res.redirect("/"+ addWhere);
              
            }
        });
    }

    }
);



app.post("/delete", function (req, res) {
    let checkedItem = req.body.checkbox;
    const listName = req.body.listName;
    
    if(listName === "Today"){
    listModel.findByIdAndDelete(checkedItem, function (err) {
        if (!err) {
            console.log("Successfully Deleted");
        }
    });
    res.redirect("/");
}else{
    listModel.findOneAndUpdate({name: listName}, {$pull:{items: {_id:checkedItem}}},function(err,foundList){
        if(!err){
            res.redirect("/" + listName);
        }
    })
}
});




app.listen(3000, () => {
    console.log("Server is working on port 3000");
})