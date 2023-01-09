//var socket = io('http://localhost:3000');
var socket = io('https://caro-call.herokuapp.com/');

function clickCheckReady() {
    if($('#checkReady').attr('data-type') == 1){
        $('#checkReady').attr('class', 'btn btn-success');
        $('#checkReady').attr('data-type', '2');
        socket.emit('checkReady');
    }else{
        $('#checkReady').attr('class', 'btn btn-outline-light');
        $('#checkReady').attr('data-type', '1');
        socket.emit('unReady');
    }
}
$('#checkReady').hide();
$('#refresh').hide();

function clickRefresh(){
    socket.emit('playAgain');
}

socket.on('server-send-idRoom', (data) => {
    $('#idRoom').append(data);
})
socket.on('showReady', () => {
    $('#checkReady').show();
})
socket.on('startGame', () => {
    $('#content').show();
    $('#checkReady').hide();
})
//----------In len man hinh nguoi choi bi thua va nguoi thang cuoc--------
socket.on("phat-su-kien-thua",function (data) {
    const lost = svg
        .append("text")
        .attr("x",200)
        .attr("y",200)
        .text(data)
        .style("fill","black")
        .style("font-size", "30px")
        .style('color', 'red');
    socket.emit('showRefresh');
})
socket.on("khong-cho-doi-thu-click-khi-thua",function () {
    $('#content').css('pointer-events', 'none');
})
socket.on('showButtonRefresh', () => {
    $('#refresh').show();
})
socket.on("playGameAgain", () => {
    $('text').remove();
    $('#content').hide();
    $('#refresh').hide();
    $('#checkReady').show();   
    $('#checkReady').attr('class', 'btn btn-outline-light');
    $('#checkReady').attr('data-type', '1');
})

socket.on("server-send-data", function (data) {
    console.log("gia tri ma client nhan tu server:")
    console.log("mang nguoi choi :" + data.ArrId)
    console.log("Id:" + data.name);
    console.log("nguoi cho thu:", data.nguoichoi)
    console.log("Ma tran cac nuoc di:",data.Board)
    console.log("Gia tri cua nguoi choi:"+ data.value)
    console.log("x_client:" + data.x);
    console.log("y_client:" + data.y);
    let matrix = data.Board;
    let Cur_Row = parseInt(data.x);
    let Cur_Col = parseInt(data.y);
    let Value = parseInt(data.value);
    const tick = svg
        .append("text")
        .attr("x", parseInt(data.x))
        .attr("y", parseInt(data.y))
        .attr("text-anchor", "middle")
        .attr("dx", boxsize / 2)
        .attr("dy", boxsize / 2 + 8)
        .text(function () {
            if (data.nguoichoi === 1) {
                return "X"
            }
            else if (data.nguoichoi === 0) {
                return "O"
            }
        })
        .style("font-weight", "bold")
        .style("font-size", "30px")
        .style("fill", function () {
            if (data.nguoichoi === 1) {
                return "000066"
            }
            else if (data.nguoichoi === 0) {
                return "FF0000"
            }
        });
})
function openStream(){
    var config = { audio: true, video: true};
    return navigator.mediaDevices.getUserMedia(config); 
}
function playStream(idVideoTag, stream){
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();//Tra ve 1 promise
}

//var peer = new Peer({key: 'lwjd5qra8257b9'});
var peer = new Peer();

peer.on('open', idPeer =>{
    //Khoi tao ket noi + id peer
    socket.emit('memberCall', idPeer);
    if(sessionStorage.getItem("idRoom")){
        socket.emit('joinRoom', sessionStorage.getItem("idRoom"));
    }else{
        socket.emit('createRoom');
    }
})
peer.on('call', call =>{
    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream))
    })
})

socket.on('call', data => {
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(data[2][0], stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
})

const div = d3.select("#content");
// create <svg>
const svg = div.append("svg").attr("width", 750).attr("height", 750);
//-------------------------------------------------------
let boxsize =50 // kich thuoc cua moi o vuong
let n= 15 // so luong o vuong tren 1 hang
for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
        // draw each chess field
        const box = svg.append("rect")
            .attr("x", i * boxsize)
            .attr("y", j * boxsize)
            .attr("width", boxsize)
            .attr("height", boxsize)
            .attr("id", "b" + i + j)
            .style("stroke","black")
            .on("click", function () {
                let selected = d3.select(this);
                socket.emit("su-kien-click", {x: selected.attr('x'), y: selected.attr('y')})
            });
        if ((i + j) % 2 === 0) {
            box.attr("fill", "beige");
        } else {
            box.attr("fill", "beige");
        }
    }
}
$('#content').hide();