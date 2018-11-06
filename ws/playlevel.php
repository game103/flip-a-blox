<?php

	$iPod    = stripos($_SERVER['HTTP_USER_AGENT'],"iPod");
	$iPhone  = stripos($_SERVER['HTTP_USER_AGENT'],"iPhone");
	$iPad    = stripos($_SERVER['HTTP_USER_AGENT'],"iPad");
	$android = stripos($_SERVER['HTTP_USER_AGENT'],"Android");
	if(isset($_GET['l'])) {
		$level = $_GET['l'];
	}
	else {
		$level = '';
	}
	$web_url = 'https://game103.net/game103games/javascript/flip-a-blox/www/index.html?l=' . $level;
	$app_url = 'flipablox://?l=' . $level;
	
	if( ! ($iPod || $iPhone || $iPad || $android) ) {
		header("Location: $web_url");
	}
	else {
		$page = "
			<!DOCTYPE html>
			<html>
				<head>
					<meta name='viewport' content='width=device-width,initial-scale=1'>
					<link rel='stylesheet' type='text/css' href='../www/css/flipablox.css'>
					<style>
						* {
							text-align: center;
						}
						
						.question-header {
							margin: 10px;
							font-size: 16pt;
							background-color: #dbf7ff;
							border: 2px solid;
							display: inline-block;
							padding: 10px;
						}
					</style>
					<script type='text/javascript'>
						function openApp() {
							window.location.href='$app_url';
						}
						function openWeb() {
							window.location.href='$web_url';
						}
					</script>
					<title>Play Flip-a-Blox!</title>
				</head>
				<body>
					<div class='question-header'>How would you like to open this level?</div>
					<div class='button level-button game-button' onclick='openApp()'>In the App</div>
					<div class='button level-button game-button' onclick='openWeb()'>In this Browser</div>
				</body>
			</html>
";
		echo $page;
	}

?>