<?php

set_include_path($_SERVER['DOCUMENT_ROOT']  . "/" . "modules");
	
// Require modules
require_once( 'Constants.class.php');

	header("Access-Control-Allow-Origin: *");

	$error_val = json_encode(array(
		"status" => "failure",
		"message" => "Sorry, an error occured while trying to record your save. Please try again later."
	));

	if(!isset($_GET['id'])) {
		echo $error_val;
		exit();
	}
	
	// Connect to database
	$mysqli = new mysqli(Constants::DB_HOST, Constants::DB_USER, Constants::DB_PASSWORD, "hallaby_flipablox");

	if (mysqli_connect_errno()) {
		echo $error_val;
		$mysqli->close();
		exit();
	}
	
	$id = $mysqli->real_escape_string($_GET['id']);
	$ip = $_SERVER['REMOTE_ADDR'];
	
	$update_str = "INSERT INTO saves(level_id, ip_address) VALUES (?,?)";
	$update_statement = $mysqli->prepare($update_str);
	$update_statement->bind_param("ss", $id, $ip);
	$update_statement->execute();
	if(mysqli_stmt_error($update_statement) != "") {
		echo $error_val;
		$mysqli->close();
		exit();
	}
	$update_statement->close();
	
	$mysqli->close();
	
	$return_val = array(
		"status" => 'success'
	);
	
	echo json_encode($return_val);
?>