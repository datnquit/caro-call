//var socket = io('http://localhost:3000');
var socket = io('https://caro-call.herokuapp.com/');
sessionStorage.setItem("user", user);

$('.hello').append(sessionStorage.getItem("user"));

$(document).ready ( () => {
        //$('#submit').attr('href', '../room');
    $('#submit').click( () => {
        socket.emit('checkRoom', $('input').val());
    });
    $('#createRoom').click( ()=>{
        sessionStorage.removeItem('idRoom');
    })

    $('#randomRoom').click( () => {
        socket.emit('findRoom');
    })
})

socket.on('fullRoom', (mes) => {
    $('#message').html(mes);
})
socket.on('existsRoom', (mes) => {
    $('#message').html(mes);
})
socket.on('successRoom', idRoom => {
    sessionStorage.setItem("idRoom", idRoom);
    window.location = '../room';
})
socket.on('noFreeRoom', () => {
    $('#message').html('Không có phòng trống! Vui lòng tạo phòng mới.');
})

