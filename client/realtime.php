<!DOCTYPE html>
<html>

<head>
    <title>Realtime Omegle Cleverbot</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>

    <meta charset="UTF-8">

    <style type="text/css">
        body {
            font-family: arial;
            font-size: 20px;
            background-color: #3498db;
        }

        #msgcontainer {
            height: 100vh;
            width: 100%;
            font: 16px/26px Georgia, Garamond, Serif;
            overflow: auto;
            color: black;
        }

        #msgcontainer div {
            color: black;
            margin-top: 0px;
            padding: 10px;
            border-color: black;
            border-style: solid;
            border-width: 1px;
        }

        #msgcontainer a {
            color: white;

        }

        form {
            margin-top: 20px;
        }

        #msgtosend {
            padding-bottom: 10px;
            padding-top: 10px;
            width: 80%;
        }

        #submit {
            padding-right: 15px;
            padding-bottom: 10px;
            padding-top: 10px;
        }
    </style>

</head>

<body>

    <div id="msgcontainer">
        <div>
            <span class='good badge badge-primary'></span> 
            <span class='good chat_text'><a href="database_explorer.php">Go back</a></span>
        </div>
    </div>

    <script type="text/javascript" src="script.js"></script>

</body>

</html>