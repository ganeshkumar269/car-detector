var express = require('express');
var bodyParser = require('body-parser');
const fs = require('fs');
var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.set('view engine','ejs');
app.use(express.static('public'));
var name;
var multer = require('multer');
var multerConf = {
    storage : multer.diskStorage({
        destination : function(req,file,next){
            next(null,'./public/');
        },
        filename : (req,file,next)=>{
            console.log(file);
            var ext = file.mimetype.split('/')[1];
            name = ext;
            fname = "inputImage." + name;
            next(null,fname);
        }
    }),
    fileFilter : (req,file,next)=>{
        if(!file) next();
        const image = file.mimetype.startsWith('image/');
        if(image) next(null,true);
        else next({message:"Not Supported File"},false);
    }
}
app.get("/",(request,response)=>{
    console.log("Request recieved");
    response.render('home');
});

app.get('/display',(request,response)=>{
    console.log("display request recieved");
    var filename = "output." + name;
    var count =0 ;
    // fs.readFileSync("tmp.txt",(err,data)=>{
    //     if(err) throw err;
    //     console.log("data in /display : " + data);
    //     count = parseInt(data.toString());
    // });
    count = parseInt(fs.readFileSync("tmp.txt").toString());
    console.log("Count in /display : " + count);
    response.render("display",{name:filename,count:count});
});
app.post('/upload',multer(multerConf).single('photo'),(request,response)=>{
    const exec = require("child_process").execSync;
    var model_exists = fs.readFileSync("model_exists.txt").toString();
    console.log("ResNet Model Exists:" + model_exists);
    if(model_exists != "true"){
        var model_result = exec("gdown --id 1iQOYdqj1K5XiTmoNALvKTAxjt9-pStMi --output resnet.h5");
        console.log(model_result.toString());
        if(typeof(model_result) !== Error)
            fs.writeFileSync("model_exists.txt","true",(err)=>{
                if(err) throw err;
                else console.log("Resnet Has been succesfully downloaded");
            });
    }
    var result = exec("python ./imai.py " + name);
    console.log(result.toString("utf8"));
    response.redirect('/display');
});
app.listen(process.env.PORT || 3000 , (err)=>{
    if(err) throw err;
    console.log("Server Started in port " + 3000);
});