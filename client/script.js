const socket = io("http://localhost:3007");

var msginputo = document.getElementById("msgtosend");


socket.on("datafromserver", function (data) {
    console.log(data)
    for (var i = 0; i < data.length; i++) {
        addmsg(data[i])
    }
})

socket.on("msg", function (data) {
    addmsg(data);
    console.log(data)
})


function addmsg(data) {
    var color = { r: 255, g: 255, b: 255 }
    var name = data.name.toLowerCase()
    console.log(name)
    if (name == "server") {
        color = { r: 161, g: 140, b: 255 }
    }
    if (name == "cleverbot") {
        color = { r: 134, g: 249, b: 72 }
    }
    if (name == "stranger") {
        color = { r: 75, g: 235, b: 232 }
    }
    if (name == "you") {
        data.name = "Admin"
        color = { r: 252, g: 186, b: 3 }
    }

    var divo = document.createElement("div")
    divo.innerHTML = "<span class='good badge badge-primary'>New</span> <span class='good chat_text'>test</span>"

    var goods = divo.querySelectorAll(".good");  

    goods[0].innerText = data.name
    goods[1].innerText = data.msg
    

    document.getElementById("msgcontainer").append(divo)
    divo.style.backgroundColor = `rgb( ${color.r}, ${color.g}, ${color.b} )`

    var div = document.getElementById("msgcontainer")
    div.scrollTop = div.scrollHeight - div.clientHeight
}

addmsg({ name: "SERVER", msg: "Welcome" })


//addmsg({ name: "SERVER", msg: "test" })
//addmsg({ name: "Cleverbot", msg: "test" })
//addmsg({ name: "Stranger", msg: "test" })
