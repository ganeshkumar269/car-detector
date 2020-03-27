var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const server = require('http').Server(app)
var io = require('socket.io')(server)
// var cv = require('opencv4nodejs')


app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb',extended:true}));
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
    var fs = require('fs');
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
    var result = exec("python ./imai.py " + name);
    console.log(result.toString("utf8"));
    response.redirect('/display');
});

app.post('/uploadBase64',(request,response)=>{
    let dataArrived = request.body.data
    console.log("uploadBase64 request arrived")
    var spawn = require('child_process').spawn,
        py    = spawn('python', ['imaiBase64.py'])
    var dataString

    py.stdout.on('data', function(data){
        var str = t.replace(/\'/g,'\"');
        dataString = JSON.parse(str.toString())
    });
    py.stdout.on('end', function(){
        console.log(dataString)
        response.json(dataString)
    });
    py.stdin.write(JSON.stringify(dataArrived));
    py.stdin.end();
})


app.get("/download" , (request,response)=>{
    response.download("./public/output."+name);
});
var saveImage = false

io.on('connection', function (socket) {
    let spawn = require('child_process').spawn
    let py    = spawn('python', ['imaiBase64.py'])
    py.stdout.on('data', function(data){
        var t = data.toString()
        var str = t.replace(/\'/g,'\"');
        var jsonData = JSON.parse(str.toString())
        console.log("jsonData:",jsonData)
        socket.emit('dataAfterDetection',jsonData)
    });
    py.stdout.on('end', function(){
        console.log("Connection Has been ended")
    });
    py.stderr.on('data',(data)=>console.log(data))
    socket.on('base64Data',(data)=>{
        var dataArrived = data.replace(/^data:image\/jpeg;base64,/, "");
        if(saveImage){
            require("fs").writeFileSync("thisisanimage.jpeg", dataArrived, 'base64', function(err) {
            console.log(err);
            });
        }
        console.log("base64Data socket request arrived")
        console.log("data length:",data.length)
        
        py.stdin.write(dataArrived+"\n")
    })
    io.on('disconnect',()=>{
        py.stdin.end()
    })
    socket.on('hello',(data)=>{console.log("Data: ",data)})

})



server.listen(process.env.PORT || 3000 , (err)=>{
    if(err) throw err;
    console.log("Server Started in port " + 3000);
});