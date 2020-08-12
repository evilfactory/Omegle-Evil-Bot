<!DOCTYPE html>
<html>

<head>
    <title>Omegle Cleverbot Database Explorer</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>

    <meta charset="UTF-8">
    <style type="text/css">
        body {
            font-family: arial;
            font-size: 20px;
            background-color: #3498db;
        }

        .Cleverbot {
            background-color: rgb(161, 140, 255);
        }

        .Stranger {
            background-color: rgb(134, 249, 72);
        }

        .SERVER {
            background-color: rgb(161, 140, 255);
        }

        .You {
            background-color: rgb(252, 186, 3);
        }

        .con-link {
            color: white;
        }

        #go-back {
            color: white;
        }

        .realtime {
            color: white;
        }



        #msgcontainer div {
            color: black;
            margin-top: 0px;
            padding: 10px;
            border-color: black;
            border-style: solid;
            border-width: 1px;
            font: 16px/26px Georgia, Garamond, Serif;

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

<?php
$isgood = isset($_GET['d']);
?>

<body>


    <div id="msgcontainer">

    <?php if ($isgood) { ?>
        <div><a class="con-link" href="database_explorer.php">
                Go back
            </a>
        </div>
    <?php } ?>

        <?php

        $database = json_decode(file_get_contents("../data/database.json"), true);

        function cmp($a, $b)
        {
            return $a['date'] < $b['date'];
        }

        function cmp2($a, $b)
        {
            return count($a['conversation']) < count($b['conversation']);
        }

        if (isset($_GET['sort'])) {
            usort($database, "cmp2");
        } else {
            usort($database, "cmp");
        }

        if ($isgood) {
            $index = 0;
            $desired = -1;

            foreach ($database as $dat) {
                if ($dat['date'] == $_GET['d']) {
                    $desired = $index;
                    break;
                }

                $index = $index + 1;
            }

            if($desired == -1){
                exit;
            }

            foreach ($database[$index]['conversation'] as $data) {
                $name = $data['name'];
                $msg = $data['msg'];

        ?>
                <div class="<?php echo $name ?>"><span class='good badge badge-primary'><?php echo $name ?></span> <span class='good chat_text'><?php echo $msg ?></span></div>

            <?php } ?>

        <?php

        } else {

        ?>

            <div>
                <a class="realtime" href="realtime.php">
                    Realtime Omegle Bot
                </a>
            </div>

            <div>
                <a class="realtime" href="database_explorer.php?sort=length">
                    Sort by Length
                </a>
            </div>

            <div>
                <a class="realtime" href="database_explorer.php">
                    Sort by Date
                </a>
            </div>

            <?php

            $i = 0;

            foreach ($database as $data) {
                $i = $i + 1;
                $date = date('F j, Y, g:i a', $data['date'] / 1000);
                $len = count($data['conversation']);
            ?>
                <div><a class="con-link" href="database_explorer.php?d=<?php echo $data['date'] ?>">
                        <span class='good badge badge-warning'><?php echo $len; ?></span>
                        <span class='good badge badge-primary'><?php echo $data['language']; ?></span>
                        <?php echo $date; ?>
                    </a>
                </div>


        <?php }
        } ?>

    </div>

</body>

</html>