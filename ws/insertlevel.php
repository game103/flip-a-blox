<?php

	set_include_path($_SERVER['DOCUMENT_ROOT']  . "/" . "modules");
		
	// Require modules
	require_once( 'Constants.class.php');

	$VALID = 16;
	$SELECTED = 8;
	$PIVOT = 4;
	$FLIPPED = 2;
	$CHECKED = 1;

	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

	$possible_images = array('images/cloud.png', 'images/cocoa.png', 'images/daxpy.png', 'images/dolphin.png', 'images/duck.png', 'images/duckdee.png', 'images/elephant2.png', 'images/fish.png', 'images/flea.png', 'images/game103.png', 'images/giraffe.png', 'images/guitar.png', 'images/horse.png','images/lamb.png', 'images/penguin.png');
	$possible_audio = array('sound/veryeasy.m4a', 'sound/easy.m4a', 'sound/medium.m4a', 'sound/hard.m4a', 'sound/expert.m4a', 'sound/menu.mp3', 'sound/daxpythedino.mp3', 'sound/inventionincmajor.wav', 'sound/mediocrecomplacency.wav', 'sound/ponyspredicament.wav', 'sound/thegreatduckdeechase.mp3', 'sound/youllbeonmymind.wav');


	$error_val = json_encode(array(
		"status" => "failure",
		"message" => "Sorry, an error occured while trying to upload your level. Please try again later."
	));
	
	$json_data = json_decode(file_get_contents('php://input'), true);

	// Error check
	$invalid = false;
	if(!isset($json_data['level'])) {
		$invalid = true;
	}
	if(!$invalid) {
		$json_level = $json_data['level'];
		// Make sure everything is defined
		if( !isset($json_level['name']) || !isset($json_level['moves']) || !isset($json_level['tiles']) || !isset($json_level['dimensions']) || !isset($json_level['image']) || !isset($json_level['backgroundColor']) || !isset($json_level['tileColor']) || !isset($json_level['checkedTileColor']) || !isset($json_level['song']) || !isset($json_level['matrix']) || !isset($json_level['actionStack']) ) {
			$invalid = true;
		}
		// Now check the values
		else {
			if( !is_string($json_level['name']) ) {
				$invalid = true;
			}
			else if (preg_match('/[^a-zA-Z\d\-!\? ]/', $json_level['name'])) {
				$invalid = true;
			}
			else if( strlen($json_level['name']) > 10) {
				$invalid = true;
			}
			else if( !is_int($json_level['moves']) ) {
				$invalid = true;
			}
			else if($json_level['moves'] < 1) {
				$invalid = true;
			}
			else if( !is_int($json_level['tiles']) ) {
				$invalid = true;
			}
			else if($json_level['tiles'] < 2) {
				$invalid = true;
			}
			else if( !is_int($json_level['dimensions']) ) {
				$invalid = true;
			}
			else if( $json_level['dimensions'] < 2) {
				$invalid = true;
			}
			else if( !in_array( $json_level['image'], $possible_images ) ) {
				$invalid = true;
			}
			else if( !in_array( $json_level['song'], $possible_audio ) ) {
				$invalid = true;
			}
			else if(!preg_match('/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i', $json_level['backgroundColor'])) {
				$invalid = true;
			}
			else if(!preg_match('/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i', $json_level['tileColor'])) {
				$invalid = true;
			}
			else if(!preg_match('/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i', $json_level['checkedTileColor'])) {
				$invalid = true;
			}
			else {
				if( is_array($json_level['matrix']) && is_array($json_level['actionStack']) ) {
					if( sizeof($json_level['matrix']) != $json_level['dimensions'] ) {
						$invalid = true;
					}
					else {
						$tile_count = 0;
						for($i = 0; $i < $json_level['dimensions']; $i++) {
							$cur_row = $json_level['matrix'][$i];
							if( !is_array($cur_row) ) {
								$invalid = true;
								break;
							}
							if( sizeof($cur_row) != $json_level['dimensions'] ) {
								$invalid = true;
								break;
							}
							for($j = 0; $j < $json_level['dimensions']; $j++) {
								if($json_level['matrix'][$i][$j] != 0 &&  $json_level['matrix'][$i][$j] != 16) {
									$invalid = true;
									break 2;
								}
								else if($json_level['matrix'][$i][$j] == 16) {
									$tile_count += 1;
								}
							}
						}
						if(!$invalid) {
							if($json_level['tiles'] != $tile_count) {
								$invalid = true;
							}
							
							$dimensions = $json_level['dimensions'];
							$matrix = $json_level['matrix'];
							// Play the game
							$row = $json_level['dimensions'] - 1;
							$col = 0;
							$moves = 0;
							$tiles = 1;
							// Inclusive of pivot
							$curColumnsRight = 1;
							$curColumnsLeft = 0;
							$curRowsTop = 0;
							// Inclusive of pivot
							$curRowsBottom = 1;
							$flippedColumnsRight = 1;
							$flippedColumnsLeft = 0;
							$flippedRowsTop = 0;
							$flippedRowsBottom = 1;
							$matrix[$row][$col] = $PIVOT + $FLIPPED + $SELECTED + $CHECKED + $VALID;
							
							$actionStack = $json_level['actionStack'];
							for($i = 0; $i < count($actionStack); $i++) {
								if($actionStack[$i] == 'rp') {
									resetToPivotPosition();
								}
								else if($actionStack[$i] == 'rf') {
									resetToFlipped();
								}
								else if($actionStack[$i] == 'l') {
									flipLeft();
								}
								else if($actionStack[$i] == 'r') {
									flipRight();
								}
								else if($actionStack[$i] == 'u') {
									flipAbove();
								}
								else if($actionStack[$i] == 'd') {
									flipBelow();
								}
								else if($actionStack[$i] == 'el') {
									expandLeft();
								}
								else if($actionStack[$i] == 'er') {
									expandRight();
								}
								else if($actionStack[$i] == 'eu') {
									expandAbove();
								}
								else if($actionStack[$i] == 'ed') {
									expandBelow();
								}
							}
							
							if($tiles != $json_level['tiles']) {
								$invalid = true;
							}
							if($moves != $json_level['moves']) {
								$invalid = true;
							}
							
						}
					}
				}
				else {
					$invalid = true;
				}
			}
		}
	}
	
	if($invalid) {
		echo $error_val;
		exit();
	}
	// End error check
	
	// Connect to database
	$mysqli = new mysqli(Constants::DB_HOST, Constants::DB_USER, Constants::DB_PASSWORD, "hallaby_flipablox");

	if (mysqli_connect_errno()) {
		echo $error_val;
		$mysqli->close();
		exit();
	}
	$facebook_user_id = $mysqli->real_escape_string($json_data['facebook_user_id']);
	unset($json_data['level']['actionStack']);
	$level = $mysqli->real_escape_string(json_encode($json_data['level'], JSON_UNESCAPED_SLASHES));
	$level = stripslashes($level);
	$name = $mysqli->real_escape_string($json_level['name']);
	
	$insert_str = "INSERT INTO levels (facebook_user_id, name, level) VALUES (?, ?, ?)";
	$insert_statement = $mysqli->prepare($insert_str);
	$insert_statement->bind_param("sss", $facebook_user_id, $name, $level);
	$insert_statement->execute();
	if(mysqli_stmt_error($insert_statement) != "") {
		echo $error_val;
		$mysqli->close();
		exit();
	}
	$insert_id = mysqli_stmt_insert_id( $insert_statement );
	$insert_statement->close();
	
	$mysqli->close();
	
	$return_val = array(
		"status" => 'success',
		"id"	 => $insert_id
	);
	
	echo json_encode($return_val);
	
	// Functions to play the game
	// This is sound and tested
	// If it does ever change, please update
	// the JavaScript code too
	
	// Perform a flip operation
	function performFlip($verStart, $verEnd, $horStart, $horEnd, $horizontally, $vertically, $verMultiplierFlip, $horMultiplierFlip, $verMultiplierCur, $horMultiplierCur, $ourRow, $ourCol) {
		global $matrix;
		global $dimensions;
		// Play the game
		global $row;
		global $col;
		global $moves;
		global $tiles;
		// Inclusive of pivot
		global $curColumnsRight;
		global $curColumnsLeft;
		global $curRowsTop;
		// Inclusive of pivot
		global $curRowsBottom;
		global $flippedColumnsRight;
		global $flippedColumnsLeft;
		global $flippedRowsTop;
		global $flippedRowsBottom;
		global $PIVOT;
		global $FLIPPED;
		global $SELECTED;
		global $CHECKED;
		global $VALID;
		
		// Remove previous squares marked as flipped
		resetFlipped();
		$newTiles = $tiles;
		// For all the squares that will be flipped
		for($i = $verStart; $i < $verEnd; $i++) {
			for($j = $horStart; $j < $horEnd; $j++) {
				/* If the item is flipped or invalid, do not allow the flip
				 Note that when flipping vertically, ourRow is the row one above/below the first flipped row (part of previous selection)
				 When flipping horizontally, outCol is the row one left/right of the first flipped row
				 If we are going down, the flipped row would be one below, otherwise one above, that is where verMultiplierFlip comes in
				 verMultiplierCur is -verMultiplierFlip, since we go in the opposite direction to find rows to flip than when creating new rows
				 vertically is an extra 1/-1 (depending on verMultiplierFlip) that indicates that the flip starts one position away from ourRow
				 However, if we are flipping horizontally, similar variables are used and won't be explained. Note, however, that verMultiplierFlip will always
				 be one and vertically will always be 0 when flipped horizontally. This is because we are simply iterating through the current rows and not creating new ones.
				 verStart and end are just -curRowsTop and curRowsBottom respectively, where as when flipping vertically, they were 0, and curHeight.
				 0 and curHeight are used in conjunction with ourRow, since it is easier to understand flipping when one away from the flip. */
				if( isChecked($matrix[$ourRow+($i*$verMultiplierFlip)+($vertically*$verMultiplierFlip)][$ourCol+($j*$horMultiplierFlip)+($horizontally*$horMultiplierFlip)]) || !isValid($matrix[$ourRow+($i*$verMultiplierFlip)+($vertically*$verMultiplierFlip)][$ourCol+($j*$horMultiplierFlip)+($horizontally*$horMultiplierFlip)]) ) {
					revertResetFlipped();
					// undo what has currently been flipped on the ith row
					// note that j is not flipped because j's flip is below the if statement
					for($x=$j-1; $x> $horStart-1; $x--) {
						$matrix[$ourRow+($i*$verMultiplierFlip)+($vertically*$verMultiplierFlip)][$ourCol+($x*$horMultiplierFlip)+($horizontally*$horMultiplierFlip)] -= ($FLIPPED + $SELECTED + $CHECKED);
						$matrix[$ourRow+($i*$verMultiplierCur)][$ourCol+($x*$horMultiplierCur)] += $SELECTED;
					}
					// now flip back the rest of the rows
					// i-1, since that is the first row that has been entirely flipped
					// (we already flipped back the ith row partially above)
					for($y = $i-1; $y > $verStart-1; $y--) {
						for($x=$horEnd-1; $x > $horStart-1; $x--) {
							$matrix[$ourRow+($y*$verMultiplierFlip)+($vertically*$verMultiplierFlip)][$ourCol+($x*$horMultiplierFlip)+($horizontally*$horMultiplierFlip)] -= ($FLIPPED + $SELECTED + $CHECKED);
							$matrix[$ourRow+($y*$verMultiplierCur)][$ourCol+($x*$horMultiplierCur)] += $SELECTED;
						}
					}
					return [$matrix, $row, $col, $flippedColumnsRight, $flippedColumnsLeft, $flippedRowsTop, $flippedRowsBottom, $curColumnsRight, $curColumnsLeft, $curRowsTop, $curRowsBottom, $moves, $tiles];
				}	
				// Set the current position to be flipped, selected, and checked
				// The minus one is because we start flipping one above the start row
				$matrix[$ourRow+($i*$verMultiplierFlip)+($vertically*$verMultiplierFlip)][$ourCol+($j*$horMultiplierFlip)+($horizontally*$horMultiplierFlip)] += $FLIPPED + $SELECTED + $CHECKED;
				// The position that this position was flipped from is no longer selected
				// The current position is no longer selected
				$matrix[$ourRow+($i*$verMultiplierCur)][$ourCol+($j*$horMultiplierCur)] -= $SELECTED;
				// Add one to our tiles count
				$newTiles += 1;
			}
		}		
		// After going through the loop, i or j will be as far <flip direction> as possible. Thus, we want to make 
		// that position the new pivot position (while keeping the pivot row if flip direction is vertical and vice-versa)
		// if(i == verEnd-1 and j == horEnd-1):			
		if($vertically == 1) {
			$newRow = $ourRow+(($i-1)*$verMultiplierFlip)+($vertically*$verMultiplierFlip);
			$newCol = $col;
		}
		else {
			$newRow = $row;
			$newCol = $ourCol +(($j-1)*$horMultiplierFlip)+($horizontally*$horMultiplierFlip);
		}
		$matrix[$row][$col] -= $PIVOT;
		$row = $newRow;
		$col = $newCol;
		$matrix[$row][$col] += $PIVOT;
		$moves += 1;
		$tiles = $newTiles;
		return [$matrix, $row, $col, $flippedColumnsRight, $flippedColumnsLeft, $flippedRowsTop, $flippedRowsBottom, $curColumnsRight, $curColumnsLeft, $curRowsTop, $curRowsBottom, $moves + 1, $newTiles];
	}
		
	// Perform a flip above the current blocks
	function flipAbove() {
		global $matrix;
		global $dimensions;
		// Play the game
		global $row;
		global $col;
		global $moves;
		global $tiles;
		// Inclusive of pivot
		global $curColumnsRight;
		global $curColumnsLeft;
		global $curRowsTop;
		// Inclusive of pivot
		global $curRowsBottom;
		global $flippedColumnsRight;
		global $flippedColumnsLeft;
		global $flippedRowsTop;
		global $flippedRowsBottom;
		global $PIVOT;
		global $FLIPPED;
		global $SELECTED;
		global $CHECKED;
		global $VALID;
							
		$curHeight = $curRowsTop+$curRowsBottom;
		$topRow = $row - $curRowsTop;
		// No Index out of bounds
		if($topRow-$curHeight >= 0) {
			// Config
			$verStart = 0;
			$verEnd = $curHeight;
			$horStart = -$curColumnsLeft;
			$horEnd = $curColumnsRight;
			$horizontally = 0;
			$vertically = 1;
			$verMultiplierFlip = -1;
			$horMultiplierFlip = 1;
			$verMultiplierCur = 1;
			$horMultiplierCur = 1;
			$ourRow = $topRow;
			$ourCol = $col;
			// End config
			$prevMoves = $moves;
			performFlip($verStart, $verEnd, $horStart, $horEnd, $horizontally, $vertically, $verMultiplierFlip, $horMultiplierFlip, $verMultiplierCur, $horMultiplierCur, $ourRow, $ourCol);
			// Check if the flip was successful
			if($moves > $prevMoves) {
				$curRowsBottom = $curRowsTop+$curRowsBottom;
				$curRowsTop = 0;
				recordFlip();
				return true;
			}
		}
		else {
			return false;
		}
		return false;
	}
		
	// Perform a flip below the current blocks
	function flipBelow() {
		global $matrix;
		global $dimensions;
		// Play the game
		global $row;
		global $col;
		global $moves;
		global $tiles;
		// Inclusive of pivot
		global $curColumnsRight;
		global $curColumnsLeft;
		global $curRowsTop;
		// Inclusive of pivot
		global $curRowsBottom;
		global $flippedColumnsRight;
		global $flippedColumnsLeft;
		global $flippedRowsTop;
		global $flippedRowsBottom;
		global $PIVOT;
		global $FLIPPED;
		global $SELECTED;
		global $CHECKED;
		global $VALID;
		
		$curHeight = $curRowsTop+$curRowsBottom;
		$bottomRow = $row + $curRowsBottom - 1; // minus one since curRowsBottom is 1 if one row
		// No Index out of bounds
		if($bottomRow+$curHeight < $dimensions ) {
			// Config
			$verStart = 0;
			$verEnd = $curHeight;
			$horStart = -$curColumnsLeft;
			$horEnd = $curColumnsRight;
			$horizontally = 0;
			$vertically = 1;
			$verMultiplierFlip = 1;
			$horMultiplierFlip = 1;
			$verMultiplierCur = -1;
			$horMultiplierCur = 1;
			$ourRow = $bottomRow;
			$ourCol = $col;
			// End config
			$prevMoves = $moves;
			performFlip($verStart, $verEnd, $horStart, $horEnd, $horizontally, $vertically, $verMultiplierFlip, $horMultiplierFlip, $verMultiplierCur, $horMultiplierCur, $ourRow, $ourCol);
			if($moves > $prevMoves) {
				$curRowsBottom = 1;
				$curRowsTop = $curHeight - 1;
				recordFlip();
				return true;
			}
		}
		else {
			return false;
		}
		return false;
	}

	// Perform a flip left of the current blocks
	function flipLeft() {
		global $matrix;
		global $dimensions;
		// Play the game
		global $row;
		global $col;
		global $moves;
		global $tiles;
		// Inclusive of pivot
		global $curColumnsRight;
		global $curColumnsLeft;
		global $curRowsTop;
		// Inclusive of pivot
		global $curRowsBottom;
		global $flippedColumnsRight;
		global $flippedColumnsLeft;
		global $flippedRowsTop;
		global $flippedRowsBottom;
		global $PIVOT;
		global $FLIPPED;
		global $SELECTED;
		global $CHECKED;
		global $VALID;
		
		$curWidth = $curColumnsLeft+$curColumnsRight;
		$leftColumn = $col - $curColumnsLeft;
		// No Index out of bounds
		if($leftColumn-$curWidth >= 0) {
			// Config
			$verStart = -$curRowsTop;
			$verEnd = $curRowsBottom;
			$horStart = 0;
			$horEnd = $curWidth;
			$horizontally = 1;
			$vertically = 0;
			$verMultiplierFlip = 1;
			$horMultiplierFlip = -1;
			$verMultiplierCur = 1;
			$horMultiplierCur = 1;
			$ourRow = $row;
			$ourCol = $leftColumn;
			// End config
			$prevMoves = $moves;
			performFlip($verStart, $verEnd, $horStart, $horEnd, $horizontally, $vertically, $verMultiplierFlip, $horMultiplierFlip, $verMultiplierCur, $horMultiplierCur, $ourRow, $ourCol);
			if ($moves > $prevMoves) {
				$curColumnsLeft = 0;
				$curColumnsRight = $curWidth;
				recordFlip();
				return true;
			}
		}
		else {
			return false;
		}
		return false;
	}
		
	// Perform a flip right of the current blocks
	function flipRight() {
		global $matrix;
		global $dimensions;
		// Play the game
		global $row;
		global $col;
		global $moves;
		global $tiles;
		// Inclusive of pivot
		global $curColumnsRight;
		global $curColumnsLeft;
		global $curRowsTop;
		// Inclusive of pivot
		global $curRowsBottom;
		global $flippedColumnsRight;
		global $flippedColumnsLeft;
		global $flippedRowsTop;
		global $flippedRowsBottom;
		global $PIVOT;
		global $FLIPPED;
		global $SELECTED;
		global $CHECKED;
		global $VALID;
		
		global $curColumnsLeft;
		$curWidth = $curColumnsLeft+$curColumnsRight;
		$rightColumn = $col + $curColumnsRight - 1; // minus one since curColumnsRight is 1 if one col
		// No Index out of bounds
		if($rightColumn+$curWidth < $dimensions ) {
			// Config
			$verStart = -$curRowsTop;
			$verEnd = $curRowsBottom;
			$horStart = 0;
			$horEnd = $curWidth;
			$horizontally = 1;
			$vertically = 0;
			$verMultiplierFlip = 1;
			$horMultiplierFlip = 1;
			$verMultiplierCur = 1;
			$horMultiplierCur = -1;
			$ourRow = $row;
			$ourCol = $rightColumn;
			// End config
			$prevMoves = $moves;
			performFlip($verStart, $verEnd, $horStart, $horEnd, $horizontally, $vertically, $verMultiplierFlip, $horMultiplierFlip, $verMultiplierCur, $horMultiplierCur, $ourRow, $ourCol);
			if($moves > $prevMoves) {
				$curColumnsLeft = $curWidth - 1;
				$curColumnsRight = 1;
				recordFlip();
				return true;
			}
		}
		else {
			return false;
		}
		return false;
	}	
			
	// Expand below
	function expandBelow() {
		global $matrix;
		global $dimensions;
		// Play the game
		global $row;
		global $col;
		global $moves;
		global $tiles;
		// Inclusive of pivot
		global $curColumnsRight;
		global $curColumnsLeft;
		global $curRowsTop;
		// Inclusive of pivot
		global $curRowsBottom;
		global $flippedColumnsRight;
		global $flippedColumnsLeft;
		global $flippedRowsTop;
		global $flippedRowsBottom;
		global $PIVOT;
		global $FLIPPED;
		global $SELECTED;
		global $CHECKED;
		global $VALID;
		
		while(true) {
			// an extra one is not needed since we already have somewhat of an extra one with the pivot position
			if($row + $curRowsBottom >= $dimensions) {
				return [$matrix, $curRowsBottom];
			}
			for($j = -$curColumnsLeft; $j < $curColumnsRight; $j++) {
				if(!isChecked($matrix[$row + $curRowsBottom][$col+$j])) {
					for($x=$j-1; $x>-$curColumnsLeft-1; $x--) {
						$matrix[$row + $curRowsBottom][$col+$x] -= $SELECTED;
					}
					return [$matrix, $curRowsBottom];
				}
				$matrix[$row + $curRowsBottom][$col+$j] += $SELECTED;
			}
			$curRowsBottom += 1;
		}
	}

	// Expand above		
	function expandAbove() {
		global $matrix;
		global $dimensions;
		// Play the game
		global $row;
		global $col;
		global $moves;
		global $tiles;
		// Inclusive of pivot
		global $curColumnsRight;
		global $curColumnsLeft;
		global $curRowsTop;
		// Inclusive of pivot
		global $curRowsBottom;
		global $flippedColumnsRight;
		global $flippedColumnsLeft;
		global $flippedRowsTop;
		global $flippedRowsBottom;
		global $PIVOT;
		global $FLIPPED;
		global $SELECTED;
		global $CHECKED;
		global $VALID;
		
		while(true) {
			if($row - $curRowsTop - 1 < 0) {
				return [$matrix, $curRowsTop];
			}
			for($j = -$curColumnsLeft; $j < $curColumnsRight; $j++) {
				if(!isChecked($matrix[$row - $curRowsTop - 1][$col+$j])) {
					for($x=$j-1; $x>-$curColumnsLeft-1; $x--) {
						$matrix[$row - $curRowsTop - 1][$col+$x] -= $SELECTED;
					}
					return [$matrix, $curRowsTop];
				}
				$matrix[$row - $curRowsTop - 1][$col+$j] += $SELECTED;
			}
			$curRowsTop += 1;
		}
	}

	// Expand right			
	function expandRight() {
		global $matrix;
		global $dimensions;
		// Play the game
		global $row;
		global $col;
		global $moves;
		global $tiles;
		// Inclusive of pivot
		global $curColumnsRight;
		global $curColumnsLeft;
		global $curRowsTop;
		// Inclusive of pivot
		global $curRowsBottom;
		global $flippedColumnsRight;
		global $flippedColumnsLeft;
		global $flippedRowsTop;
		global $flippedRowsBottom;
		global $PIVOT;
		global $FLIPPED;
		global $SELECTED;
		global $CHECKED;
		global $VALID;
		
		while(true) {
			// an extra one is not needed since we already have somewhat of an extra one with the pivot position
			if($col + $curColumnsRight >= $dimensions) {
				return [$matrix, $curColumnsRight];
			}
			for($i = -$curRowsTop; $i < $curRowsBottom; $i++) {
				if(!isChecked($matrix[$row+$i][$col + $curColumnsRight])) {
					for ($y = $i-1; $y > -$curRowsTop-1; $y--) {
						$matrix[$row+$y][$col + $curColumnsRight] -= $SELECTED;
					}
					return [$matrix, $curColumnsRight];
				}
				$matrix[$row+$i][$col + $curColumnsRight]  += $SELECTED;
			}
			$curColumnsRight += 1;
		}
	}

	// Expand left		
	function expandLeft() {
		global $matrix;
		global $dimensions;
		// Play the game
		global $row;
		global $col;
		global $moves;
		global $tiles;
		// Inclusive of pivot
		global $curColumnsRight;
		global $curColumnsLeft;
		global $curRowsTop;
		// Inclusive of pivot
		global $curRowsBottom;
		global $flippedColumnsRight;
		global $flippedColumnsLeft;
		global $flippedRowsTop;
		global $flippedRowsBottom;
		global $PIVOT;
		global $FLIPPED;
		global $SELECTED;
		global $CHECKED;
		global $VALID;
		
		while(true) {
			if($col - $curColumnsLeft - 1 < 0) {
				return [$matrix, $curColumnsLeft];
			}
			for($i = -$curRowsTop; $i < $curRowsBottom; $i++) {
				if(!isChecked($matrix[$row+$i][$col - $curColumnsLeft - 1])) {
					for ($y = $i-1; $y > -$curRowsTop-1; $y--) {
						$matrix[$row+$y][$col - $curColumnsLeft - 1] -= $SELECTED;
					}
					return [$matrix, $curColumnsLeft];
				}
				$matrix[$row+$i][$col - $curColumnsLeft - 1] += $SELECTED;
			}
			$curColumnsLeft += 1;
		}
	}

	// Reset to pivot		
	function resetToPivotPosition() {
		global $matrix;
		global $dimensions;
		// Play the game
		global $row;
		global $col;
		global $moves;
		global $tiles;
		// Inclusive of pivot
		global $curColumnsRight;
		global $curColumnsLeft;
		global $curRowsTop;
		// Inclusive of pivot
		global $curRowsBottom;
		global $flippedColumnsRight;
		global $flippedColumnsLeft;
		global $flippedRowsTop;
		global $flippedRowsBottom;
		global $PIVOT;
		global $FLIPPED;
		global $SELECTED;
		global $CHECKED;
		global $VALID;
		
		for($i = -$curRowsTop; $i < $curRowsBottom; $i++) {
			for($j = -$curColumnsLeft; $j < $curColumnsRight; $j++) {
				if(!isPivot ($matrix[$row+$i][$col+$j]) ) {
					$matrix[$row+$i][$col+$j] -= $SELECTED;
				}
			}
		}
		$curColumnsRight = 1;
		$curColumnsLeft = 0;
		$curRowsBottom = 1;
		$curRowsTop = 0;
		return [$matrix, 1, 0, 0, 1];
	}

	// Reset to flipped
	function resetToFlipped() {
		global $matrix;
		global $dimensions;
		// Play the game
		global $row;
		global $col;
		global $moves;
		global $tiles;
		// Inclusive of pivot
		global $curColumnsRight;
		global $curColumnsLeft;
		global $curRowsTop;
		// Inclusive of pivot
		global $curRowsBottom;
		global $flippedColumnsRight;
		global $flippedColumnsLeft;
		global $flippedRowsTop;
		global $flippedRowsBottom;
		global $PIVOT;
		global $FLIPPED;
		global $SELECTED;
		global $CHECKED;
		global $VALID;
		
		for($i = -$curRowsTop; $i < $curRowsBottom; $i++) {
			for($j = -$curColumnsLeft; $j < $curColumnsRight; $j++) {
				$matrix[$row+$i][$col+$j] -= $SELECTED;
			}
		}
				
		for($i = -$flippedRowsTop; $i < $flippedRowsBottom; $i++) {
			for($j = -$flippedColumnsLeft; $j < $flippedColumnsRight; $j++) {
				$matrix[$row+$i][$col+$j] += $SELECTED;
			}
		}
		
		$curColumnsRight = $flippedColumnsRight;
		$curColumnsLeft = $flippedColumnsLeft;
		$curRowsBottom = $flippedRowsBottom;
		$curRowsTop = $flippedRowsTop;
		
		// Returns the flipped to be set as cur
		return[$matrix, $flippedColumnsRight, $flippedColumnsLeft, $flippedRowsTop, $flippedRowsBottom];
	}
		
	// Helper functions
	// Check if a number has the mark of selected (16 present in binary representation)
	// This binary represenation is used for marking tiles (numbers correspond to tiles)
	function isValid($num) {
		return (($num&(1 << 4)) != 0);
	}

	function isSelected($num) {
		return (($num&(1 << 3)) != 0);
	}
		
	function isPivot($num) {
		return (($num&(1 << 2)) != 0);
	}
		
	function isFlipped($num) {
		return (($num&(1 << 1)) != 0);
	}
		
	function isChecked($num) {
		return (($num&1) != 0);
	}

	// Record a flip for undo and which tiles where flipped purposes	
	function recordFlip() {
		global $matrix;
		global $dimensions;
		// Play the game
		global $row;
		global $col;
		global $moves;
		global $tiles;
		// Inclusive of pivot
		global $curColumnsRight;
		global $curColumnsLeft;
		global $curRowsTop;
		// Inclusive of pivot
		global $curRowsBottom;
		global $flippedColumnsRight;
		global $flippedColumnsLeft;
		global $flippedRowsTop;
		global $flippedRowsBottom;
		global $PIVOT;
		global $FLIPPED;
		global $SELECTED;
		global $CHECKED;
		global $VALID;
		
		$flippedColumnsRight = $curColumnsRight;
		$flippedColumnsLeft = $curColumnsLeft;
		$flippedRowsBottom = $curRowsBottom;
		$flippedRowsTop = $curRowsTop;
	}
	
	// Remove the flipped tag from those tiles are currently marked as so
	function resetFlipped() {
		global $matrix;
		global $dimensions;
		// Play the game
		global $row;
		global $col;
		global $moves;
		global $tiles;
		// Inclusive of pivot
		global $curColumnsRight;
		global $curColumnsLeft;
		global $curRowsTop;
		// Inclusive of pivot
		global $curRowsBottom;
		global $flippedColumnsRight;
		global $flippedColumnsLeft;
		global $flippedRowsTop;
		global $flippedRowsBottom;
		global $PIVOT;
		global $FLIPPED;
		global $SELECTED;
		global $CHECKED;
		global $VALID;
		
		for($i = -$flippedRowsTop; $i < $flippedRowsBottom; $i++) {
			for($j = -$flippedColumnsLeft; $j < $flippedColumnsRight; $j++) {
					$matrix[$row+$i][$col+$j] -= $FLIPPED;
			}		
		}		
		return $matrix;
	}

	// Add the flipped tag back to tiles that fall within the flipped range
	function revertResetFlipped() {
		global $matrix;
		global $dimensions;
		// Play the game
		global $row;
		global $col;
		global $moves;
		global $tiles;
		// Inclusive of pivot
		global $curColumnsRight;
		global $curColumnsLeft;
		global $curRowsTop;
		// Inclusive of pivot
		global $curRowsBottom;
		global $flippedColumnsRight;
		global $flippedColumnsLeft;
		global $flippedRowsTop;
		global $flippedRowsBottom;
		global $PIVOT;
		global $FLIPPED;
		global $SELECTED;
		global $CHECKED;
		global $VALID;
		
		for($i = -$flippedRowsTop; $i < $flippedRowsBottom; $i++) {
			for($j = -$flippedColumnsLeft; $j < $flippedColumnsRight; $j++) {
					$matrix[$row+$i][$col+$j] += $FLIPPED;
			}
		}	
		return $matrix;
	}
?>