const express = require('express');
const app = express();
require("dotenv").config();

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('./public'));

//body parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(process.env.PORT || 3000);



//Session
var session = require('express-session');
app.use(session({
    resave: true, 
    saveUninitialized: true, 
    secret: 'somesecret', 
    cookie: { maxAge: 60000 }})
);

//Login
var checkLogin = 0;

app.get('/', (req, res) => {
    res.redirect('login');
})
app.get('/login', (req, res) => {
    res.render('login');
})
.post('/login', (req, res) => {
    checkLogin = 1;
    req.session.User = req.body.username;
    return res.redirect('/index');
});

app.get('/index', (req, res, next) =>{
    if(checkLogin == 0){
        return res.redirect('../login')
    }
    next();
}, (req, res) => {
    res.locals.User = req.session.User;
    res.render('index');
});

app.get('/room', (req, res, next) =>{
    if(checkLogin == 0){
        return res.redirect('../login')
    }
    next();
}, (req, res) => {
    res.render('room');
});

//Tao ra mang ban co trong do cac cell co gia tri ban dau la 0
//muc dich tao ra ma tran ban co nay de xet thang thua cho nguoi choi
//dung method cua Array
Array.matrix = function (n, init) {
    let mat = [];
    for (let i = 0; i < n; i++) {
        a = [];
        for (let j = 0; j < n; j++) {
            a[j] = init;
        }
        mat[i] = a;
    }
    return mat;
}
//let Arr_Board = Array.matrix(15, 0); -> infoRoom[socket.idRoom][5]
//mang ma tran ban co sau khi khoi tao se co dang nhu sau:
/*[ [ 0, 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0, 0 ] ]*/
//Kiem tra thang thua khi nguoi choi danh nuoc moi tren ban co
//Kiểm tra theo phương ngang từ vị trí hiện tại đi sang trái và sang phải đếm xem có đủ 5 quân cùng giá trị thì trả về true
let Horizontal = (Mat, Cur_row, Cur_col, Value) => {
    //di sang ben trai
    let count_left = 0;
    let count_right = 0;
    //Di sang phia ben trai so voi vi tri hien tai
    for (let i = Cur_col; i >= 0; i--) {
        if (Mat[Cur_row][i] === Value) {
            count_left++;
        }
        else {
            i = -1;
        }
    }
    //Di sang phia ben phai so voi vi tri hien tai
    for (let j = Cur_col + 1; j < 15; j++) {
        if (Mat[Cur_row][j] === Value) {
            count_right++;
        }
        else {
            j = 15;
        }
    }
    if (count_right + count_left >= 5) {
        return 1;
    }
}
//Đếm số điểm theo phương thẳng đứng theo 2 hướng từ điểm hiên tại đi thẳng lên trên và đi xuống dưới nếu cả 2 phía trên và dưới
//tổng số ô cùng màu >=5 thì trả về giá trị true tức là chiến thắng
let Vertically = (Mat, Cur_row, Cur_col, Value) => {
    let i = Cur_row;
    let count_up = 0;
    let count_down = 0;
    for (let k = Cur_row; k < 15; k++) {
        if (Mat[k][Cur_col] === Value) {
            count_down++;
        }
        else {
            k = 15;
        }
    }
    for (let h = Cur_row - 1; h >= 0; h--) {
        if (Mat[h][Cur_col] === Value) {
            count_up++;
        }
        else {
            k = 15;
        }
    }
    if ((count_up + count_down >= 5)) {
        return 1;
    }
}
//Kiểm tra theo phương đường chéo phụ
let Diagonal = (Mat, Cur_row, Cur_col, Value) => {
    //kiểm tra theo phương đường chéo phía trên bên phải so với vị trí quân hiện tại
    let count_right_up = 0;
    let count_left_down = 0;
    let temp1 = 0;
    let temp2 = 1;
    for (let i = Cur_row; i >= 0; i--) {
        if (Mat[i][Cur_col + temp1] === Value) {
            count_right_up++;
            temp1++;
        }
        else {
            i = -1;
        }
    }
    //kiểm tra theo phương đường chéo phía dưới bên trái so với vị trí quân hiện tại
    for (let j = Cur_row + 1; j < 15; j++) {
        if (Mat[j][Cur_col - temp2] === Value) {
            count_left_down++;
            temp2++;
        }
        else {
            j = 15;
        }
    }
    if (count_right_up + count_left_down >= 5) {
        return 1;
    }
}
//Kiểm tra theo phương đường chéo chính
let Diagonal_main = (Mat, Cur_row, Cur_col, Value) => {
    let count_right_down = 0;
    let count_left_up = 0;
    let temp1 = 0;
    let temp2 = 1;
    //Kiểm tra theo phương đường chéo chính phía trên bên trái so với vị trí quân hiện tại
    for (let i = Cur_row; i >= 0; i--) {
        if (Mat[i][Cur_col - temp1] === Value) {
            count_left_up++;
            temp1++;
        }
        else {
            i = -1
        }
    }
    //Kiểm tra theo phương đường chéo chính phía dưới bên phải so với vị trí quân hiện tại
    for (let j = Cur_row + 1; j < 15; j++) {
        if (Mat[j][Cur_col + temp2] === Value) {
            count_right_down++;
            temp2++;
        }
        else {
            j = 15;
        }
    }
    if (count_right_down + count_left_up >= 5) {
        return 1
    }
}
var infoRoom = new Object();
var freeRoom = [];
//Xuly callvideostream
io.on('connection', socket => {
    //Co nguoi thoat khoi phong
    socket.on("disconnect", function() {
        if(socket.idRoom){
            //infoRoom[socket.id] = [socket.id, 1, [socket.idPeer, '', 0], [socket.id,''], []]
            if(infoRoom[socket.idRoom][1] == 2){
                if(socket.idRoom == socket.id){ //Neu chu phong out
                    infoRoom[socket.idRoom][2][0] = infoRoom[socket.idRoom][2][1];
                    infoRoom[socket.idRoom][3][0] = infoRoom[socket.idRoom][3][1];
                    infoRoom[socket.idRoom][3][1] = '';

                }else{
                    infoRoom[socket.idRoom][3][1] = '';
                }
                infoRoom[socket.idRoom][1] = 1;
                infoRoom[socket.idRoom][2][2] = 0;
                infoRoom[socket.idRoom][4] = [];
                infoRoom[socket.idRoom][5] = [];
                freeRoom.push(socket.idRoom);
            }else{
                delete infoRoom[socket.idRoom];
                freeRoom.splice(freeRoom.indexOf(socket.idRoom), 1);
            }
        }
    });
    //Check full Room
    socket.on('checkRoom', (idRoom) => {
        if(!infoRoom[idRoom]){
            socket.emit("existsRoom", 'Phòng không tồn tại! Vui lòng nhập ID mới hoặc tạo phòng mới.');
        }else if(infoRoom[idRoom][1] == 2){            
            socket.emit("fullRoom", 'Phòng đã full! Vui lòng nhập ID mới hoặc tạo phòng mới.');
        }else{
            socket.emit('successRoom', idRoom);
        }
    })
    socket.on('findRoom', () => {
        if(freeRoom.length == 0){
            socket.emit('noFreeRoom');
        }else{
            socket.emit('successRoom', freeRoom[Math.floor(Math.random()*freeRoom.length)]);
        }
    })
    socket.on('memberCall', idPeer => {
        socket.idPeer = idPeer;
    })
    socket.on('joinRoom', (idRoom) => {
        socket.emit('server-send-idRoom', idRoom);
        socket.join(idRoom);
        infoRoom[idRoom][1] = 2;
        infoRoom[idRoom][2][1] = socket.idPeer;
        infoRoom[idRoom][3][1] = socket.id;
        infoRoom[idRoom][5] = Array.matrix(15, 0);
        socket.idRoom = idRoom;
        freeRoom.splice(freeRoom.indexOf(socket.idRoom), 1);
        socket.emit('call', infoRoom[socket.idRoom]);
        io.sockets.in(socket.idRoom).emit('showReady');

    })
    socket.on('createRoom', () => {
        socket.idRoom = socket.id;
        // 0: idRoom, 1: numb of member, 2: array idpeer + numb ready, 3: array user, 4: array round, 5: matrix
        infoRoom[socket.id] = [socket.id, 1, [socket.idPeer, '', 0], [socket.id,''], [], Array.matrix(15, 0)];
        freeRoom.push[socket.idRoom];
        socket.emit('server-send-idRoom', socket.idRoom);
    })
    socket.on('checkReady', () => {
        infoRoom[socket.idRoom][2][2] += 1;
        if(infoRoom[socket.idRoom][2][2] == 2){
            io.sockets.in(socket.idRoom).emit('startGame');
        }
    })
    socket.on('unReady', () => {
        infoRoom[socket.idRoom][2][2] -= 1;
    })

    socket.on('showRefresh', ()=> {
        io.sockets.in(socket.idRoom).emit('showButtonRefresh');
    })

    socket.on('playAgain', () => {
        //ready
        infoRoom[socket.idRoom][2][2] = 0;
        //mang luot choi
        infoRoom[socket.idRoom][4] = [];
        //Matran
        infoRoom[socket.idRoom][5] = Array.matrix(15, 0);

        io.sockets.in(socket.idRoom).emit('playGameAgain');
    })
    
    socket.on("su-kien-click", function (data) {
        let vitri = infoRoom[socket.idRoom][3].indexOf(socket.id)
        let Columb = data.x / 50;
        let Row = data.y / 50;
        //Kiem tra khong cho nguoi choi gui du lieu 2 lan lien tuc len server
        if (socket.id !== infoRoom[socket.idRoom][4][0]) {
            infoRoom[socket.idRoom][4].unshift(socket.id);
            if (vitri === 0) {
                if (infoRoom[socket.idRoom][5][Row][Columb] === 0) {
                    infoRoom[socket.idRoom][5][Row][Columb] = 1;
                    io.sockets.in(socket.idRoom).emit("server-send-data", {
                        name: socket.id,
                        x: data.x,
                        y: data.y,
                        nguoichoi: vitri,
                        ArrId: infoRoom[socket.idRoom][4],
                        Board: infoRoom[socket.idRoom][5],
                        value: 1
                    })
                    if(Horizontal(infoRoom[socket.idRoom][5], Row, Columb, 1) || Vertically(infoRoom[socket.idRoom][5], Row, Columb, 1) ||
                    Diagonal(infoRoom[socket.idRoom][5], Row, Columb, 1) || Diagonal_main(infoRoom[socket.idRoom][5], Row, Columb, 1)){
                        string = "BẠN ĐÃ THUA!";
                        socket.to(socket.idRoom).emit("khong-cho-doi-thu-click-khi-thua");
                        socket.to(socket.idRoom).emit("phat-su-kien-thua", string);
                    }
                    /*if (Horizontal(infoRoom[socket.idRoom][5], Row, Columb, 1)) {
                        string = "BAN DA THUA CUOC";
                        socket.broadcast.emit("khong-cho-doi-thu-click-khi-thua");
                        socket.broadcast.emit("phat-su-kien-thang-thua", string);
                    }
                    if (Vertically(infoRoom[socket.idRoom][5], Row, Columb, 1)) {
                        string = "BAN DA THUA CUOC";
                        socket.broadcast.emit("khong-cho-doi-thu-click-khi-thua");
                        socket.broadcast.emit("phat-su-kien-thang-thua", string);
                    }
                    if (Diagonal(infoRoom[socket.idRoom][5], Row, Columb, 1)) {
                        string = "BAN DA THUA CUOC";
                        socket.broadcast.emit("khong-cho-doi-thu-click-khi-thua");
                        socket.broadcast.emit("phat-su-kien-thang-thua", string);
                    }
                    if (Diagonal_main(infoRoom[socket.idRoom][5], Row, Columb, 1)) {
                        string = "BAN DA THUA CUOC";
                        socket.broadcast.emit("khong-cho-doi-thu-click-khi-thua");
                        socket.broadcast.emit("phat-su-kien-thang-thua", string);
                    }*/

                }
            }
            else {
                if (infoRoom[socket.idRoom][5][Row][Columb] === 0) {
                    infoRoom[socket.idRoom][5][Row][Columb] = 2;
                    io.sockets.in(socket.idRoom).emit("server-send-data", {
                        name: socket.id,
                        x: data.x,
                        y: data.y,
                        nguoichoi: vitri,
                        ArrId: infoRoom[socket.idRoom][4],
                        Board: infoRoom[socket.idRoom][5],
                        value: 2
                    })
                    if(Horizontal(infoRoom[socket.idRoom][5], Row, Columb, 2) || Vertically(infoRoom[socket.idRoom][5], Row, Columb, 2) ||
                        Diagonal(infoRoom[socket.idRoom][5], Row, Columb, 2) || Diagonal_main(infoRoom[socket.idRoom][5], Row, Columb, 2)){
                        string = "BAN DA THUA CUOC";
                        socket.to(socket.idRoom).emit("khong-cho-doi-thu-click-khi-thua");
                        socket.to(socket.idRoom).emit("phat-su-kien-thua", string);
                    }
                    /*if (Horizontal(infoRoom[socket.idRoom][5], Row, Columb, 2)) {
                        string = "BAN DA THUA CUOC";
                        socket.broadcast.emit("khong-cho-doi-thu-click-khi-thua");
                        socket.broadcast.emit("phat-su-kien-thang-thua", string);
                    }
                    if (Vertically(infoRoom[socket.idRoom][5], Row, Columb, 2)) {
                        string = "BAN DA THUA CUOC";
                        socket.broadcast.emit("khong-cho-doi-thu-click-khi-thua");
                        socket.broadcast.emit("phat-su-kien-thang-thua", string);
                    }
                    if (Diagonal(infoRoom[socket.idRoom][5], Row, Columb, 2)) {
                        string = "BAN DA THUA CUOC";
                        socket.broadcast.emit("khong-cho-doi-thu-click-khi-thua");
                        socket.broadcast.emit("phat-su-kien-thang-thua", string);
                    }
                    if (Diagonal_main(infoRoom[socket.idRoom][5], Row, Columb, 2)) {
                        string = "BAN DA THUA CUOC";
                        socket.broadcast.emit("khong-cho-doi-thu-click-khi-thua");
                        socket.broadcast.emit("phat-su-kien-thang-thua", string);
                    }*/

                }
            }
        }
    })
    
})
