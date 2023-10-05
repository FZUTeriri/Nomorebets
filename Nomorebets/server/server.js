const https=require('https');
const http=require('http');
const mysql=require('mysql');
const fs=require('fs');
const path=require('path');
const WebSocket=require('ws');
const websocket=require('ws').Server;
const waitingClients = new Set();
const roommap=new Map(); 

const connection = mysql.createConnection({
    //连接的地址
    host:'localhost',
    //数据库连接用户名
    user:'root',
    //密码
    password:'',
    //连接的数据库名字
    database:'mouse_brain'
})
connection.connect();


function add(name,score){
    var sql=`insert into rank(name,score) values('${name}','${score}')`;
    connection.query(sql, (error, result, filed) => {
        if (error) {
            console.log(error);
        } else {
            console.log("添加成功");
        }
    })
}

function update(name,score){
    var sql=`update rank set score='${score}' where name='${name}'`;
    connection.query(sql, (error, result, filed) => {
        if (error) {
            console.log(error);
        } else {
            console.log("更新成功");
        }
    })
}


function addrank(name,score) {
    // 设置sql语句,添加数据
    //数字不需要''
    var sql=`select * from rank where name='${name}'`;
    // 调用query方法query(sql语句,回调函数)
    connection.query(sql, (error, result, filed) => {
        if (error) {
            console.log(error);
        } else {
            if(result.length==0||result==null){
                add(name,score);
            }else{
                update(name,result[0].score+score);
            }
        }
    })
}

function getrank() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM rank ORDER BY score DESC LIMIT 10`;
      connection.query(sql, (error, result, fields) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
}

function generateUniqueRoomName() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    const roomName = timestamp + '_' + random;
    while(roommap.has(roomName)){
        return generateUniqueRoomName();
    }
    return roomName;
}

function findRoomByClient(wsconnect) {
    for (const [roomName, room] of roommap) {
      if (room.clients.has(wsconnect)) {
        return room;
      }
    }
    return null;
}

function cleanupRoom(room) {
    room.notifyRoomClosed();
    // 从房间列表中移除该房间
    roommap.delete(room.roomname);
  
    // 其他房间清理操作，例如通知其他客户端该房间已关闭等
}



const config={
    port:3001,
    //ssl_key:'****.key',         //购买服务器后的秘钥和证书           
    //ssl_cert:'****.pem',
}

const processrequest=(req,res)=>{
    res.writeHead(200);
    res.end('https!\n');
};


// const app=https.createServer({
//     key:fs.readFileSync(path.join(__dirname,config.ssl_key), 'utf8'),
//     cert:fs.readFileSync(path.join(__dirname,config.ssl_cert), 'utf8'),
// },processrequest);
const app = http.createServer(processrequest);


const wss=new websocket({
    server:app,
});

wss.on("connection",(wsconnect,req)=>{
    console.log("已连接websocket");
    let dataarr;
    wsconnect.on('message',(message)=>{
        console.log("接收到"+message);
        dataarr=String(message).split("&");
        let postdata={"ip":req.socket.remoteAddress};
        for(let i=0;i<dataarr.length;i++){
            postdata[dataarr[i].split("=")[0]]=dataarr[i].split("=")[1];
        }
        if (postdata.submitType === 'OnlineMatch') {
            // 将当前连接加入等待队列
            waitingClients.add(wsconnect);
            wsconnect.send('Waiting for another player...');
            // 检查等待队列中是否有其他可匹配的客户端
            if (waitingClients.size > 1) {
              // 从等待队列中取出两个客户端进行匹配
              const clientsArray = Array.from(waitingClients);
              const client1 = clientsArray.shift();
              const client2 = clientsArray.shift();
      
              // 从等待队列中移除已匹配的客户端
              waitingClients.delete(client1);
              waitingClients.delete(client2);
      
              // 进行匹配逻辑，将匹配结果发送给两个客户端
              const roomName = generateUniqueRoomName(); // 生成唯一的房间名
              roommap.set(roomName,new Room(roomName,null,"123",true));
              const response1 = 'roomname=' + roomName + '&playname=Player1';
              const response2 = 'roomname=' + roomName + '&playname=Player2';
              client1.send(response1);
              client2.send(response2);
            }
        }
        else if(postdata.submitType === "CreateRoom"){
            if(roommap.has(postdata.roomName)&&roommap.get(postdata.roomName).ownername!=null ){
                wsconnect.send('createFail');
            }else{
                roommap.set(postdata.roomName,new Room(postdata.roomName,postdata.ownerName,postdata.roomPsw,true));
                let room=roommap.get(postdata.roomName);
                room.addClient(wsconnect);
                room.setOwnerIP(postdata.ip);
                room.setinitmoney(postdata.initmoney);
                room.setTotalTimes(postdata.totaltimes);
                if(room.otherip!=null){
                    wsconnect.send("roomname="+room.roomname+"&othername="+room.othername);
                }else{
                    wsconnect.send('createSuccess');
                }          
            }    
        }
        else if(postdata.submitType === "JoinRoom"){
            let room=roommap.get(postdata.roomName);
            if(room != null && room.pswIsRight(postdata.roomPsw) && room.isNotFull()){       
                room.addClient(wsconnect);
                room.setOtherIP(postdata.ip);
                room.setOtherName(postdata.otherName);
                wsconnect.send('ownername='+room.ownername+"&isowner="+!room.ownerIsFirst);
                
                wss.clients.forEach(function each(client) {
                    if (client !== wsconnect && client.readyState === WebSocket.OPEN) {
                    client.send("roomname="+room.roomname+"&othername="+room.othername);
                    console.log("roomname="+room.roomname+"&othername="+room.othername);
                    }
                });
                 
            }else{
                wsconnect.send('findFail');
            }
        }
        else if(postdata.submitType === "gamestart"){
            let room = roommap.get(postdata.roomName);
            if(room != null){
                room.InitDiceBoard();
                wsconnect.send('gamestartsuccess');
            }
        }
        else if(postdata.submitType === "getDiceBoard"){
            let room=roommap.get(postdata.roomName);
            if(room != null ){
                wsconnect.send(JSON.stringify(room.diceboard));
            }
        }
        else if(postdata.submitType === "selectDice"){
            let room=roommap.get(postdata.roomName);
            if(room != null ){
                if(postdata.play=="player1"){
                    room.player1_select(postdata.x1,postdata.x2,postdata.x3,postdata.x4,postdata.x5);
                }else if(postdata.play=="player2"){
                    room.player2_select(postdata.x1,postdata.x2,postdata.x3,postdata.x4,postdata.x5);
                }
                if(room.hasInit)room.hasInit=false;
            }
        }
        else if(postdata.submitType === "returnDice"){
            let room=roommap.get(postdata.roomName);
            if(room != null ){
                if(postdata.play=="player1"){
                    room.player1_return(postdata.x1,postdata.x2,postdata.x3,postdata.x4,postdata.x5);
                }else if(postdata.play=="player2"){
                    room.player2_return(postdata.x1,postdata.x2,postdata.x3,postdata.x4,postdata.x5);
                }
            }
        }
        else if(postdata.submitType === "Lock"){
            let room=roommap.get(postdata.roomName);
            if(room != null ){
                if(postdata.play=="player1"){
                    room.player1_lock();
                }else if(postdata.play=="player2"){
                    room.player2_lock();
                }
            }
        }
        else if(postdata.submitType === "addmult"){
            let room=roommap.get(postdata.roomName);
            if(room != null ){
                if(postdata.play=="player1"){
                    room.player1Ismul=parseInt(postdata.mult);
                }else if(postdata.play=="player2"){
                    room.player2Ismul=parseInt(postdata.mult);
                }
                room.addmult(parseInt(postdata.mult));
            }
        }
        else if(postdata.submitType === "rollDice"){
            let room=roommap.get(postdata.roomName);
            if(room != null&&postdata.play=="player1" ){
                room.rollDice();
            }
        }
        else if(postdata.submitType === "InitTimes"){
            let room=roommap.get(postdata.roomName);
            if(room != null ){
                if(postdata.play=="player1"){
                    room.InitTimes();
                }
            }
        }
        else if(postdata.submitType === "GameOver"){
            let room=roommap.get(postdata.roomName);
            if(room!=null){
                room.calculate(postdata.winner);
                roommap.delete(postdata.roomName);
            }
        }
        else if(postdata.submitType === "getrank"){
            getrank().then((result) => {
                wsconnect.send(JSON.stringify(result));
            }).catch((error) => {
                console.log(error);
            });
        }
        else if(postdata.submitType === "login"){
            addrank(postdata.name,0);
        }
        else{
            wsconnect.send("dataFormatError");
        }
        wsconnect.on('close', () => {
            const room = findRoomByClient(wsconnect);
            if(room!=null){
                room.removeClient(wsconnect);
                if (room.clients.size === 0) {
                // 清除房间的操作
                    console.log('房间已关闭');
                    cleanupRoom(room);
                }
            }
            waitingClients.delete(wsconnect);
        })
             
    });
    
}); 

app.on('request',function(req,res){
    console.log('收到请求，客户端地址为：',req.socket.remoteAddress,req.socket.remotePort);
});

app.listen(config.port,(req,res)=>{
    console.log("服务器已启动");
});

class Room{
    constructor(roomname,ownername,roompsw,playerorder){
        this.clients = new Set();
        this.roomname=roomname;
        this.roompsw=roompsw;
        this.ownername=ownername;
        this.ownerip=null;
        this.othername=null;
        this.otherip=null;
        this.ownerIsFirst=playerorder;
        this.hasInit=true;
        this.cur_times=1;
        this.total_times=10;
        this.mul=1;
        this.initmoney=1000;
        this.times=1;
        this.player1Islock=false;
        this.player2Islock=false;
        this.player1Ismul=-1;
        this.player2Ismul=-1;
        this.diceboard={
            "player1":[
                [0,0,0,0,0],
                [0,0,0,0,0],
            ],
            "player2":[
                [0,0,0,0,0],
                [0,0,0,0,0],
            ],
            "mul":this.mul,
            "cur_times":this.cur_times,
            "total_times":this.total_times,
            "player1Islock":this.player1Islock,
            "player2Islock":this.player2Islock,
            "player1Ismul":this.player1Ismul,
            "player2Ismul":this.player2Ismul,
            "times":this.times,
        };
    }

    calculate(winner){
        if(winner=="player1"){
            addrank(this.ownername,4);
            addrank(this.othername,-4);
        }else if(winner=="player2"){
            addrank(this.othername,4);
            addrank(this.ownername,-4);
        }else{
            addrank(this.ownername,2);
            addrank(this.othername,2);
        }
    }

    InitTimes(){
        this.player1Islock=false;
        this.player2Islock=false;
        this.player1Ismul=-1;
        this.player2Ismul=-1;
        this.mul=1;
        this.cur_times+=1;
        this.times=1;
        this.diceboard = {
            "player1": [
              [getRandomInteger(1, 6), getRandomInteger(1, 6), getRandomInteger(1, 6), getRandomInteger(1, 6), getRandomInteger(1, 6)],
              [0,0,0,0,0],
            ],
            "player2": [
              [getRandomInteger(1, 6), getRandomInteger(1, 6), getRandomInteger(1, 6), getRandomInteger(1, 6), getRandomInteger(1, 6)],
              [0,0,0,0,0],
            ],
            "mul":this.mul,
            "cur_times":this.cur_times,
            "total_times":this.total_times,
            "player1Islock":this.player1Islock,
            "player2Islock":this.player2Islock,
            "player1Ismul":this.player1Ismul,
            "player2Ismul":this.player2Ismul,
            "times":this.times,
          };
        function getRandomInteger(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    InitDiceBoard() {
        this.mul=1;
        this.cur_times=1;
        this.times=1;
        this.player1Islock=false;
        this.player2Islock=false;
        this.player1Ismul=-1;
        this.player2Ismul=-1;
        this.hasInit = true;
        this.diceboard = {
          "player1": [
            [getRandomInteger(1, 6), getRandomInteger(1, 6), getRandomInteger(1, 6), getRandomInteger(1, 6), getRandomInteger(1, 6)],
            [0,0,0,0,0],
          ],
          "player2": [
            [getRandomInteger(1, 6), getRandomInteger(1, 6), getRandomInteger(1, 6), getRandomInteger(1, 6), getRandomInteger(1, 6)],
            [0,0,0,0,0],
          ],
          "mul":this.mul,
          "cur_times":this.cur_times,
          "total_times":this.total_times,
          "player1Islock":this.player1Islock,
          "player2Islock":this.player2Islock,
          "player1Ismul":this.player1Ismul,
          "player2Ismul":this.player2Ismul,
          "times":this.times,
        };
        function getRandomInteger(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    rollDice(){
        for(let i=0;i<5;i++){
            if(this.diceboard["player1"][0][i]!=0){
                this.diceboard["player1"][0][i]=getRandomInteger(1,6);
            }
            if(this.diceboard["player2"][0][i]!=0){
                this.diceboard["player2"][0][i]=getRandomInteger(1,6);
            }
        }
        this.player1Islock=false;
        this.player2Islock=false;
        this.diceboard["player1Islock"]=this.player1Islock;
        this.diceboard["player2Islock"]=this.player2Islock;
        this.player1Ismul=-1;
        this.player2Ismul=-1;
        this.diceboard["player1Ismul"]=this.player1Ismul;
        this.diceboard["player2Ismul"]=this.player2Ismul;
        this.times+=1;
        this.diceboard["times"]=this.times;
        if(this.times==3){
            for(let i=0;i<5;i++){
                if(this.diceboard["player1"][0][i]!=0){
                    this.diceboard["player1"][1][i]=this.diceboard["player1"][0][i];
                    this.diceboard["player1"][0][i]=0;
                }
                if(this.diceboard["player2"][0][i]!=0){
                    this.diceboard["player2"][1][i]=this.diceboard["player2"][0][i];
                    this.diceboard["player2"][0][i]=0;
                }
            }
        }
        function getRandomInteger(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    player1_lock(){
        this.player1Islock=true;
        this.diceboard["player1Islock"]=this.player1Islock;
        this.diceboard["mul"]=this.mul;
        this.diceboard["player1Ismul"]=this.player1Ismul;
        this.diceboard["player2Ismul"]=this.player2Ismul;
    }

    player2_lock(){
        this.player2Islock=true;
        this.diceboard["player2Islock"]=this.player2Islock;
        this.diceboard["mul"]=this.mul;
        this.diceboard["player1Ismul"]=this.player1Ismul;
        this.diceboard["player2Ismul"]=this.player2Ismul;
    }

    player1_return(x1,x2,x3,x4,x5){
        if(x1!='0'&&this.diceboard["player1"][1][0]!=0){
            this.diceboard["player1"][0][0]=this.diceboard["player1"][1][0];
            this.diceboard["player1"][1][0]=0;
        }
        if(x2!='0'&&this.diceboard["player1"][1][1]!=0){
            this.diceboard["player1"][0][1]=this.diceboard["player1"][1][1];
            this.diceboard["player1"][1][1]=0;
        }
        if(x3!='0'&&this.diceboard["player1"][1][2]!=0){
            this.diceboard["player1"][0][2]=this.diceboard["player1"][1][2];
            this.diceboard["player1"][1][2]=0;
        }
        if(x4!='0'&&this.diceboard["player1"][1][3]!=0){
            this.diceboard["player1"][0][3]=this.diceboard["player1"][1][3];
            this.diceboard["player1"][1][3]=0;
        }
        if(x5!='0'&&this.diceboard["player1"][1][4]!=0){
            this.diceboard["player1"][0][4]=this.diceboard["player1"][1][4];
            this.diceboard["player1"][1][4]=0;
        }
    }

    player2_return(x1,x2,x3,x4,x5){
        if(x1!='0'&&this.diceboard["player2"][1][0]!=0){
            this.diceboard["player2"][0][0]=this.diceboard["player2"][1][0];
            this.diceboard["player2"][1][0]=0;
        }
        if(x2!='0'&&this.diceboard["player2"][1][1]!=0){
            this.diceboard["player2"][0][1]=this.diceboard["player2"][1][1];
            this.diceboard["player2"][1][1]=0;
        }
        if(x3!='0'&&this.diceboard["player2"][1][2]!=0){
            this.diceboard["player2"][0][2]=this.diceboard["player2"][1][2];
            this.diceboard["player2"][1][2]=0;
        }
        if(x4!='0'&&this.diceboard["player2"][1][3]!=0){
            this.diceboard["player2"][0][3]=this.diceboard["player2"][1][3];
            this.diceboard["player2"][1][3]=0;
        }
        if(x5!='0'&&this.diceboard["player2"][1][4]!=0){
            this.diceboard["player2"][0][4]=this.diceboard["player2"][1][4];
            this.diceboard["player2"][1][4]=0;
        }
    }

    player1_select(x1,x2,x3,x4,x5){
        if(x1!='0'&&this.diceboard["player1"][0][0]!=0){
            this.diceboard["player1"][1][0]=this.diceboard["player1"][0][0];
            this.diceboard["player1"][0][0]=0;
        }
        if(x2!='0'&&this.diceboard["player1"][0][1]!=0){
            this.diceboard["player1"][1][1]=this.diceboard["player1"][0][1];
            this.diceboard["player1"][0][1]=0;
        }
        if(x3!='0'&&this.diceboard["player1"][0][2]!=0){
            this.diceboard["player1"][1][2]=this.diceboard["player1"][0][2];
            this.diceboard["player1"][0][2]=0;
        }
        if(x4!='0'&&this.diceboard["player1"][0][3]!=0){
            this.diceboard["player1"][1][3]=this.diceboard["player1"][0][3];
            this.diceboard["player1"][0][3]=0;
        }
        if(x5!='0'&&this.diceboard["player1"][0][4]!=0){
            this.diceboard["player1"][1][4]=this.diceboard["player1"][0][4];
            this.diceboard["player1"][0][4]=0;
        }

    }

    player2_select(x1,x2,x3,x4,x5){
        if(x1!='0'&&this.diceboard["player2"][0][0]!=0){
            this.diceboard["player2"][1][0]=this.diceboard["player2"][0][0];
            this.diceboard["player2"][0][0]=0;
        }
        if(x2!='0'&&this.diceboard["player2"][0][1]!=0){
            this.diceboard["player2"][1][1]=this.diceboard["player2"][0][1];
            this.diceboard["player2"][0][1]=0;
        }
        if(x3!='0'&&this.diceboard["player2"][0][2]!=0){
            this.diceboard["player2"][1][2]=this.diceboard["player2"][0][2];
            this.diceboard["player2"][0][2]=0;
        }
        if(x4!='0'&&this.diceboard["player2"][0][3]!=0){
            this.diceboard["player2"][1][3]=this.diceboard["player2"][0][3];
            this.diceboard["player2"][0][3]=0;
        }
        if(x5!='0'&&this.diceboard["player2"][0][4]!=0){
            this.diceboard["player2"][1][4]=this.diceboard["player2"][0][4];
            this.diceboard["player2"][0][4]=0;
        }
        
    }

    addmult(x){
        this.mul+=x;
        this.diceboard["mul"]=this.mul;
        this.diceboard["player1Ismul"]=this.player1Ismul;
        this.diceboard["player2Ismul"]=this.player2Ismul;
    }

    setTotalTimes(times){
        this.total_times=times;
    }
    setinitmoney(money){
        this.initmoney=money;
    }

    setOwnerIP(ip){
        this.ownerip=ip;
    }

    setOtherIP(ip){
        this.otherip=ip;
    }

    setOtherName(name){
        this.othername=name;
    }

    pswIsRight(psw){
        return this.roompsw === psw;
    }

    isNotFull(){
        return this.othername == null;
    }

    addClient(client) {
        if(this.clients.has(client)){
            return;
        }
        this.clients.add(client);
    }
    
    removeClient(client) {
        if(this.clients.has(client)){
            this.clients.delete(client);
        }
    }
    notifyRoomClosed() {
        const message = "The room has been closed.";
        for (const client of this.clients) {
          client.send(message);
        }
    }
}
