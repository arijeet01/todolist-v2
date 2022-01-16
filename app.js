const express=require("express");
const date=require(__dirname+"/date.js");
const mongoose=require("mongoose");
const app=express();
const _ = require("lodash");

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://arijeetnayak:nayak@cluster0.iu5m0.mongodb.net/todolistDB");
//mongoose.connect("mongodb+srv://arijeetnayak:nayak@cluster0.iu5m0.mongodb.net/todolistDB");
const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item",itemsSchema);

const item1= new Item({
    name: "Welcome to our Todolist"
});

const item2= new Item({
    name: "Hit + to add an item"
});

const item3= new Item({
    name: "<-- hit this to remove an item"
});

const defaultItems=[item1,item2,item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get('/favicon.ico', (req, res) => res.status(204));   
app.get("/", function(req, res){

    let day = date.getDate();

    Item.find(function(err, foundItems){

        if(foundItems.length===0){
            Item.insertMany(defaultItems, function(err){
                if(err) console.log(err);
                else console.log("Successful !");
              });
              res.redirect("/");
        }
        else{
        res.render("list", {listTitle: day, newListItems: foundItems});
        }

    });
   
});

app.get("/about", function(req, res){
    res.render("about");
});

app.post("/", function(req, res){

    const itemName = req.body.todoinp;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });
    
    if(listName==date.getDate()){
        item.save().then(function(){
        res.redirect("/");
    });
    }
    else{
        List.findOne({name: listName}, function(err, foundItems){
            foundItems.items.push(item);
            foundItems.save().then(function(){
                res.redirect("/"+ listName);
            });
            
        });
    }
    

});

app.post("/delete", function(req, res){

    let checkedItemId = req.body.checkbox;

    const listName = req.body.listName;

    if(checkedItemId){
         checkedItemId=checkedItemId.trim();
    }
   
    if(listName===date.getDate()){
        
    Item.findByIdAndRemove(checkedItemId, function(err){
        if(!err) {
            console.log("Success !");
            res.redirect("/");
        }
    });

    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err) {
                res.redirect("/"+listName);
            }
        });
    }

});

app.get("/:customListName", function(req, res){
   
    const customListName = _.capitalize(req.params.customListName);

    if(customListName==="About"){
        
    }

    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save().then(function(){
                    res.redirect("/"+customListName);
                });

            }
            else{
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });
});


app.listen(3000, function(){
    console.log("server started at port 3000");
});