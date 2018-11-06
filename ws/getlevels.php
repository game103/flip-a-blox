<?php

	set_include_path($_SERVER['DOCUMENT_ROOT']  . "/" . "modules");
	
	// Require modules
	require_once( 'Constants.class.php');

	header("Access-Control-Allow-Origin: *");
	
	$error_val = json_encode(array(
		"status" => "failure",
		"message" => "Sorry, an error occured while trying to get levels. Please try again later."
	));
	
	// Connect to database
	$mysqli = new mysqli(Constants::DB_HOST, Constants::DB_USER, Constants::DB_PASSWORD, "hallaby_flipablox");

	if (mysqli_connect_errno()) {
		echo $error_val;
		$mysqli->close();
		exit();
	}
	
	// All optional
	$facebook_user_ids = array("");
	if(isset($_GET['facebook_user_ids'])) $facebook_user_ids = explode(",", $mysqli->real_escape_string($_GET['facebook_user_ids']));
	if(isset($_GET['id'])) {
		$id = $mysqli->real_escape_string((int)$_GET['id']);
	}
	else {
		$id = '';
	}
	if(isset($_GET['limit'])) {
		$limit = $mysqli->real_escape_string((int)$_GET['limit']);
	}
	else {
		$limit = 10;
	}
	if(isset($_GET['start'])) {
		$start = $mysqli->real_escape_string((int)$_GET['start']);
	}
	else {
		$start = 0;
	}
	if(isset($_GET['search'])) {
		$search = $_GET['search'];
	}
	else {
		$search = '';
	}
	if(isset($_GET['order'])) {
		$order = $mysqli->real_escape_string($_GET['order']);
		if($order == 0) {
			// Set order to 0 to order by created
			$order = 'created';
		}
		else {
			// Set order to 1 to order by saves
			$order = 'saves';
		}
	}
	else {
		$order = 'created';
	}
	
	
	// Set up the select statement
	// Eventually, params will be a reference with the first element being types
	// and the rest of the elements being values
	// This will be used to call prepare statement
	$params = array();
	$param_types = '';
	$count_params = array();
	$count_param_types = '';
	
	$count_str = "select count(*) from levels";
	if(!$search) {
		$select_str = "select id, level, facebook_user_id from levels";
	}
	else {
		$select_str = "select id, level, facebook_user_id, MATCH (name, facebook_user_id) AGAINST (? IN NATURAL LANGUAGE MODE) as relevance from levels";
		$param_types .= "s";
		$params[] = & $search;
	}
	
	$include_where = true;
	// Add the facebook user ids, if there are any specified
	if( count($facebook_user_ids) > 1 || strlen($facebook_user_ids[0]) > 0 ) {
		$include_where = false;
		$select_str .= " where facebook_user_id in (";
		$count_str .= " where facebook_user_id in (";
		for($i = 0; $i < count($facebook_user_ids); $i++) {
			if($i > 0) {
				$select_str .= ",";
				$count_str .= ",";
			}
			$select_str .= "?";
			$count_str .= "?";
			$param_types .= "s";
			$count_param_types .= "s";
			$params[] = & $facebook_user_ids[$i];
			$count_params[] = & $facebook_user_ids[$i];
		}
		$select_str .= ")";
		$count_str .= ")";
	}
	// If search is set
	if($search) {
		if($include_where) {
			$select_str .= " where";
			$count_str .= " where";
			$include_where = false;
		}
		else {
			$select_str .= " and";
			$count_str .= " and";
		}
		$select_str .= " MATCH (name, facebook_user_id) AGAINST (? IN NATURAL LANGUAGE MODE)";
		$count_str .= " MATCH (name, facebook_user_id) AGAINST (? IN NATURAL LANGUAGE MODE)";
		$param_types .= "s";
		$count_param_types .= "s";
		$params[] = & $search;
		$count_params[] = & $search;
		$order = "relevance, $order";
	}
	// If id is set
	if($id) {
		if($include_where) {
			$select_str .= " where";
			$count_str .= " where";
			$include_where = false;
		}
		else {
			$select_str .= " and";
			$count_str .= " and";
		}
		$select_str .= " id = ?";
		$count_str .= " id = ?";
		$param_types .= "i";
		$count_param_types .= "i";
		$params[] = & $id;
		$count_params[] = & $id;
	}
	
	// Add the start, from, and order
	$select_str .= " order by $order desc limit ? offset ?";
	$param_types .= "ii";
	$params[] = & $limit;
	$params[] = & $start;
	
	// Add the types to the front of the params array
	$param_types_ref = & $param_types;
	array_unshift($params, $param_types_ref);
	
	// Prepare the statement according to the parameters
	$select_statement = $mysqli->prepare($select_str);
	
	// Bind parameters
	call_user_func_array( array($select_statement, 'bind_param'), $params );
	
	$select_statement->execute();
	
	if(mysqli_stmt_error($select_statement) != "") {
		echo $error_val;
		$mysqli->close();
		exit();
	}
	$levels = [];
	if(!$search) {
		$select_statement->bind_result($id, $level, $fb_id);
	}
	else {
		$select_statement->bind_result($id, $level, $fb_id, $relevance);
	}
	
	# Fetch
	while($select_statement->fetch()) {
		$level = json_decode($level, true);
		$level['id'] = $id;
		$level['facebook_user_id'] = $fb_id;
		array_push($levels, $level);
	}
	
	$select_statement->close();
	
	// Get the count now
	
	$count_param_types_ref = & $count_param_types;
	array_unshift($count_params, $count_param_types_ref);
	
	// Prepare the statement according to the parameters
	$count_statement = $mysqli->prepare($count_str);
	
	if( sizeof($count_params) > 1 ) {
		// Bind parameters
		call_user_func_array( array($count_statement, 'bind_param'), $count_params );
	}
	
	$count_statement->execute();
	$count_statement->bind_result($count);
	$count_statement->fetch();
	$count_statement->close();
	
	$mysqli->close();
	
	$return_val = array(
		"status" => 'success',
		"levels" => $levels,
		"count" => $count
	);
	
	echo json_encode($return_val, JSON_UNESCAPED_SLASHES);
?>