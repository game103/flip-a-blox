// Constants used to represent numbers
// The sum of any of these numbers represents
// a tile on the screen
// By checking if a digit is present in the
// binary representation of a tile's number
// One can check if the tile is valid, selected, etc.
VALID = 16;
SELECTED = 8;
PIVOT = 4;
FLIPPED = 2;
CHECKED = 1;

// Whether the user is playing or in menus
var playing_state;
// Whether the display should be reset to pivot (true) or not
var pivot_select;
// Whether we are muted or not
var mute;
// The array of level objects
var levels = [];
// The tutorial level
var tutorial;
// The current song
var song;
// The url of the current song file
var songFile;
// The type of game currently being played (main, user, creator, collection, or online)
var gameType;
// The current level of the player
var currentLevelIndex;

// Save stuff
// The level that the player has access to through unlocking
var unlockedLevelIndex;
// An array where the first entry is the best score for the 1st level and so on
var levelRecords = [];
// The array of user created levels
var userLevels = [];
// The array of user saved levels
var collectionLevels = [];
// End save stuff
// The array of levels currently displayed from the online search
var currentOnlineLevels = [];
// order 1 = saves, 0 = creation
var onlineSearch = { 'facebook_user_ids': [], 'facebook_user_names': [], 'start': 0, 'limit': 10, 'search': '', 'order': 1, 'responseLevels': [], 'responseCount': 0 };
// Timeout function to fetch online information
var onlineTimeout;
// The facebook user ID
var fbUserID;
// The request for new levels
// This is kept globally, so that it can be aborted
// if another request is made
var newLevelsRequest;

// The current level object
var level;
// The current matrix being altered
var matrix;
// The matrix to be used from the one being created
// All other options will simply be changed in the level
// object iself in creation, but the matrix being created
// is stored seperately.
// Another exception is moves and tiles as the global variables
// for moves and tiles will represent the moves and tiles for
// the new level
var creationMat;
// The current row of the pivot tile
var row;
// The current column of the pivot tile
var col;
// The number of moves currently used
var moves;
// The number of tiles currently covered
var tiles;
// Current columns to the right of the pivot
// Inclusive of pivot
var curColumnsRight;
// Current columns to the left of the pivot
var curColumnsLeft;
// Current columns above the pivot
var curRowsTop;
// Current columns below the pivot
// Inclusive of pivot
var curRowsBottom;
// Current flipped columns to the right of the pivot
// Inclusive of pivot
var flippedColumnsRight;
// Current flipped columns to the left of the pivot
var flippedColumnsLeft;
// Current flipped columns above the pivot
var flippedRowsTop;
// Current flipped columns below the pivot
// Inclusive of pivot
var flippedRowsBottom;
// Stack to keep track of actions to ensure
// a level is beatable when uploaded
// Once a level is saved, this is stored in the level
// as level.actionStack
// Note: This is really more of a reverse stack, with the end
// being the front
var actionStack;

// Callback function to perform after displaying a message
var callbackAfterMessage;
// The stack of objects with data neceassary to restore a level after calling undo
var undoStack;
// Whether or not the message has options
var messageOptions;

// variables for touch event
var touchStartX;
var touchStartY;
var touchEndX;
var touchEndY;

// Whether or not the keyboard is shown
var keyboardShown = false;

// Helpful constants
var possibleImages = ['images/cloud.png', 'images/cocoa.png', 'images/daxpy.png', 'images/dolphin.png', 'images/duck.png', 'images/duckdee.png', 'images/elephant2.png', 'images/fish.png', 'images/flea.png', 'images/game103.png', 'images/giraffe.png', 'images/guitar.png', 'images/horse.png','images/lamb.png', 'images/penguin.png'];
var possibleAudio = ['sound/veryeasy.m4a', 'sound/easy.m4a', 'sound/medium.m4a', 'sound/hard.m4a', 'sound/expert.m4a', 'sound/menu.mp3', 'sound/daxpythedino.mp3', 'sound/inventionincmajor.wav', 'sound/mediocrecomplacency.wav', 'sound/ponyspredicament.wav', 'sound/thegreatduckdeechase.mp3', 'sound/youllbeonmymind.wav'];
var audioEffects = [ new Audio('sound/effects/click1.mp3'), new Audio('sound/effects/click2.mp3'), new Audio('sound/effects/click3.mp3'), new Audio('sound/effects/click4.mp3'), new Audio('sound/effects/click5.mp3'), new Audio('sound/effects/click6.mp3') ];

// Tutorial continue message
var tutorialContinue = "<br><br>Press space or tap to continue";
// Tutorial array
var tutorialInstructions = [ 
	{ 'message': 'The goal of Flip-a-Blox is to fill in all of the outlined boxes with the character tiles.'+tutorialContinue, 'allowedAction': ''},
	{ 'message': 'Starting at the bottom left portion of the board, press the arrow key (or swipe) in the direction you wish to move.<br><br>Try moving to the right now', 'allowedAction': 'r'},
	{ 'message': 'You can also move more than one tile at a time.  Simply press the arrow key (or swipe) in the direction of the row or column you wish to select.<br><br>Try selecting tiles to the left now', 'allowedAction': 'l' },
	{ 'message': 'Then press the arrow key (or swipe) in the direction that you want to move the selected tiles.<br><br>Try moving to the right now', 'allowedAction': 'r'},
	{ 'message': 'Press the spacebar (or tap) to reset the selection of tiles to the starred tile.<br><br>Try that now', 'allowedAction': 'rp'},
	{ 'message': 'Press the spacebar (or tap) again to reselect the previously flipped tiles.<br><br>Try that now', 'allowedAction': 'rf'},
	{ 'message': 'In order to receive a star for perfect completion of a level, you must finish the level in the amount of moves specified on the bottom portion of the screen.'+tutorialContinue, 'allowedAction': ''},
	{ 'message': 'The following keyboard shortcuts may be handy as you play:<br>"U" - undo<br>"R" - restart<br>"M" - mute.'+tutorialContinue, 'allowedAction': ''},
	{ 'message': 'That\'s the basics! You should be able to finish this level now. Enjoy!'+tutorialContinue, 'allowedAction': ''},
	{ 'allowedAction': '' }
];
// What point of the tutorial we are on
var tutorialInstructionIndex;

// Most of the function above the matrix manipulation ones
// have to do with editing the matrix. Those below deal
// with helper and menu stuff for the most part

// Manage keyboard input into the program
// Note: This is only for the game playing stage
function manageInput(e) {
	// If we are in the tutorial, and we have an allowed action, and we are not on the end of the tutorial (default to playing state)
	// For every game time other than tutorial, this check could simply be if(playing_state)
	if(clickIsPivot()) {
		if(e.keyCode == 37) {
			performAction("l");
			// Don't change the select if that is what we are focused on
			if(gameType != 'tutorial' || tutorialInstructions[tutorialInstructionIndex].allowedAction == 'l' || playing_state) {
				pivot_select = true;
			}
			e.preventDefault();
		}
		else if(e.keyCode == 38) {
			performAction("u");
			if(gameType != 'tutorial' || tutorialInstructions[tutorialInstructionIndex].allowedAction == 'u' || playing_state) {
				pivot_select = true;
			}
			e.preventDefault();
		}
		else if(e.keyCode == 39) {
			performAction("r");
			if(gameType != 'tutorial' || tutorialInstructions[tutorialInstructionIndex].allowedAction == 'r' || playing_state) {
				pivot_select = true;
			}
			e.preventDefault();
		}
		else if(e.keyCode == 40) {
			performAction("d");
			if(gameType != 'tutorial' || tutorialInstructions[tutorialInstructionIndex].allowedAction == 'd' || playing_state) {
				pivot_select = true;
			}
			e.preventDefault();
		}
		else if(e.keyCode == 82) {
			if(gameType != 'creator') {
				playEffect(1);
				performAction("rl");
				pivot_select = true;
			}
			else {
				resetLevelSaveCheck(true);
				// If some options are displayed
				if(messageOptions) {
					playEffect(1);
				}
			}
		}
		else if(e.keyCode == 85) {
			performAction("undo");
			if(gameType != 'tutorial' || tutorialInstructions[tutorialInstructionIndex].allowedAction == 'undo' || playing_state) {
				pivot_select = true;
			}
		}
		else if(e.keyCode == 32) {
			if(pivot_select) {
				if(playing_state || ( gameType=='tutorial' && tutorialInstructions[tutorialInstructionIndex].allowedAction == 'rp' ) ) {
					performAction("rp");
					pivot_select = false;
				}
			}
			else {
				if(playing_state || ( gameType=='tutorial' && tutorialInstructions[tutorialInstructionIndex].allowedAction == 'rf' ) ) {
					performAction("rf");
					pivot_select = true;
				}
			}
			e.preventDefault();
		}
		else if(e.keyCode == 77) {
			toggleMute();
			playEffect(5);
		}
		else if(e.keyCode == 83  && gameType == 'creator') {
			playEffect(0);
			saveCreatedLevel();
		}
	}
	else {
		// Only enable keyboard if no options
		// By setting message options to false, the event (on a close button)
		// will propagate up and close the menu
		// (since menu closes on click - through a manageInput event)
		if(e.keyCode == 32) {
			if(!messageOptions) {
				playEffect(0);
				hideMessage();
				callbackAfterMessage();
				// On close, back to playing state if not tutorial
				if(gameType!='tutorial' || tutorialInstructionIndex == tutorialInstructions.length -1) {
					playing_state = true;
				}
			}
			e.preventDefault();
		}
		else if(e.keyCode == 82) {
			// This is necessary for when a message is visible
			// I.E. when beaten a level
			hideMessage();
			if(gameType != 'creator') {
				playEffect(1);
				performAction("rl");
				pivot_select = true;
				// Reset level, back to playing state
				// unless we are on the tutorial which does
				// not start in playing state
				if(gameType !='tutorial') {
					playing_state = true;
				}
			}
			else {
				// Unique to creater, not in performAction
				resetLevelSaveCheck(true);
				// If some options are displayed
				if(messageOptions) {
					playEffect(1);
				}
			}
		}
		else if(e.keyCode == 77) {
			toggleMute();
			playEffect(5);
		}
		else if(e.keyCode == 83  && gameType == 'creator') {
			playEffect(0);
			// Hide the message to avoid duplicate saving
			hideMessage();
			playing_state = true;
			saveCreatedLevel();
		}
	}
	updatePivotButtonDisplay();
}

// Based on the global pivot_selct, changed what the display of the pivot button says
function updatePivotButtonDisplay() {
	var pivotButton = document.getElementById('pivot-button');
	if(pivot_select) {
		pivotButton.innerHTML = "Reset to pivot";
	}
	else {
		pivotButton.innerHTML = "Reset to flipped";
	}
}

// Display a message
function displayMessage(title, message, noVisible) {
	playing_state = false;
	if(!noVisible) {
		document.getElementById('message').style.visibility = "visible";
	}
	document.getElementById('message-title').innerHTML = title;
	document.getElementById('message-description').innerHTML = message;
	messageOptions = false;
	document.getElementById('message').className = '';
}

// Hide the message
function hideMessage() {
	document.getElementById('message').style.visibility = "hidden";
}

// Display a message with options
function displayMessageOptions(title, message, options, optionCallbacks, small) {
	displayMessage(title, message, true);
	messageOptions = true;
	document.getElementById('message').className = 'message-options';
	var description = document.getElementById('message-description');
	var optionsContent = document.createElement("div");
	optionsContent.id = 'message-options-content';
	description.appendChild(optionsContent);
	
	var extraClassName = '';
	if(!small) {
		extraClassName = 'level-button';
	}
	else {
		extraClassName = 'options-button-small';
	}
	
	for(var i = 0; i < options.length; i++) {
		// The last button is large
		if( i == options.length - 1 ) {
			if(small) {
				var breaker = document.createElement("div");
				optionsContent.appendChild(breaker);
			}
			extraClassName = 'level-button';
		}
		var optionButton = document.createElement("div");
		optionButton.innerHTML = options[i];
		optionsContent.appendChild(optionButton);
		optionButton.className = extraClassName + ' options-button button';
		if(optionCallbacks[i]) {
			optionButton.onclick = optionCallbacks[i];
		}
		else {
			optionButton.style.cursor = 'default';
		}
	}
	document.getElementById('message').style.visibility = "visible";
}

// Initialize the levels array
function generateLevels() {
	levels = loadInGameLevels();
	tutorial = loadTutorial();
	
	/*var levelOne = createLevel(6000, 21, 2000);
	for(var i = 0; i < levelOne.dimensions; i++) {
		for(var j = 0; j < levelOne.dimensions; j++) {
			//if(i >= levelOne.dimensions - 2) {
				levelOne.matrix[i][j] = VALID
			//}
		}
	}
	levels.unshift(levelOne);*/
	
	return levels;
}

// Create a new level
function createLevel(moves, dimensions, tiles) {
	var level = new Object();
	level.moves = moves;
	level.dimensions = dimensions;
	level.tiles = tiles;
	var date = new Date();
	level.date = date.getTime();
	level.backgroundColor = '#b9ff4f';
	level.tileColor = '#FFED4F';
	level.checkedTileColor = '#4f61ff';
	level.song = 'sound/veryeasy.m4a';
	level.image = 'images/cocoa.png';
	createLevelMatrix(level);
	return level;
}

// Reset level matrix
function createLevelMatrix(level) {
	level.matrix = [];
	for(var i = 0; i < level.dimensions; i++) {
		level.matrix[i] = [];
		for(var j = 0; j < level.dimensions; j++) {
			level.matrix[i][j] = 0;
		}
	}
}

// Go to the next level by changing the index and resetting the game
function nextLevel() {
	currentLevelIndex += 1;
	resetGame();
}
	
// Based on the currentLevelIndex, set up the game so that the user can play
// the specified level from the beginning.
// newDims is an optional parameter for when creating a new creator level
// one may choose to set it to have the new level have that many dimensions
function resetGame(newDims, keepCreatorChanges) {
	if(gameType == 'main') {
		level = levels[currentLevelIndex];
	}
	else if(gameType == 'user') {
		level = userLevels[currentLevelIndex];
	}
	else if(gameType == 'collection') {
		level = collectionLevels[currentLevelIndex];
	}
	else if(gameType == 'online') {
		level = onlineSearch.responseLevels[currentLevelIndex];
	}
	else if(gameType == 'tutorial') {
		level = tutorial;
	}
	else if(gameType == 'creator') {
		
		if(keepCreatorChanges) {
			newDims = newDims ? newDims : level.dimensions;
			level.dimensions = newDims;
			createLevelMatrix(level);
		}
		else {
			newDims = newDims ? newDims : 10;
			level = createLevel(60000, newDims, 20000);
			// Update the current level index for the new level
			currentLevelIndex = userLevels.length;
		}
		for(var i = 0; i < level.dimensions; i++) {
			for(var j = 0; j < level.dimensions; j++) {
				//if(i >= levelOne.dimensions - 2) {
					level.matrix[i][j] = VALID
				//}
			}
		}
	}
	matrix = [];
	for(var i = 0; i < level.dimensions; i++) {
		matrix[i] = level.matrix[i].slice();
	}
	row = level.dimensions - 1;
	col = 0;
	moves = 0;
	tiles = 1;
	// Inclusive of pivot
	curColumnsRight = 1;
	curColumnsLeft = 0;
	curRowsTop = 0;
	// Inclusive of pivot
	curRowsBottom = 1;
	flippedColumnsRight = 1;
	flippedColumnsLeft = 0;
	flippedRowsTop = 0;
	flippedRowsBottom = 1;
	matrix[row][col] = PIVOT + FLIPPED + SELECTED + CHECKED + VALID;
	undoStack = [];
	actionStack = [];
	saveState();
	
	changeSong();
	
	drawMatrix();
}

// Load an edited game (for creator)
// This is like resetGame, but it loads a game in progess
// Make sure to update currentLevelIndex to the level that you want to replace and make gameType creator
function loadEditedGame() {
	savedLevel = userLevels[currentLevelIndex];
	// First, create a new level
	// We'll have to store non-special case info in this level
	level = createLevel(60000, savedLevel.dimensions, 20000);
	for(var i = 0; i < level.dimensions; i++) {
		for(var j = 0; j < level.dimensions; j++) {
			//if(i >= levelOne.dimensions - 2) {
				level.matrix[i][j] = VALID
			//}
		}
	}
	level.image = savedLevel.image;
	level.backgroundColor = savedLevel.backgroundColor;
	level.tileColor = savedLevel.tileColor;
	level.checkedTileColor = savedLevel.checkedTileColor;
	level.song = savedLevel.song;
	level.name = savedLevel.name;
	
	// Now, set up the game
	// and update special case info (moves, tiles, matrix)
	matrix = [];
	for(var i = 0; i < savedLevel.dimensions; i++) {
		matrix[i] = [];
		for(var j = 0; j < savedLevel.dimensions; j++) {
			matrix[i][j] = VALID;
			if(savedLevel.matrix[i][j] == VALID) {
				matrix[i][j] += CHECKED;
			}
		}
	}
	
	row = savedLevel.row;
	col = savedLevel.col;
	moves = savedLevel.moves;
	tiles = savedLevel.tiles;
	// Inclusive of pivot
	curColumnsRight = 1;
	curColumnsLeft = 0;
	curRowsTop = 0;
	// Inclusive of pivot
	curRowsBottom = 1;
	flippedColumnsRight = savedLevel.flippedColumnsRight;
	flippedColumnsLeft = savedLevel.flippedColumnsLeft;
	flippedRowsTop = savedLevel.flippedRowsTop;
	flippedRowsBottom = savedLevel.flippedRowsBottom;
	revertResetFlipped();
	matrix[row][col] = PIVOT + FLIPPED + SELECTED + CHECKED + VALID;
	undoStack = [];
	actionStack = savedLevel.actionStack;
	
	// select flipped
	resetToFlipped();
	// Just to be safe, reset to flipped
	// because we have done so above
	actionStack.push('rf');
	
	saveState();
	
	changeSong();
	
	drawMatrix();
}

// Change the song
function changeSong() {
	if(level.song != songFile) {
		songFile = level.song;
		if(song) song.pause();
		song = new Audio(level.song);
		song.loop = true;
		if(!mute) {
			song.play();
		}
	}
}
	
// print the matrix/manage the display
// This alters everything displayed (colors of the whole level)
// You must have defined matrix before calling this function
function drawMatrix() {
	var board = document.getElementById('board');
	
	/* Colorize */
	board.style.backgroundColor = level.backgroundColor;
	var controlsContainer = document.getElementById('controls-container');
	controlsContainer.style.backgroundColor = level.checkedTileColor;
	controlsContainer.style.color = whiteOrBlack(level.checkedTileColor);
	var buttons = document.getElementsByClassName('game-button');
	var buttonTextColor = whiteOrBlack(level.backgroundColor);
	for(var i = 0; i < buttons.length; i++) {
		buttons[i].style.backgroundColor = level.backgroundColor;
		buttons[i].style.color = buttonTextColor;
	}
	var pivotButton = document.getElementById('pivot-button');
	pivotButton.style.backgroundColor = level.tileColor;
	pivotButton.style.color = whiteOrBlack(level.tileColor);
	/* End colorize */
	
	// Manage all the viewing of the panel (what is and isn't shown)
	// This can get a little complicated..
	// Manage the level and dimension displays
	var levelCurrent = document.getElementById('level-current');
	var dimensions = document.getElementById('dimensions');
	if(gameType == 'main') {
		levelCurrent.innerHTML = level.name;
		var levelStatus = document.getElementById('level-status');
		levelStatus.innerHTML = '(' + String(currentLevelIndex+1) + '/' + levels.length + ')';
		
		dimensions.style.display = 'none';
		document.getElementById('creation-options').style.display = 'none';
		document.getElementById('clear-button').style.display = 'none';
		document.getElementById('online-options').style.display = 'none';
		levelStatus.style.display = '';
		document.getElementById('level').style.width = '';
	}
	else if(gameType == 'user' || gameType == 'collection' || gameType == 'tutorial') {
		levelCurrent.innerHTML = level.name;
		
		dimensions.style.display = 'none';
		document.getElementById('creation-options').style.display = 'none';
		document.getElementById('clear-button').style.display = 'none';
		document.getElementById('online-options').style.display = 'none';
		document.getElementById('level-status').style.display = 'none';
		document.getElementById('level').style.width = '';
	}
	else if(gameType == 'online') {
		levelCurrent.innerHTML = level.name;
		dimensions.style.display = 'none';
		document.getElementById('creation-options').style.display = 'none';
		document.getElementById('clear-button').style.display = 'none';
		document.getElementById('online-options').style.display = '';
		// Put this somewhere that is only called once
		// Since the download button can be visible/invisible
		// and drawMatrix can be called multiple times during a play
		// document.getElementById('download-button').style.display = '';
		document.getElementById('level-status').style.display = 'none';
		document.getElementById('level').style.width = '';
	}
	else {
		// All the custom stuff for creator mode
		levelCurrent.innerHTML = "<input type='text' id='level-input' maxlength=10 />";
		var levelInput = document.getElementById('level-input');
		if(level.name) levelInput.value = level.name;
		levelInput.onfocus = function() { document.onkeydown = null; };
		levelInput.onblur = function() { document.onkeydown = manageInput };
		//levelInput.onchange = function() {  };
		// happens before onchange
		levelInput.oninput = function() {
			levelInput.value = levelInput.value.replace(/[^a-zA-Z\d\-!\? ]/g,'');
			// Ensure length 10 limit
			levelInput.value = levelInput.value.substr(0,10);
			level.name = levelInput.value;			
			enableDisableSave();
		};
		
		document.getElementById('level-status').style.display = 'none';
		dimensions.style.display = '';
		document.getElementById('level').style.width = '50%';
		document.getElementById('clear-button').style.display = '';
		document.getElementById('online-options').style.display = 'none';
		document.getElementById('creation-options').style.display = '';
		
		dimensions.innerHTML = "<input type='number' id='dimensions-input' value='" + level.dimensions + "' max='49' min='1'/>";
		var dimInput = document.getElementById('dimensions-input');
		dimInput.onchange = function() { 
			dimInput.checkValidity();
			if(dimInput.value.match(/^[1234]?\d$/) && dimInput.value != 0) {
				var newDims = parseInt(dimInput.value);
				startLevelCreatorDimensionsSaveCheck(function() {resetGame(newDims, true)}, newDims);
			}
		};
	}
	// Manage the tile display
	var tilesCurrent = document.getElementById('tiles-current');
	var tilesNeeded = document.getElementById('tiles-needed');
	tilesCurrent.innerHTML = tiles;
	tilesNeeded.innerHTML = level.tiles;
	if(gameType == 'creator') {
		tilesNeeded.style.display = 'none';
	}
	else {
		tilesNeeded.style.display = '';
	}
	// Manage the moves display
	var movesCurrent = document.getElementById('moves-current');
	var movesNeeded = document.getElementById('moves-needed');
	if(gameType == 'creator') {
		movesNeeded.style.display = 'none';
	}
	else {
		movesNeeded.style.display = '';
	}
	movesCurrent.innerHTML = moves;
	movesNeeded.innerHTML = level.moves;
	var movesBest = document.getElementById('moves-best');
	// Add a star if necessary
	if(gameType == 'main' || gameType == 'collection' || gameType == 'online') {
		var benchmark;
		if(gameType == 'collection' || gameType == 'online') {
			benchmark = level.userMoves;
		}
		else {
			benchmark = levelRecords[currentLevelIndex];
		}
		if(benchmark) {
			movesBest.innerHTML = '(Best: ' + benchmark;
			if(benchmark <= level.moves) {
				movesBest.innerHTML += ' &#9733;'
			}
			movesBest.innerHTML += ')';
		}
		else {
			movesBest.innerHTML = "";
		}
	}
	else {
		movesBest.innerHTML = '';
	}
	
	board.innerHTML = "";
	creationMat = [];
	var blockWidth = (1/level.dimensions) * 100;
	var pivotBlockFontSize = Math.ceil(blockWidth) - 2;
	if(pivotBlockFontSize < 4) {
		pivotBlockFontSize = 4;
	}
	var flippedBlockFontSize = pivotBlockFontSize - 2;
	pivotBlockFontSize = String( pivotBlockFontSize ) + "pt";
	flippedBlockFontSize = String( flippedBlockFontSize ) + "pt";
	// This only needs to be calculated once
	var checkedColor = whiteOrBlack(level.checkedTileColor);
	for(var i = 0; i < level.dimensions; i++) {
		var line = [];
		for(var j = 0; j < level.dimensions; j++) {
			var entry = 0;
			// Get the numeric representation of the matrix entry
			num = matrix[i][j];
			gameBlock = document.createElement("div");
			gameBlock.className = 'game-block';
			gameBlock.style.width = 'calc(' + String( blockWidth ) + "% + 2px)";
			gameBlock.style.height = gameBlock.style.width;
			if(isValid(num)) {
				gameBlock.className += ' valid';
				gameBlock.style.backgroundColor = level.tileColor;
			}
			if(isSelected(num)) {
				gameBlock.className += ' selected';
			}
			if(isFlipped(num)) {
				gameBlock.className += ' flipped';
				gameBlock.style.fontSize = flippedBlockFontSize;
				gameBlock.style.lineHeight = pivotBlockFontSize;
			}
			if(isPivot(num)) {
				gameBlock.className += ' pivot';
				gameBlock.style.fontSize = pivotBlockFontSize;
				gameBlock.style.lineHeight = pivotBlockFontSize;
			}
			if(isChecked(num)) {
				gameBlock.className += ' checked';
				gameBlock.style.backgroundColor = level.checkedTileColor;
				gameBlock.style.color = checkedColor;
				gameBlock.style.backgroundImage = "url("+level.image+")";
				entry = VALID;
			}
			line.push(entry);
			board.appendChild(gameBlock);
		}
		creationMat.push(line);
	}
	
	// Start out as saved
	// Start out here becuase we need creation mat to be defined
	enableDisableSave();
}

// print the matrix altered
// This simply updates the matrix (not colors of buttons)
// This is good for when simply performing a move - quicker
function drawMatrixAltered() {
	var tilesCurrent = document.getElementById('tiles-current');
	tilesCurrent.innerHTML = tiles;
	var movesCurrent = document.getElementById('moves-current');
	movesCurrent.innerHTML = moves;
	var cells = document.getElementsByClassName('game-block');
	creationMat = [];
	// This only needs to be calculated once
	var pivotBlockFontSize = Math.ceil((1/level.dimensions) * 100) - 2;
	if(pivotBlockFontSize < 4) {
		pivotBlockFontSize = 4;
	}
	var flippedBlockFontSize = pivotBlockFontSize - 2;
	pivotBlockFontSize = String( pivotBlockFontSize ) + "pt";
	flippedBlockFontSize = String( flippedBlockFontSize ) + "pt";
	var checkedColor = whiteOrBlack(level.checkedTileColor);
	for(var i = 0; i < level.dimensions; i++) {
		var line = [];
		for(var j = 0; j < level.dimensions; j++) {
			var entry = 0;
			var gameBlock = cells[i*level.dimensions + j];
			num = matrix[i][j];
			var newclassName = 'game-block';
			if(isValid(num)) {
				newclassName += ' valid';
			}
			if(isSelected(num)) {
				newclassName += ' selected';
			}
			if(isFlipped(num)) {
				newclassName += ' flipped';
				gameBlock.style.fontSize = flippedBlockFontSize;
				gameBlock.style.lineHeight = pivotBlockFontSize;
			}
			if(isPivot(num)) {
				newclassName += ' pivot';
				gameBlock.style.fontSize = pivotBlockFontSize;
				gameBlock.style.lineHeight = pivotBlockFontSize;
			}
			if(isChecked(num)) {
				newclassName += ' checked';
				gameBlock.style.backgroundColor = level.checkedTileColor;
				gameBlock.style.color = checkedColor;
				gameBlock.style.backgroundImage = "url("+level.image+")";
				entry = VALID;
			}
			if(newclassName != gameBlock.className) {
				gameBlock.className = newclassName;
			}
			line.push(entry);
		}
		creationMat.push(line);
	}
}
		
// Perform an action
// This provides an interface from the matrix manipulation functions
// to the display. One can simply call this function with a command
// and it will be executed on the matrix
// You should see the code below to get an idea of what each command does
function performAction(command) {
	var redrawBoard = false;
	var checkForWin = false;
	var flipOccurred = false;
	
	// Check for command and ensure the tutorial is not over.
	if(gameType == 'tutorial' && command != 'rl' && tutorialInstructions[tutorialInstructionIndex].allowedAction != command && !playing_state) {
		return;
	}
	
	// If the level might be recorded, store
	// information about the actions done in order
	// to reproduce on a server
	// This must go here, since we need recordFlip to include the proper
	// actionStack to save to state
	if(
		(
			command == "rp" || command == "rf" ||
			command == "r" || command == "l" ||
			command == "u" || command == "d"
		)
		&& (gameType == 'user' || gameType == 'creator')) {
		actionStack.push(command);
	}
	var keepStackRecord = true;
	
	if(command == "rp") {
		resetToPivotPosition();
		// Go back on the action stack
		// If there are no flips since the last rp
		// Go back to that
		if (gameType == 'user' || gameType == 'creator') {
			for(var i = actionStack.length - 2; i > -1; i--) {
				if(actionStack[i] == "l" || actionStack[i] == "r" || actionStack[i] == "u" || actionStack[i] == "d" ) {
					break;
				}
				else if(actionStack[i] == "rp") {
					actionStack.splice( i, actionStack.length-1-i );
					break;
				}
			}
		}
	}
	else if(command == "rf") {
		resetToFlipped();
		// Go back on the action stack
		// to the last flip or resetFlipped
		if (gameType == 'user' || gameType == 'creator') {
			for(var i = actionStack.length - 2; i > -1; i--) {
				if(actionStack[i] == "l" || actionStack[i] == "r" || actionStack[i] == "u" || actionStack[i] == "d" ) {
					actionStack.splice( i+1, actionStack.length-1-i );
					break;
				}
				else if(actionStack[i] == "rf") {
					actionStack.splice( i, actionStack.length-1-i );
					break;
				}
			}
		}
	}
	else if(command == "u") {
		prevCurRowsTop = curRowsTop;
		expandAbove();
		if(curRowsTop == prevCurRowsTop) {
			// If no flip occurs, do not record in stack
			// Nothing is saved to undoStack if no flip occurs
			keepStackRecord = flipAbove();
		}
		// Otherwise, ensure we have expand on the action stack
		// for this command
		else if (gameType == 'user' || gameType == 'creator') {
			actionStack[actionStack.length-1] = "e" + actionStack[actionStack.length-1];
		}
	}
	else if(command == "d") {
		prevCurRowsBottom = curRowsBottom;
		expandBelow();
		if(curRowsBottom == prevCurRowsBottom) {
			keepStackRecord = flipBelow();
		}
		// Otherwise, ensure we have expand on the action stack
		// for this command
		else if (gameType == 'user' || gameType == 'creator') {
			actionStack[actionStack.length-1] = "e" + actionStack[actionStack.length-1];
		}
	}
	
	else if(command == "l") {
		prevCurColumnsLeft = curColumnsLeft;
		expandLeft();
		if(curColumnsLeft == prevCurColumnsLeft) {
			keepStackRecord = flipLeft();
		}
		// Otherwise, ensure we have expand on the action stack
		// for this command
		else if (gameType == 'user' || gameType == 'creator') {
			actionStack[actionStack.length-1] = "e" + actionStack[actionStack.length-1];
		}
	}
	
	else if(command == "r") {
		prevCurColumnsRight = curColumnsRight;
		expandRight();
		if(curColumnsRight == prevCurColumnsRight) {
			keepStackRecord = flipRight();
		}
		// Otherwise, ensure we have expand on the action stack
		// for this command
		else if (gameType == 'user' || gameType == 'creator') {
			actionStack[actionStack.length-1] = "e" + actionStack[actionStack.length-1];
		}
	}
	
	else if(command == "rl") {
		if(gameType != 'tutorial') {
			resetGame();
		}
		else {
			startTutorial();
		}
	}
	
	// Reset level keeping creative changes
	else if(command == "rlk") {
		resetGame(null, true);
	}
	
	else if(command == "undo") {
		undo();
	}
	
	// If there is no point in keeping the stack record, remove it
	if(!keepStackRecord && (gameType == 'user' || gameType == 'creator')) {
		actionStack.splice(-1,1);
	}
	
	// Note, there is no call to expand and contract matrix here
	// Since that there is no need for it
	// Also, this way, this function doesn't need a newDims parameter
	// and the expand and contract functions don't need to interact
	// with the UI
	
	// Check if won
	// If so, update some data!
	if(tiles >= level.tiles) {
		var shouldDisplayMessage = true;
		if(gameType == 'main') {
			saveMoves = false;
			if(!levelRecords[currentLevelIndex]) {
				levelRecords.push( moves );
			}
			else if(levelRecords[currentLevelIndex] > moves) {
				levelRecords[currentLevelIndex] = moves;
			}
			if(currentLevelIndex < levels.length - 1) {
				if(unlockedLevelIndex <= currentLevelIndex) {
					// We have unlocked the next level
					unlockedLevelIndex = currentLevelIndex + 1;
				}
				callbackAfterMessage = nextLevel;
			}
			else {
				callbackAfterMessage = startWin;
			}
		}
		else if(gameType == 'tutorial') {
			callbackAfterMessage = startLevels;
		}
		// Must be user, collection, or online
		else if(gameType == 'user') {
			// Check to see if the user's moves are lower
			// They may want to save the level in that case
			if( moves < level.moves ) {
				// This could be put in manage input... maybe...
				overwriteMovesSaveCheck( function() { playEffect(0); startLevelCreatorList(); } );
				shouldDisplayMessage = false;
			}
			callbackAfterMessage = startLevelCreatorList;
		}
		else if(gameType == 'collection') {
			callbackAfterMessage = startCollection;
			if(level.userMoves) {
				if(moves <= level.userMoves) {
					level.userMoves = moves; 
				}
			}
			else {
				level.userMoves = moves;
			}
		}
		else if(gameType == 'online') {
			callbackAfterMessage = startFindNewCourses;
			if(level.userMoves) {
				if(moves <= level.userMoves) {
					level.userMoves = moves; 
				}
			}
			else {
				level.userMoves = moves;
			}
		}
		if(shouldDisplayMessage) {
			displayMessage("Congratulations!", "Press space or tap to continue");
		}
		// Save for good measure
		saveToDisk();
	}
	
	drawMatrixAltered(matrix, level.dimensions);
	
	enableDisableSave();

	if(gameType == 'tutorial' && tutorialInstructionIndex != tutorialInstructions.length - 1 && command != 'rl') {
		callbackAfterMessage();
	}
}

// Save the current state of the game
// This can be used to undo if need be
function saveState() {
	var stackMaxPlusOne = 4;
	if(gameType == 'creator') {
		stackMaxPlusOne = 11;
	}
	state = {
		'level': level,
		'dimensions': level.dimensions,
		'row': row,
		'col': col,
		'moves': moves,
		'tiles': tiles,
		'curColumnsRight': curColumnsRight,
		'curColumnsLeft': curColumnsLeft,
		'curRowsTop': curRowsTop,
		'curRowsBottom': curRowsBottom,
		'flippedColumnsRight': flippedColumnsRight,
		'flippedColumnsLeft': flippedColumnsLeft,
		'flippedRowsTop': flippedRowsTop,
		'flippedRowsBottom': flippedRowsBottom,
		'actionStack': actionStack.toString(),
		'matrix': []
	};
	for(var i = 0; i < level.dimensions; i++) {
		state.matrix[i] = matrix[i].slice();
	}
	// add as first element of the stack
	// note the first element of the stack matches the current state
	undoStack.unshift(state);
	if(undoStack.length > stackMaxPlusOne) {
		undoStack.splice(stackMaxPlusOne, 1);
	}
}

// Undo a move
function undo() {
	// the previous state is the second element of the stack.
	// that will become the new first state
	if(undoStack[1]) {
		var state = undoStack[1];
		level = state.level;
		dimensions = state.dimensions;
		row = state.row;
		col = state.col;
		moves = state.moves;
		tiles = state.tiles;
		curColumnsRight = state.curColumnsRight;
		curColumnsLeft = state.curColumnsLeft;
		curRowsTop = state.curRowsTop;
		curRowsBottom = state.curRowsBottom;
		flippedColumnsRight = state.flippedColumnsRight;
		flippedColumnsLeft = state.flippedColumnsLeft;
		flippedRowsTop = state.flippedRowsTop;
		flippedRowsBottom = state.flippedRowsBottom;
		actionStack = state.actionStack.split(',');
		if(actionStack == '') actionStack = [];
		if(dimensions > matrix.length) {
			expandMatrix(dimensions, true, true);
		}
		else if(dimensions < matrix.length) {
			contractMatrix(dimensions, true, true);
		}
		for(var i = 0; i < level.dimensions; i++) {
			matrix[i] = state.matrix[i].slice();
		}
		undoStack.splice(0, 1);
		drawMatrix();
		return true;
	}
	return false;
}

/**********************************/
// Matrix Manipulation Functions //
/**********************************/

// Perform a flip operation
function performFlip(verStart, verEnd, horStart, horEnd, horizontally, vertically, verMultiplierFlip, horMultiplierFlip, verMultiplierCur, horMultiplierCur, ourRow, ourCol) {
	// Remove previous squares marked as flipped
	resetFlipped();
	var newTiles = tiles;
	// For all the squares that will be flipped
	for(var i = verStart; i < verEnd; i++) {
		for(var j = horStart; j < horEnd; j++) {
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
			if( isChecked(matrix[ourRow+(i*verMultiplierFlip)+(vertically*verMultiplierFlip)][ourCol+(j*horMultiplierFlip)+(horizontally*horMultiplierFlip)]) || !isValid(matrix[ourRow+(i*verMultiplierFlip)+(vertically*verMultiplierFlip)][ourCol+(j*horMultiplierFlip)+(horizontally*horMultiplierFlip)]) ) {
				revertResetFlipped();
				// undo what has currently been flipped on the ith row
				// note that j is not flipped because j's flip is below the if statement
				for(var x=j-1; x> horStart-1; x--) {
					matrix[ourRow+(i*verMultiplierFlip)+(vertically*verMultiplierFlip)][ourCol+(x*horMultiplierFlip)+(horizontally*horMultiplierFlip)] -= (FLIPPED + SELECTED + CHECKED);
					matrix[ourRow+(i*verMultiplierCur)][ourCol+(x*horMultiplierCur)] += SELECTED;
				}
				// now flip back the rest of the rows
				// i-1, since that is the first row that has been entirely flipped
				// (we already flipped back the ith row partially above)
				for(var y = i-1; y > verStart-1; y--) {
					for(x=horEnd-1; x > horStart-1; x--) {
						matrix[ourRow+(y*verMultiplierFlip)+(vertically*verMultiplierFlip)][ourCol+(x*horMultiplierFlip)+(horizontally*horMultiplierFlip)] -= (FLIPPED + SELECTED + CHECKED);
						matrix[ourRow+(y*verMultiplierCur)][ourCol+(x*horMultiplierCur)] += SELECTED;
					}
				}
				return [matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, moves, tiles];
			}	
			// Set the current position to be flipped, selected, and checked
			// The minus one is because we start flipping one above the start row
			matrix[ourRow+(i*verMultiplierFlip)+(vertically*verMultiplierFlip)][ourCol+(j*horMultiplierFlip)+(horizontally*horMultiplierFlip)] += FLIPPED + SELECTED + CHECKED;
			// The position that this position was flipped from is no longer selected
			// The current position is no longer selected
			matrix[ourRow+(i*verMultiplierCur)][ourCol+(j*horMultiplierCur)] -= SELECTED;
			// Add one to our tiles count
			newTiles += 1;
		}
	}		
	// After going through the loop, i or j will be as far <flip direction> as possible. Thus, we want to make 
	// that position the new pivot position (while keeping the pivot row if flip direction is vertical and vice-versa)
	// if(i == verEnd-1 and j == horEnd-1):			
	if(vertically == 1) {
		newRow = ourRow+((i-1)*verMultiplierFlip)+(vertically*verMultiplierFlip);
		newCol = col;
	}
	else {
		newRow = row;
		newCol = ourCol +((j-1)*horMultiplierFlip)+(horizontally*horMultiplierFlip);
	}
	matrix[row][col] -= PIVOT;
	row = newRow;
	col = newCol;
	matrix[row][col] += PIVOT;
	moves += 1;
	tiles = newTiles;
	return [matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, moves + 1, newTiles];
}
	
// Perform a flip above the current blocks
function flipAbove() {
	var curHeight = curRowsTop+curRowsBottom;
	var topRow = row - curRowsTop;
	// No Index out of bounds
	if(topRow-curHeight >= 0) {
		// Config
		var verStart = 0;
		var verEnd = curHeight;
		var horStart = -curColumnsLeft;
		var horEnd = curColumnsRight;
		var horizontally = 0;
		var vertically = 1;
		var verMultiplierFlip = -1;
		var horMultiplierFlip = 1;
		var verMultiplierCur = 1;
		var horMultiplierCur = 1;
		var ourRow = topRow;
		var ourCol = col;
		// End config
		var prevMoves = moves;
		performFlip(verStart, verEnd, horStart, horEnd, horizontally, vertically, verMultiplierFlip, horMultiplierFlip, verMultiplierCur, horMultiplierCur, ourRow, ourCol);
		// Check if the flip was successful
		if(moves > prevMoves) {
			curRowsBottom = curRowsTop+curRowsBottom;
			curRowsTop = 0;
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
	var curHeight = curRowsTop+curRowsBottom;
	var bottomRow = row + curRowsBottom - 1; // minus one since curRowsBottom is 1 if one row
	// No Index out of bounds
	if(bottomRow+curHeight < level.dimensions ) {
		// Config
		var verStart = 0;
		var verEnd = curHeight;
		var horStart = -curColumnsLeft;
		var horEnd = curColumnsRight;
		var horizontally = 0;
		var vertically = 1;
		var verMultiplierFlip = 1;
		var horMultiplierFlip = 1;
		var verMultiplierCur = -1;
		var horMultiplierCur = 1;
		var ourRow = bottomRow;
		var ourCol = col;
		// End config
		var prevMoves = moves;
		performFlip(verStart, verEnd, horStart, horEnd, horizontally, vertically, verMultiplierFlip, horMultiplierFlip, verMultiplierCur, horMultiplierCur, ourRow, ourCol);
		if(moves > prevMoves) {
			curRowsBottom = 1;
			curRowsTop = curHeight - 1;
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
	var curWidth = curColumnsLeft+curColumnsRight;
	var leftColumn = col - curColumnsLeft;
	// No Index out of bounds
	if(leftColumn-curWidth >= 0) {
		// Config
		var verStart = -curRowsTop;
		var verEnd = curRowsBottom
		var horStart = 0;
		var horEnd = curWidth;
		var horizontally = 1;
		var vertically = 0;
		var verMultiplierFlip = 1;
		var horMultiplierFlip = -1;
		var verMultiplierCur = 1;
		var horMultiplierCur = 1;
		var ourRow = row;
		var ourCol = leftColumn;
		// End config
		var prevMoves = moves;
		performFlip(verStart, verEnd, horStart, horEnd, horizontally, vertically, verMultiplierFlip, horMultiplierFlip, verMultiplierCur, horMultiplierCur, ourRow, ourCol);
		if (moves > prevMoves) {
			curColumnsLeft = 0;
			curColumnsRight = curWidth;
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
	var curWidth = curColumnsLeft+curColumnsRight;
	var rightColumn = col + curColumnsRight - 1; // minus one since curColumnsRight is 1 if one col
	// No Index out of bounds
	if(rightColumn+curWidth < level.dimensions ) {
		// Config
		var verStart = -curRowsTop;
		var verEnd = curRowsBottom;
		var horStart = 0;
		var horEnd = curWidth;
		var horizontally = 1;
		var vertically = 0;
		var verMultiplierFlip = 1;
		var horMultiplierFlip = 1;
		var verMultiplierCur = 1;
		var horMultiplierCur = -1;
		var ourRow = row;
		var ourCol = rightColumn;
		// End config
		var prevMoves = moves;
		performFlip(verStart, verEnd, horStart, horEnd, horizontally, vertically, verMultiplierFlip, horMultiplierFlip, verMultiplierCur, horMultiplierCur, ourRow, ourCol);
		if(moves > prevMoves) {
			curColumnsLeft = curWidth - 1;
			curColumnsRight = 1;
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
	while(true) {
		// an extra one is not needed since we already have somewhat of an extra one with the pivot position
		if(row + curRowsBottom >= level.dimensions) {
			return [matrix, curRowsBottom];
		}
		for(var j = -curColumnsLeft; j < curColumnsRight; j++) {
			if(!isChecked(matrix[row + curRowsBottom][col+j])) {
				for(var x=j-1; x>-curColumnsLeft-1; x--) {
					matrix[row + curRowsBottom][col+x] -= SELECTED;
				}
				return [matrix, curRowsBottom];
			}
			matrix[row + curRowsBottom][col+j] += SELECTED;
		}
		curRowsBottom += 1;
	}
}

// Expand above		
function expandAbove() {
	while(true) {
		if(row - curRowsTop - 1 < 0) {
			return [matrix, curRowsTop];
		}
		for(var j = -curColumnsLeft; j < curColumnsRight; j++) {
			if(!isChecked(matrix[row - curRowsTop - 1][col+j])) {
				for(var x=j-1; x>-curColumnsLeft-1; x--) {
					matrix[row - curRowsTop - 1][col+x] -= SELECTED;
				}
				return [matrix, curRowsTop];
			}
			matrix[row - curRowsTop - 1][col+j] += SELECTED;
		}
		curRowsTop += 1;
	}
}

// Expand right			
function expandRight() {
	while(true) {
		// an extra one is not needed since we already have somewhat of an extra one with the pivot position
		if(col + curColumnsRight >= level.dimensions) {
			return [matrix, curColumnsRight];
		}
		for(var i = -curRowsTop; i < curRowsBottom; i++) {
			if(!isChecked(matrix[row+i][col + curColumnsRight])) {
				for (var y = i-1; y > -curRowsTop-1; y--) {
					matrix[row+y][col + curColumnsRight] -= SELECTED;
				}
				return [matrix, curColumnsRight];
			}
			matrix[row+i][col + curColumnsRight]  += SELECTED;
		}
		curColumnsRight += 1;
	}
}

// Expand left		
function expandLeft() {
	while(true) {
		if(col - curColumnsLeft - 1 < 0) {
			return [matrix, curColumnsLeft];
		}
		for(var i = -curRowsTop; i < curRowsBottom; i++) {
			if(!isChecked(matrix[row+i][col - curColumnsLeft - 1])) {
				for (var y = i-1; y > -curRowsTop-1; y--) {
					matrix[row+y][col - curColumnsLeft - 1] -= SELECTED;
				}
				return [matrix, curColumnsLeft];
			}
			matrix[row+i][col - curColumnsLeft - 1] += SELECTED;
		}
		curColumnsLeft += 1;
	}
}

// Reset to pivot		
function resetToPivotPosition() {
	for(var i = -curRowsTop; i < curRowsBottom; i++) {
		for(var j = -curColumnsLeft; j < curColumnsRight; j++) {
			if(!isPivot (matrix[row+i][col+j]) ) {
				matrix[row+i][col+j] -= SELECTED;
			}
		}
	}
	curColumnsRight = 1;
	curColumnsLeft = 0;
	curRowsBottom = 1;
	curRowsTop = 0;
	return [matrix, 1, 0, 0, 1];
}

// Reset to flipped
function resetToFlipped() {
	for(var i = -curRowsTop; i < curRowsBottom; i++) {
		for(var j = -curColumnsLeft; j < curColumnsRight; j++) {
			matrix[row+i][col+j] -= SELECTED;
		}
	}
			
	for(var i = -flippedRowsTop; i < flippedRowsBottom; i++) {
		for(var j = -flippedColumnsLeft; j < flippedColumnsRight; j++) {
			matrix[row+i][col+j] += SELECTED;
		}
	}
	
	curColumnsRight = flippedColumnsRight;
	curColumnsLeft = flippedColumnsLeft;
	curRowsBottom = flippedRowsBottom;
	curRowsTop = flippedRowsTop;
	
	// Returns the flipped to be set as cur
	return[matrix, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom];
}
	
// Helper functions
// Check if a number has the mark of selected (16 present in binary representation)
// This binary represenation is used for marking tiles (numbers correspond to tiles)
function isValid(num) {
	return ((num&(1 << 4)) != 0);
}

function isSelected(num) {
	return ((num&(1 << 3)) != 0);
}
	
function isPivot(num) {
	return ((num&(1 << 2)) != 0);
}
	
function isFlipped(num) {
	return ((num&(1 << 1)) != 0);
}
	
function isChecked(num) {
	return ((num&1) != 0);
}

// Record a flip for undo and which tiles where flipped purposes	
function recordFlip() {
	flippedColumnsRight = curColumnsRight;
	flippedColumnsLeft = curColumnsLeft;
	flippedRowsBottom = curRowsBottom;
	flippedRowsTop = curRowsTop;
	saveState();
}
	
// Remove the flipped tag from those tiles are currently marked as so
function resetFlipped() {
	for(var i = -flippedRowsTop; i < flippedRowsBottom; i++) {
		for(var j = -flippedColumnsLeft; j < flippedColumnsRight; j++) {
				matrix[row+i][col+j] -= FLIPPED;
		}		
	}		
	return matrix;
}

// Add the flipped tag back to tiles that fall within the flipped range
function revertResetFlipped() {
	for(var i = -flippedRowsTop; i < flippedRowsBottom; i++) {
		for(var j = -flippedColumnsLeft; j < flippedColumnsRight; j++) {
				matrix[row+i][col+j] += FLIPPED;
		}
	}	
	return matrix;
}

// The following two functions are more involved in the UI and higher
// layers of abstraction than the previous two functions. They are not
// needed for the game to be played

// Expand the matrix
function expandMatrix(newDims, noRowChange) {
	var diff = newDims - level.dimensions;
	// Add the new rows
	for(var i = level.dimensions; i < newDims; i++) {
		var newRowMat = [];
		var newRowLevMat = [];
		for(var j = 0; j < newDims; j++) {
			newRowMat.push(VALID);
			newRowLevMat.push(VALID);
		}
		matrix.unshift(newRowMat);
		level.matrix.unshift(newRowLevMat);
	}
	// Add the new columns
	for(var i = diff; i < level.dimensions + diff; i++) {
		for(var j = level.dimensions; j < newDims; j++) {
			matrix[i].push(VALID);
			level.matrix[i].push(VALID);
		}
	}
	if(!noRowChange) {
		// row is now further from top
		row = row + diff;
	}
	level.dimensions = newDims;
}

// Contract the matrix
// Returns true if the shrink can take place
// bypass check and no row change are used for undo
// as since the state was ok in the previous version
// it will be ok
function contractMatrix(newDims, noRowChange, bypassCheck) {
	if(!bypassCheck) {
		var diff = level.dimensions - newDims;
		// First, check if the shrink can take place
		// Check for blocking rows
		for(var i = 0; i < diff; i++) {
			for(var j = 0; j < level.dimensions; j++) {
				// The only thing in the square should be valid
				if(matrix[i][j] != VALID) return false;
			}
		}
		// Check for blocking columns
		for(var i = diff; i < level.dimensions; i++) {
			for(var j = newDims; j < level.dimensions; j++) {
				// The only thing in the square should be valid
				if(matrix[i][j] != VALID) return false;
			}
		}
	}
	// GOOD TO GO, continue with shrink
	// remove top rows
	for(var i = 0; i < diff; i++) {
		matrix.splice(0,1);
		level.matrix.splice(0,1);
	}
	// remove right columns from the columns that are left
	for(var i = 0; i < newDims; i++) {
		//for(var j = newDims; j < level.dimensions; j++) {
			matrix[i].splice(-diff,diff);
			level.matrix[i].splice(-diff,diff);
		//}
	}
	if(!noRowChange) {
		// row is now further from top
		row = row - diff;
	}
	level.dimensions = newDims;
	return true;
}


/**************************************/
// END Matrix Manipulation Functions //
/*************************************/

// Check whether in playing state or allowable tutorial
function clickIsPivot() {
	if(playing_state || ( gameType=='tutorial' && tutorialInstructions[tutorialInstructionIndex].allowedAction ) ) {
		return true;
	}
	return false;
}

// Check whether to use white or black text on a given background color
function whiteOrBlack(hex) {
	hex = hex ? hex : '#ffffff';
	var c = hex.substring(1);
	var rgb = parseInt(c, 16);   // convert rrggbb to decimal
	var r = (rgb >> 16) & 0xff;  // extract red
	var g = (rgb >>  8) & 0xff;  // extract green
	var b = (rgb >>  0) & 0xff;  // extract blue
	var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
	if(luma < 128) {
		return '#ffffff';
	}
	else {
		return '#000000';
	}
}

// Toggle the mute setting
function toggleMute() {
	if(mute) {
		document.getElementById('mute-button').innerHTML = '&#x1f50a;';
		if(song) song.play();
		mute = false;
	}
	else {
		document.getElementById('mute-button').innerHTML = '&#x1f507;';
		if(song) song.pause();
		mute = true;
	}
}

// Play a sound effect
function playEffect(which) {
	if(!mute) {
		var effect = audioEffects[which].cloneNode();
		effect.volume = 0.1;
		effect.play();
	}
}

// Resize the board
function resizeBoard() {
	// If the window width is larger than the height minus the space for the controls
	// The game would be resized to height > 100%. That needs to be fixed
	// Check if the height is above this threshold (320 + control height), only flip if it is
	// This is to avoid changing on text input with onscreen keybaord
	// Keyboard shown is also checked as the about check doesn't work on bigger devices like iPads
	if(window.innerHeight > 570 && !keyboardShown) {
		if(window.innerWidth > window.innerHeight - 250) {
			document.getElementById('outer-container').style.width = (window.innerHeight - 250).toString() + 'px';
			document.getElementById('outer-container').style.position = 'absolute';
			document.getElementById('outer-container').style.left = '50%';
			document.getElementById('outer-container').style.transform = 'translate(-50%, 0)';
		}
		else {
			document.getElementById('outer-container').style.width = '';
			document.getElementById('outer-container').style.position = '';
			document.getElementById('outer-container').style.left = '';
			document.getElementById('outer-container').style.transform = '';
		}
	}
}

//////////////////////////////////////////

/* Game start stuff */

// Start the game
// This expects level to be set
function startGame(edited) {
	pivot_select = true;
	updatePivotButtonDisplay();
	removeAllEventListeners();
	document.getElementById('main-menu').style.display = 'none';
	document.getElementById('levels-menu').style.display = 'none';
	document.getElementById('online-menu').style.display = 'none';
	document.getElementById('playing-menu').style.display = 'block';
	if(!edited) {
		resetGame();
	}
	else {
		loadEditedGame();
	}
	document.onkeydown = manageInput;
	// Mock the keyboard events with touch events
	document.getElementById('pivot-button').onclick = function() {
		// Not ideal, but this is here because we don't want the click to hide the message
		if(clickIsPivot()) {
			var e = document.createEvent('Event');;
			e.keyCode = 32;
			manageInput(e);
		}
	}
	document.getElementById('undo-button').onclick = function() {
		var e = document.createEvent('Event');;
		e.keyCode = 85;
		manageInput(e);
	}
	document.getElementById('message').onclick = function() {
		// Only relevant on tutorial, but we don't want tapping message to change pivot
		if(!clickIsPivot()) {
			var e = document.createEvent('Event');;
			e.keyCode = 32;
			manageInput(e);
		}
	}
	document.getElementById('refresh-button').onclick = function() {
		var e = document.createEvent('Event');;
		e.keyCode = 82;
		manageInput(e);
	}
	document.getElementById('clear-button').onclick = function() {
		// Don't preserve
		resetLevelSaveCheck(false);
		// If some options are displayed
		if(messageOptions) {
			playEffect(1);
		}
	}
	if(gameType == 'main' || gameType == 'tutorial') {
		document.getElementById('menu-button').onclick = function() { playEffect(1); startLevels(); };
	}
	else if(gameType == 'creator') {
		document.getElementById('menu-button').onclick = function() { playEffect(1); startLevelCreatorMenuSaveCheck(); };
	}
	else if(gameType == 'user') {
		document.getElementById('menu-button').onclick = function() { playEffect(1); startLevelCreatorList(); };
	}
	else if(gameType == 'collection') {
		document.getElementById('menu-button').onclick = function() { playEffect(1); startCollection(); };
	}
	else if(gameType == 'online') {
		document.getElementById('menu-button').onclick = function() { playEffect(1); startFindNewCourses(); };
	}
	document.getElementById('mute-button').onclick = function() {
		var e = document.createEvent('Event');;
		e.keyCode = 77;
		manageInput(e);
	}
	document.getElementById('board').ontouchstart = function(e) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
		touchEndX = e.touches[0].clientX;
		touchEndY = e.touches[0].clientY;
		e.preventDefault();
	}
	document.getElementById('board').ontouchmove = function(e) {
		touchEndX = e.touches[0].clientX;
		touchEndY = e.touches[0].clientY;
		e.preventDefault();
	}
	document.getElementById('board').ontouchend = function(e) {
		if( document.getElementById('dimensions-input') ) {
			document.getElementById('dimensions-input').blur();
		}
		if( document.getElementById('level-input') ) {
			document.getElementById('level-input').blur();
		}
		var xDiff = touchEndX - touchStartX;
		var yDiff = touchEndY - touchStartY;
		// Note that this allows for the tap to continue to be anywhere on the board
		if(Math.abs(xDiff) <= 15 && Math.abs(yDiff) <= 15) {
			// Like spacebar, tapping can be either continue or pivot
			//if(clickIsPivot()) {
				var e = document.createEvent('Event');
				e.keyCode = 32;
				manageInput(e);
			//}
		}
		else {
			if( Math.abs(xDiff) >= Math.abs(yDiff) ) {
				if(Math.abs(xDiff) > 15) {
					var e = document.createEvent('Event');
					if(xDiff > 0) {
						e.keyCode = 39;
					}
					else {
						e.keyCode = 37;
					}
					manageInput(e);
				}
			}
			else {
				if(Math.abs(yDiff) > 15) {
					var e = document.createEvent('Event');;
					if(yDiff > 0) {
						e.keyCode = 40;
					}
					else {
						e.keyCode = 38;
					}
					manageInput(e);
				}
			}
		}
		e.preventDefault();
	}
	// we've started a game, we are playing
	playing_state = true;
}

// Start the level creator
// Calls - startGame
function startLevelCreator(edited) {
	gameType = "creator";
	startGame(edited);
	document.getElementById('save-button').onclick = function() {
		var e = document.createEvent('Event');;
		e.keyCode = 83;
		manageInput(e);
	};
	document.getElementById('color-button').onclick = function() {
		playEffect(2);
		chooseColors();
	};
	document.getElementById('character-button').onclick = function() {
		playEffect(3);
		chooseImages();
	};
	document.getElementById('audio-button').onclick = function() {
		playEffect(4);
		chooseAudio();
	};
}

/* Level select stuff (Main game) */
function startLevels() {
	gameType = "main";
	removeAllEventListeners();
	document.getElementById('playing-menu').style.display = 'none';
	document.getElementById('main-menu').style.display = 'none';
	document.getElementById('online-menu').style.display = 'none';
	document.getElementById('levels-menu').style.display = 'block';
	var board = document.getElementById('board');
	board.innerHTML = '<div id="level-list"></div>';
	board.style.backgroundColor = '';
	var levelList = document.getElementById('level-list');
	
	var tutorialButton = document.createElement("div");
	tutorialButton.className = 'level-button button';
	tutorialButton.onclick = function() { playEffect(0); startTutorial(); };
	tutorialButton.innerHTML = tutorial.name;
	tutorialButton.style.backgroundColor = tutorial.backgroundColor;
	tutorialButton.style.color = whiteOrBlack(tutorial.backgroundColor);
	levelList.appendChild(tutorialButton);
	
	for(var i = 0; i <= unlockedLevelIndex; i++) {
		var levelButton = document.createElement("div");
		levelButton.className = 'level-button button';
		levelButton.onclick = (function(i){ return function() {currentLevelIndex = i; playEffect(i % 6); startGame();} })(i);
		levelButton.innerHTML = String(i + 1) + ": " + levels[i].name;
		if(levelRecords[i]) {
			if(levelRecords[i] <= levels[i].moves) {
				levelButton.innerHTML += ' &#9733;'
			}
		}
		levelButton.style.backgroundColor = levels[i].backgroundColor;
		levelButton.style.color = whiteOrBlack(levels[i].backgroundColor);
		levelList.appendChild(levelButton);
	}
	var backButton = document.getElementById('back-button');
	backButton.onclick = function() {playEffect(1); startMenu()};
	board.style.backgroundColor = '';
}

/* Course Creator Menu select stuff */
// Skip straight to list of user courses
/* function startLevelCreatorMenu() {
	removeAllEventListeners();
	document.getElementById('playing-menu').style.display = 'none';
	document.getElementById('main-menu').style.display = 'none';
	// We use the level list here to list options
	document.getElementById('levels-menu').style.display = 'block';
	var board = document.getElementById('board');
	board.innerHTML = '<div id="level-list"></div>';
	var levelList = document.getElementById('level-list');
	
	var myCoursesButton = document.createElement("div");
	myCoursesButton.className = 'level-button button';
	myCoursesButton.onclick = function() { playEffect(0); startLevelCreatorList(); };
	myCoursesButton.innerHTML = "My Levels";
	levelList.appendChild(myCoursesButton);
	
	var newCoursesButton = document.createElement("div");
	newCoursesButton.className = 'level-button button';
	newCoursesButton.onclick = function() { playEffect(0); startLevelCreator(); };
	newCoursesButton.innerHTML = "New Level";
	levelList.appendChild(newCoursesButton);
	
	var backButton = document.getElementById('back-button');
	backButton.onclick = function() {playEffect(1); startMenu()};
	board.style.backgroundColor = '';
} */

/* Level select stuff */
function startLevelCreatorList() {
	// NOTE THIS SET HERE!
	gameType = "user";
	removeAllEventListeners();
	document.getElementById('playing-menu').style.display = 'none';
	document.getElementById('main-menu').style.display = 'none';
	document.getElementById('online-menu').style.display = 'none';
	document.getElementById('levels-menu').style.display = 'block';
	var board = document.getElementById('board');
	board.innerHTML = '<div id="level-list"></div>';
	board.style.backgroundColor = '';
	var levelList = document.getElementById('level-list');
	
	var newCoursesButton = document.createElement("div");
	newCoursesButton.className = 'level-button button';
	newCoursesButton.onclick = function() { playEffect(0); startLevelCreator(); };
	newCoursesButton.innerHTML = "New Level";
	levelList.appendChild(newCoursesButton);
	
	for(var i = 0; i < userLevels.length; i++) {
		var levelButtonArea = document.createElement("div");
		
		// Create the button
		var levelButton = document.createElement("div");
		levelButton.className = 'level-button button';
		levelButton.onclick = (function(i){ return function() { toggleLevelCreatorListSubMenu(i); } })(i);
		levelButton.innerHTML = String(i + 1) + ": " + userLevels[i].name;
		if(userLevels[i].moves != null) {
			levelButton.innerHTML += ' - ' + userLevels[i].moves + ' moves';
		}
		if(userLevels[i].date) {
			var date = new Date(userLevels[i].date);
			levelButton.innerHTML += ' - ' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
		}
		if(userLevels[i].uploaded) {
			levelButton.innerHTML += ' &#x1f310;';
		}
		levelButton.style.backgroundColor = userLevels[i].backgroundColor;
		levelButton.style.color = whiteOrBlack(userLevels[i].backgroundColor);
		levelButtonArea.appendChild(levelButton);
		
		// Create the area with options below the actual button
		var hiddenOptionsArea = document.createElement("div");
		hiddenOptionsArea.className = 'hidden-options-area';
		hiddenOptionsArea.style.display = 'none';
		
		var playButton = document.createElement("div");
		playButton.className = 'button level-option-button';
		playButton.onclick = (function(i){ return function() {currentLevelIndex = i; playEffect(i % 6); startGame();} })(i);
		playButton.style.backgroundColor = userLevels[i].tileColor;
		playButton.style.color = whiteOrBlack(userLevels[i].tileColor);
		playButton.innerHTML = 'Play';
		
		var editButton = document.createElement("div");
		editButton.className = 'button level-option-button';
		editButton.onclick = (function(i){ return function() {currentLevelIndex = i; playEffect(i % 6); startLevelCreator(true); } })(i);
		editButton.style.backgroundColor = userLevels[i].checkedTileColor;
		editButton.style.color = whiteOrBlack(userLevels[i].checkedTileColor);
		editButton.innerHTML = 'Edit';
		
		var deleteButton = document.createElement("div");
		deleteButton.className = 'button level-option-button';
		// Note, the manageInput function has no power in menus
		// Thus, you must control hiding the image
		// This is good, since managed input is taylored for the game itself
		deleteButton.onclick = (function(i){ return function() {playEffect(i % 6); 
			var options = ["Yes","No"];
			var optionCallbacks = [
				function() {
					playEffect(0);
					userLevels.splice(i, 1);
					saveToDisk();
					startLevelCreatorList();
					// This is taken care of by removeAllEventListeners
					//hideMessage();
				},
				function() {
					playEffect(0);
					hideMessage();
				}
			];
			displayMessageOptions("Are you sure", "you want to delete this level ("+userLevels[i].name+")?", options, optionCallbacks);
		} })(i);
		deleteButton.style.backgroundColor = userLevels[i].backgroundColor;
		deleteButton.style.color = whiteOrBlack(userLevels[i].backgroundColor);
		deleteButton.innerHTML = 'Delete';
		
		// JSON button area
		var jsonButtonArea = document.createElement("div");
		
		var jsonButton = document.createElement("div");
		jsonButton.className = 'button level-option-button';
		jsonButton.onclick = (function(i){ return function() {playEffect(i % 6);  getJSON(i);} })(i);
		jsonButton.style.backgroundColor = userLevels[i].tileColor;
		jsonButton.style.color = whiteOrBlack(userLevels[i].tileColor);
		jsonButton.innerHTML = 'Get Code';
		
		var jsonCodeArea = document.createElement("div");
		jsonCodeArea.className = "json-code-area";
		
		jsonButtonArea.appendChild(jsonButton);
		jsonButtonArea.appendChild(jsonCodeArea);
		
		// Upload area
		var uploadButtonArea = document.createElement("div");
		uploadButtonArea.className = 'upload-button-area';
		
		var uploadButton = document.createElement("div");
		uploadButton.className = 'button level-option-button';
		uploadButton.onclick = (function(i){ 
			return function() {
				playEffect(i % 6);
				// If the FB code has loaded
				// Note: The WebFBObject could be loaded and the cordova plugin not
				// This will result in an error
				// But is so unlikely, it is OK
				if( webFBObject || appFBObject ) {
					document.getElementsByClassName('upload-message')[i].style.display='none'; 
					document.getElementsByClassName('upload-button-area')[i].style.display = 'none'; 
					// Check the login state
					checkLoginState(
						// If logged in, upload
						function() {uploadLevel(i)}, 
						// Otherwise, Ask to log in
						function() {
							displayMessageOptions( 
							"Would you like to log in to Facebook,", 
							"so your friends can easily see your levels?",
							["Yes", "No", "Cancel"],
							[
								// If they want to use Facebook, then log in
								function() {
									playEffect(0);
									loginToFacebook( 
										// If login, upload!
										function() {uploadLevel(i)},
										// Otherwise, display an error
										function() {
											document.getElementsByClassName('upload-message')[i].innerHTML='Could not connect to Facebook.'; 
											document.getElementsByClassName('upload-message')[i].style.display='block'; 
											document.getElementsByClassName('upload-button-area')[i].style.display = 'block';
										} 
									) 
									hideMessage();
								},
								// Otherwise, allow them to upload
								function() {
									playEffect(0);
									uploadLevel(i);
									hideMessage();
								},
								// Allow for cancel
								function() {
									playEffect(0);
									hideMessage();
									document.getElementsByClassName('upload-button-area')[i].style.display = 'block';
								}
							]
							);
						},
						// Error (FB URL wrong)
						function() {
							document.getElementsByClassName('upload-message')[i].innerHTML='Could not connect.'; 
							document.getElementsByClassName('upload-message')[i].style.display='block'; 
							document.getElementsByClassName('upload-button-area')[i].style.display = 'block';
						} 
					)
				}
				else {
					reloadFB();
					document.getElementsByClassName('upload-message')[i].innerHTML='Could not connect.'; 
					document.getElementsByClassName('upload-message')[i].style.display='block'; 
					document.getElementsByClassName('upload-button-area')[i].style.display = 'block';
				}
			} 
		})(i);
		uploadButton.style.backgroundColor = userLevels[i].checkedTileColor;
		uploadButton.style.color = whiteOrBlack(userLevels[i].checkedTileColor);
		uploadButton.innerHTML = 'Upload';
		
		var uploadMessage = document.createElement("div");
		uploadMessage.className = 'upload-message';
		
		uploadButtonArea.appendChild(uploadButton);
		uploadButtonArea.appendChild(uploadMessage);
		// End upload area
		
		// Share button
		// Note: This is mutually exclusive with the Upload button
		// It is only visible if the upload button is not
		var shareButton = document.createElement("div");
		shareButton.className = 'button level-option-button share-option-button';
		shareButton.onclick = (function(i){ return function() { playEffect(i % 6); shareLevel(userLevels[i].id); } })(i);
		shareButton.style.backgroundColor = userLevels[i].checkedTileColor;
		shareButton.style.color = whiteOrBlack(userLevels[i].checkedTileColor);
		shareButton.innerHTML = 'Share';
		// End share button
		
		hiddenOptionsArea.appendChild(playButton);
		hiddenOptionsArea.appendChild(editButton);
		hiddenOptionsArea.appendChild(deleteButton);
		hiddenOptionsArea.appendChild(jsonButtonArea);
		// Its still there to make it easier to navigate
		if(userLevels[i].uploaded) {
			uploadButtonArea.style.display='none';
		}
		else {
			shareButton.style.display='none';
		}
		hiddenOptionsArea.appendChild(uploadButtonArea);
		hiddenOptionsArea.appendChild(shareButton);
		levelButtonArea.appendChild(hiddenOptionsArea);
		
		// Add the whole thing to the list
		levelList.appendChild(levelButtonArea);
	}
	
	var backButton = document.getElementById('back-button');
	backButton.onclick = function() {playEffect(1); startMenu();};
	board.style.backgroundColor = '';
}

// Upload the level
function uploadLevel(index) {
	// If not logged in, fbUserID will simply be blank
	var uploadLevel = userLevels[index];
	// Create a web service request to upload the level
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4) {
			if (xhttp.status == 200) {
				try {
					var response = JSON.parse(xhttp.responseText);
					if(response.status == 'success') {
						// Check to see if we are still on the same page
						// If so, refreshing will update the display
						if( document.getElementsByClassName('upload-message')[index] ) {
							// +1 because we ignore the new level button
							document.getElementsByClassName('level-button')[index+1].innerHTML += ' &#x1f310;';
							// Notice that we don't need +1 here, because there is no share-option-button on the new level button
							document.getElementsByClassName('share-option-button')[index].style.display = '';
							// Additionally, ensure that the upload button is hidden
							document.getElementsByClassName('upload-message')[index].style.display='none'; 
							document.getElementsByClassName('upload-button-area')[index].style.display = 'none'; 
						}
						// Update user levels regardless
						userLevels[index].uploaded = true;
						userLevels[index].id = response.id;
						saveToDisk();
					}
					// failure
					else {
						if( document.getElementsByClassName('upload-message')[index] ) {
							document.getElementsByClassName('upload-message')[index].style.display='block'; 
							document.getElementsByClassName('upload-button-area')[index].style.display = 'block';
							document.getElementsByClassName('upload-message')[index].innerHTML = "An error uploading your level has occurred.";
						}
					}
				}
				// Response problem
				catch(e) {
					if( document.getElementsByClassName('upload-message')[index] ) {
						document.getElementsByClassName('upload-message')[index].style.display='block'; 
						document.getElementsByClassName('upload-button-area')[index].style.display = 'block';
						document.getElementsByClassName('upload-message')[index].innerHTML = "An error uploading your level has occurred.";
					}
				}
			}
			// failure
			else {
				if( document.getElementsByClassName('upload-message')[index] ) {
					document.getElementsByClassName('upload-message')[index].style.display='block'; 
					document.getElementsByClassName('upload-button-area')[index].style.display = 'block';
					document.getElementsByClassName('upload-message')[index].innerHTML = "Could not connect to Game 103.";
				}
			}
		}
	};
	xhttp.open('POST', 'https://game103.net/game103games/javascript/flip-a-blox/ws/insertlevel.php', true);
	xhttp.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	
	var sendPackage = JSON.stringify({'facebook_user_id': fbUserID, 'level': uploadLevel});
	xhttp.send(sendPackage);
}

// Update the menu with json
function getJSON(index) {
	// Make sure the code isn't there already
	// NO update necessary - list remade after go into level
	var json = JSON.parse(JSON.stringify(userLevels[index]));
	// Don't show others how to beat the level :)
	delete json['actionStack'];
	// Delete unecessary info for sharing
	delete json['row'];
	delete json['col'];
	delete json['flippedColumnsRight'];
	delete json['flippedColumnsLeft'];
	delete json['flippedRowsTop'];
	delete json['flippedRowsBottom'];
	delete json['uploaded'];
	delete json['id'];
	json = JSON.stringify(json);
	var correctOptions = document.getElementsByClassName('json-code-area')[index];
	correctOptions.innerHTML = "<textarea class='json-textarea'>" + json + "</textarea>";
}

/* Sub menu toggle for level created list */
// This can be used than more than just the level creator
// if menus are in a similar style
function toggleLevelCreatorListSubMenu(listIndex) {
	var menuArea = document.getElementsByClassName('hidden-options-area')[listIndex];
	if(menuArea.style.display == 'none') {
		playEffect(0);
		menuArea.style.display = 'block';
	}
	else {
		playEffect(1);
		menuArea.style.display = 'none';
	}
}

// Toggle for a static list (only one)
function toggleStaticHiddenArea() {
	var menuArea = document.getElementsByClassName('hidden-options-area-static')[0];
	if(menuArea.style.display == 'none') {
		playEffect(0);
		menuArea.style.display = 'block';
	}
	else {
		playEffect(1);
		menuArea.style.display = 'none';
		document.getElementById("invalid-code").style.display = 'none';
	}
}

/* Start Collection (Online) */
function startCollection() {
	// NOTE THIS SET HERE!
	gameType = "collection";
	removeAllEventListeners();
	document.getElementById('playing-menu').style.display = 'none';
	document.getElementById('main-menu').style.display = 'none';
	document.getElementById('online-menu').style.display = 'none';
	// Use levels-menu
	document.getElementById('levels-menu').style.display = 'block';
	var board = document.getElementById('board');
	board.style.backgroundColor = '';
	// Reuser level list here
	board.innerHTML = '<div id="level-list"></div>';
	board.style.backgroundColor = '';
	var levelList = document.getElementById('level-list');
	
	var newCoursesButton = document.createElement("div");
	newCoursesButton.className = 'level-button button';
	newCoursesButton.onclick = function() { playEffect(0); startFindNewCourses(); };
	newCoursesButton.innerHTML = "Find Levels Online";
	levelList.appendChild(newCoursesButton);
	
	// Create an area to load JSON
	var loadJsonButtonArea = document.createElement("div");
	
	var loadJsonButton = document.createElement("div");
	loadJsonButton.className = 'level-button button';
	loadJsonButton.onclick = function() { toggleStaticHiddenArea(); };
	loadJsonButton.innerHTML = "Enter code";
	//
	// Create the area with options below the actual button
	var hiddenOptionsArea = document.createElement("div");
	hiddenOptionsArea.className = 'hidden-options-area-static';
	hiddenOptionsArea.style.display = 'none';
	
	var jsonBox = document.createElement("div");
	jsonBox.className = 'json-textarea-box';
	jsonBox.innerHTML = "<textarea class='json-textarea'></textarea><div id='invalid-code'>Invalid Code!</div>";
	hiddenOptionsArea.appendChild(jsonBox);
	
	var saveButton = document.createElement("div");
	saveButton.className = 'button level-option-button';
	saveButton.onclick = function() {playEffect(0); startLoadJson();};
	saveButton.innerHTML = 'Save';
	hiddenOptionsArea.appendChild(saveButton);
	
	loadJsonButtonArea.appendChild(loadJsonButton);
	loadJsonButtonArea.appendChild(hiddenOptionsArea);
	
	levelList.appendChild(loadJsonButtonArea);
	
	for(var i = 0; i < collectionLevels.length; i++) {
		var levelButtonArea = document.createElement("div");
		
		// Create the button
		var levelButton = document.createElement("div");
		levelButton.className = 'level-button button';
		levelButton.onclick = (function(i){ return function() { toggleLevelCreatorListSubMenu(i); } })(i);
		levelButton.innerHTML = String(i + 1) + ": " + collectionLevels[i].name;
		if(collectionLevels[i].moves != null) {
			levelButton.innerHTML += ' - ' + collectionLevels[i].moves + ' moves';
		}
		if(collectionLevels[i].date) {
			var date = new Date(collectionLevels[i].date);
			levelButton.innerHTML += ' - ' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
		}
		if(collectionLevels[i].userMoves) {
			if(collectionLevels[i].userMoves <= collectionLevels[i].moves) {
				levelButton.innerHTML += ' &#9733;'
			}
		}
		levelButton.style.backgroundColor = collectionLevels[i].backgroundColor;
		levelButton.style.color = whiteOrBlack(collectionLevels[i].backgroundColor);
		levelButtonArea.appendChild(levelButton);
		
		// Create the area with options below the actual button
		var hiddenOptionsArea = document.createElement("div");
		hiddenOptionsArea.className = 'hidden-options-area';
		hiddenOptionsArea.style.display = 'none';
		
		var playButton = document.createElement("div");
		playButton.className = 'button level-option-button';
		playButton.onclick = (function(i){ return function() {currentLevelIndex = i; playEffect(i % 6); startGame();} })(i);
		playButton.style.backgroundColor = collectionLevels[i].tileColor;
		playButton.style.color = whiteOrBlack(collectionLevels[i].tileColor);
		playButton.innerHTML = 'Play';
		
		var deleteButton = document.createElement("div");
		deleteButton.className = 'button level-option-button';
		// Note, the manageInput function has no power in menus
		// Thus, you must control hiding the image
		// This is good, since managed input is taylored for the game itself
		deleteButton.onclick = (function(i){ return function() {playEffect(i % 6); 
			var options = ["Yes","No"];
			var optionCallbacks = [
				function() {
					playEffect(0);
					collectionLevels.splice(i, 1);
					saveToDisk();
					startCollection();
					// This is taken care of by removeAllEventListeners
					//hideMessage();
				},
				function() {
					playEffect(0);
					hideMessage();
				}
			];
			displayMessageOptions("Are you sure", "you want to delete this level ("+collectionLevels[i].name+")?", options, optionCallbacks);
		} })(i);
		deleteButton.style.backgroundColor = collectionLevels[i].checkedTileColor;
		deleteButton.style.color = whiteOrBlack(collectionLevels[i].checkedTileColor);
		deleteButton.innerHTML = 'Delete';
		
		hiddenOptionsArea.appendChild(playButton);
		hiddenOptionsArea.appendChild(deleteButton);
		
		levelButtonArea.appendChild(hiddenOptionsArea);
		
		// Add the whole thing to the list
		levelList.appendChild(levelButtonArea);
	}
	
	var backButton = document.getElementById('back-button');
	backButton.onclick = function() {playEffect(1); startMenu()};
	board.style.backgroundColor = '';
}

// Start load by code
function startLoadJson() {
	// We'll get the input and validate it as a level
	// If so, the list will be refreshed of collection levels
	// If not, display an error message
	var invalid = false;
	var jsonLevel = document.getElementsByClassName('json-textarea')[0].value;
	try {
		jsonLevel = JSON.parse(jsonLevel);
	}
	catch(e) {
		invalid = true;
	}
	// Make sure the input is valid json
	if(!invalid) {
		// Make sure everything is defined
		if( !jsonLevel.name || !jsonLevel.moves || !jsonLevel.tiles || !jsonLevel.dimensions || !jsonLevel.image || !jsonLevel.backgroundColor || !jsonLevel.tileColor || !jsonLevel.checkedTileColor || !jsonLevel.song || !jsonLevel.matrix ) {
			invalid = true;
		}
		// Now check the values
		else {
			if(jsonLevel.name.length > 10) {
				invalid = true;
			}
			else if( /[^a-zA-Z\d\-!\? ]/.test(jsonLevel.name) ) {
				invalid = true;
			}
			else if( !Number.isInteger(jsonLevel.moves) ) {
				invalid = true;
			}
			else if(jsonLevel.moves < 1) {
				invalid = true;
			}
			else if( !Number.isInteger(jsonLevel.tiles) ) {
				invalid = true;
			}
			else if(jsonLevel.tiles < 2) {
				invalid = true;
			}
			else if( !Number.isInteger(jsonLevel.dimensions) ) {
				invalid = true;
			}
			else if(jsonLevel.dimensions < 2) {
				invalid = true;
			}
			else if(possibleImages.indexOf(jsonLevel.image) == -1) {
				invalid = true;
			}
			else if(possibleAudio.indexOf(jsonLevel.song) == -1) {
				invalid = true;
			}
			else if(! /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(jsonLevel.backgroundColor)) {
				invalid = true;
			}
			else if(! /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(jsonLevel.tileColor)) {
				invalid = true;
			}
			else if(! /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(jsonLevel.checkedTileColor)) {
				invalid = true;
			}
			else {
				if( jsonLevel.matrix.constructor === Array ) {
					if(jsonLevel.matrix.length != jsonLevel.dimensions) {
						invalid = true;
					}
					else {
						var tileCount = 0;
						outer:
							for(var i = 0; i < jsonLevel.dimensions; i++) {
								var curRow = jsonLevel.matrix[i];
								if(curRow.constructor !== Array) {
									invalid = true;
									break outer;
								}
								if(curRow.length != jsonLevel.dimensions) {
									invalid = true;
									break outer;
								}
								for(var j = 0; j < jsonLevel.dimensions; j++) {
									if(jsonLevel.matrix[i][j] != 0 &&  jsonLevel.matrix[i][j] != VALID) {
										invalid = true;
										break outer;
									}
									else if(jsonLevel.matrix[i][j] == VALID) {
										tileCount += 1;
									}
								}
							}
						if(!invalid) {
							if(jsonLevel.tiles != tileCount) {
								invalid = true;
							}
						}
					}
				}
				else {
					invalid = true;
				}
			}
		}
	}
	if(!invalid) {
		// Add the level object to the collection
		collectionLevels.push(jsonLevel);
		saveToDisk();
		startCollection();
	}
	else {
		document.getElementById("invalid-code").style.display = 'block';
		document.getElementsByClassName('json-textarea')[0].oninput = function() { 
			document.getElementById("invalid-code").style.display = 'none';
			document.getElementsByClassName('json-textarea')[0].oninput = null;
		};
	}
}

// Start game with download online
function startOnlineGame() {
	// May or may not be necessary
	gameType = 'online';
	document.getElementById('download-button').style.display = '';
	startGame();
	document.getElementById('download-button').onclick = function() {
		playEffect(3);
		// Hide the option to download
		document.getElementById('download-button').style.display = 'none';
		// Easily copy the level
		collectionLevels.push( JSON.parse( JSON.stringify(level) ) );
		saveToDisk();
	};
	document.getElementById('share-button').onclick = function() {
		playEffect(4);
		shareLevel(level.id);
	};
}

// Start find new courses online
// Note, to changes results, simply change the onlineSearch object and call this function again
function startFindNewCourses() {
	gameType = 'online';
	removeAllEventListeners();
	document.getElementById('main-menu').style.display = 'none';
	document.getElementById('levels-menu').style.display = 'none';
	document.getElementById('playing-menu').style.display = 'none';
	document.getElementById('online-menu').style.display = 'block';
	
	var board = document.getElementById('board');
	board.innerHTML = 'Loading...';
	
	document.getElementById('right-arrow').style.visibility = 'hidden';
	document.getElementById('left-arrow').style.visibility = 'hidden';
	document.getElementById('first-online-button').style.visibility = 'hidden';
	
	// Whose level's do you want?
	var onlineCategory = document.getElementById('online-category');
	onlineCategory.onchange = function() {
		clearTimeout(onlineTimeout); 
		
		onlineSearch.start = 0;
		var newCategoryValue = onlineCategory.value;
		// no facebook user ids
		if(newCategoryValue == 'all') {
			onlineSearch.facebook_user_ids = [];
			// Hide the arrows on start
			document.getElementById('right-arrow').style.visibility = 'hidden';
			document.getElementById('left-arrow').style.visibility = 'hidden';
			document.getElementById('first-online-button').style.visibility = 'hidden';
			onlineTimeout = setTimeout( requestNewCourses, 50 ); 
		}
		else {
			// Check if logged into facebook
			// If yes, get friends ids and put in list -> call ws
			// If no, Ask to login
			// After login, get friends ids and put in list -> call ws
			if(webFBObject || appFBObject) {
				checkLoginState(
					// We are logged in, get the friend list, and call the web service to update the display when done
					loadFacebookFriendsAndLevels,
					// Otherwise, Ask to log in
					function() {
						displayMessageOptions( 
						"Would you like to log in to Facebook,", 
						"so you can see your friends levels?",
						["Yes", "No"],
						[
							// If they want to use Facebook, then log in
							function() {
								playEffect(0);
								loginToFacebook( 
									loadFacebookFriendsAndLevels,
									// Otherwise, display an error if the login was unsuccessful
									function() {
										board.innerHTML = 'Could not connect to Facebook.';
										document.getElementById('left-arrow').style.visibility = 'hidden';
										document.getElementById('right-arrow').style.visibility = 'hidden';
										document.getElementById('first-online-button').style.visibility = 'hidden';
									} 
								) 
								hideMessage();
							},
							// Otherwise, show an error
							function() {
								playEffect(0);
								board.innerHTML = 'Could not connect to Facebook.';
								document.getElementById('left-arrow').style.visibility = 'hidden';
								document.getElementById('right-arrow').style.visibility = 'hidden';
								document.getElementById('first-online-button').style.visibility = 'hidden';
								hideMessage();
							}
						]
						);
					},
					// Show an error if wrong url
					function() {
						board.innerHTML = 'Could not connect to Facebook.';
						document.getElementById('left-arrow').style.visibility = 'hidden';
						document.getElementById('right-arrow').style.visibility = 'hidden';
						document.getElementById('first-online-button').style.visibility = 'hidden';
						hideMessage();
					}
				);
			}
			else {
				reloadFB();
				board.innerHTML = 'Could not connect to Facebook.';
				document.getElementById('left-arrow').style.visibility = 'hidden';
				document.getElementById('right-arrow').style.visibility = 'hidden';
				document.getElementById('first-online-button').style.visibility = 'hidden';
			}
		}
	};
	
	// How do you want to sort?
	var onlineSort = document.getElementById('online-sort');
	onlineSort.onchange = function() {
		clearTimeout(onlineTimeout); 
		
		onlineSearch.start = 0;
		onlineSearch.order = onlineSort.value;
		
		document.getElementById('right-arrow').style.visibility = 'hidden';
		document.getElementById('left-arrow').style.visibility = 'hidden';
		document.getElementById('first-online-button').style.visibility = 'hidden';
		onlineTimeout = setTimeout( requestNewCourses, 50 ); 
	};
	
	// What is your search
	var onlineSearchElement = document.getElementById('online-search');
	onlineSearchElement.oninput = function() { 
		clearTimeout(onlineTimeout); 
		
		onlineSearch.start = 0;
		onlineSearch.search = onlineSearchElement.value;
		
		document.getElementById('right-arrow').style.visibility = 'hidden';
		document.getElementById('left-arrow').style.visibility = 'hidden';
		document.getElementById('first-online-button').style.visibility = 'hidden';
		onlineTimeout = setTimeout( requestNewCourses, 500 ); 
	};
	
	// Pagination
	var rightArrow = document.getElementById('right-arrow');
	rightArrow.onclick = function() { 
		clearTimeout(onlineTimeout); 
		
		playEffect(0);
		onlineSearch.start += 10;
		
		document.getElementById('right-arrow').style.visibility = 'hidden';
		document.getElementById('left-arrow').style.visibility = 'hidden';
		document.getElementById('first-online-button').style.visibility = 'hidden';
		onlineTimeout = setTimeout( requestNewCourses, 50 ); 
	};
	var leftArrow = document.getElementById('left-arrow');
	leftArrow.onclick = function() { 
		clearTimeout(onlineTimeout); 
		
		playEffect(1);
		onlineSearch.start -= 10;
		if(onlineSearch.start < 0) onlineSearch.start = 0;
		
		document.getElementById('right-arrow').style.visibility = 'hidden';
		document.getElementById('left-arrow').style.visibility = 'hidden';
		document.getElementById('first-online-button').style.visibility = 'hidden';
		onlineTimeout = setTimeout( requestNewCourses, 50 ); 
	};
	
	// Clear search
	var clearButton = document.getElementById('clear-online-button');
	clearButton.onclick = function() { 
		clearTimeout(onlineTimeout); 
		
		playEffect(0);
		onlineSearch.facebook_user_ids = [];
		onlineSearch.order = 1;
		onlineSearch.start = 0;
		onlineSearch.search = '';
		
		document.getElementById('right-arrow').style.visibility = 'hidden';
		document.getElementById('left-arrow').style.visibility = 'hidden';
		document.getElementById('first-online-button').style.visibility = 'hidden';
		onlineTimeout = setTimeout( requestNewCourses, 50 ); 
	};
	
	// Refresh
	var refreshButton = document.getElementById('refresh-online-button');
	refreshButton.onclick = function() { 
		clearTimeout(onlineTimeout); 
		
		playEffect(0);
		
		document.getElementById('right-arrow').style.visibility = 'hidden';
		document.getElementById('left-arrow').style.visibility = 'hidden';
		document.getElementById('first-online-button').style.visibility = 'hidden';
		onlineTimeout = setTimeout( requestNewCourses, 50 ); 
	};
	
	// To first page
	var firstButton = document.getElementById('first-online-button');
	firstButton.onclick = function() { 
		clearTimeout(onlineTimeout); 
		
		playEffect(0);
		onlineSearch.start = 0;
		
		document.getElementById('right-arrow').style.visibility = 'hidden';
		document.getElementById('left-arrow').style.visibility = 'hidden';
		document.getElementById('first-online-button').style.visibility = 'hidden';
		onlineTimeout = setTimeout( requestNewCourses, 50 ); 
	};
	
	var backButton = document.getElementById('back-online-button');
	backButton.onclick = function() {playEffect(1); startCollection();};
	board.style.backgroundColor = '';

	document.getElementById('board').ontouchend = function(e) {
		if( document.getElementById('online-search') ) {
			document.getElementById('online-search').blur();
		}
	}
	
	onlineTimeout = setTimeout( requestNewCourses, 500 );
	matchMenusToSearch();
}

// Request new courses
function requestNewCourses() {
	hideMessage();
	var board = document.getElementById('board');
	// Abort the previous request
	if(newLevelsRequest) {
		newLevelsRequest.abort();
	}
	board.innerHTML = 'Loading...';
	
	// Create a web service request to get new levels
	var xhttp = new XMLHttpRequest();
	// Set the global xhttp request to the local one
	newLevelsRequest = xhttp;
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4) {
			if (xhttp.status == 200) {
				try {
					var response = JSON.parse(xhttp.responseText);
					if(response.status == 'success') {
						onlineSearch.responseCount = response.count;
						onlineSearch.responseLevels = response.levels;
						showNewLoadedCourses();
					}
					// failure
					else {
						if( document.getElementById('online-menu').style.display != 'none' ) {
							board.innerHTML = 'An error occurred getting levels.';
							document.getElementById('left-arrow').style.visibility = 'hidden';
							document.getElementById('right-arrow').style.visibility = 'hidden';
							document.getElementById('first-online-button').style.visibility = 'hidden';
						}
					}
				}
				// Response problem
				catch(e) {
					if( document.getElementById('online-menu').style.display != 'none' ) {
						board.innerHTML = 'An error occurred getting levels.';
						document.getElementById('left-arrow').style.visibility = 'hidden';
						document.getElementById('right-arrow').style.visibility = 'hidden';
						document.getElementById('first-online-button').style.visibility = 'hidden';
					}
				}
			}
			// failure
			else {
				if( document.getElementById('online-menu').style.display != 'none' ) {
					board.innerHTML = "Could not connect to Game 103.";
					document.getElementById('left-arrow').style.visibility = 'hidden';
					document.getElementById('right-arrow').style.visibility = 'hidden';
					document.getElementById('first-online-button').style.visibility = 'hidden';
				}
			}
		}
	};
	xhttp.open('GET', 'https://game103.net/game103games/javascript/flip-a-blox/ws/getlevels.php?facebook_user_ids=' + onlineSearch.facebook_user_ids.join() + '&limit=' + onlineSearch.limit + '&start=' + onlineSearch.start + '&order=' + onlineSearch.order + '&search=' + onlineSearch.search, true);
	xhttp.send();
}

// Update the view with courses found only if the user is still on the right page
function showNewLoadedCourses() {
	// Check to make sure we are still on the right page
	if( document.getElementById('online-menu').style.display != 'none' ) {
		
		var board = document.getElementById('board');
		
		var maxPage = Math.ceil(onlineSearch.responseCount/onlineSearch.limit);
		var currentPage = Math.ceil((onlineSearch.start+1)/onlineSearch.limit);
		
		board.innerHTML = '<div id="level-list"></div>';
		board.style.backgroundColor = '';
		var levelList = document.getElementById('level-list');
		if(maxPage > 0) {
			levelList.innerHTML = '<div>Page ' + currentPage.toString() + ' of ' + maxPage.toString() + '</div>';
		}
		else {
			levelList.innerHTML = '<div>No results found.</div>';
		}
		for(var i = 0; i < onlineSearch.responseLevels.length; i++) {
			var levelButton = document.createElement("div");
			levelButton.className = 'level-button button';
			levelButton.onclick = (function(i){ return function() {currentLevelIndex = i; playEffect(i % 6); startOnlineGame(); updateSaves(); } })(i);
			levelButton.innerHTML = String(i + onlineSearch.start + 1) + ": " + onlineSearch.responseLevels[i].name;
			// If not FB friends, this array will be empty
			if(onlineSearch.facebook_user_ids.length > 0) {
				var nameIndex = onlineSearch.facebook_user_ids.indexOf(onlineSearch.responseLevels[i].facebook_user_id);
				levelButton.innerHTML += ' by ' + onlineSearch.facebook_user_names[ nameIndex ];
			}
			// Room conservation
			else {
				if(onlineSearch.responseLevels[i].moves != null) {
				levelButton.innerHTML += ' - ' + onlineSearch.responseLevels[i].moves + ' moves';
				}
				if(onlineSearch.responseLevels[i].date) {
					var date = new Date(onlineSearch.responseLevels[i].date);
					levelButton.innerHTML += ' - ' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
				}
			}
			levelButton.style.backgroundColor = onlineSearch.responseLevels[i].backgroundColor;
			levelButton.style.color = whiteOrBlack(onlineSearch.responseLevels[i].backgroundColor);
			levelList.appendChild(levelButton);
		}
		
		// Show arrows if appropriate
		if(maxPage > 1 && currentPage > 1) {
			document.getElementById('first-online-button').style.visibility = 'visible';
		}
		else {
			document.getElementById('first-online-button').style.visibility = 'hidden';
		}
		if(onlineSearch.start + onlineSearch.limit < onlineSearch.responseCount) {
			document.getElementById('right-arrow').style.visibility = 'visible';
		}
		else {
			document.getElementById('right-arrow').style.visibility = 'hidden';
		}
		if(onlineSearch.start > 0) {
			document.getElementById('left-arrow').style.visibility = 'visible';
		}
		else {
			document.getElementById('left-arrow').style.visibility = 'hidden';
		}
		matchMenusToSearch();
		// Once we load, get rid of Facebook questions
		hideMessage();
	}
}

// Update the display to match whats in memory for online
function matchMenusToSearch() {
	document.getElementById('online-category').value = onlineSearch.facebook_user_ids.length == 0 ? 'all' : 'friends';
	document.getElementById('online-sort').value = onlineSearch.order;
	document.getElementById('online-search').value = onlineSearch.search;
}

// Load Facebook Friends and their levels
// This should be called if login is known to be true
function loadFacebookFriendsAndLevels() {
	// This needs to be shown earlier, since we need to request
	// to Facebook too
	document.getElementById('board').innerHTML = 'Loading...';
	if(appFBObject) {
		appFBObject.api(
			"/" + fbUserID + "/friends",
			['public_profile', 'user_friends'],
			function (response) {
				loadFacebookLevelsUponResponse(response);
			},
			// We know we are logged in
			function () { return null; }
		);
	}
	else {
		webFBObject.api(
			"/" + fbUserID + "/friends",
			// Once the friends are received
			function (response) {
				loadFacebookLevelsUponResponse(response);
			}
		);
	}
}

// React after receiving a response from FB about friends
// (Helper to function above)
function loadFacebookLevelsUponResponse(response) {
	if(response && !response.error) {
		onlineSearch.facebook_user_ids = [];
		for(var i = 0; i < response.data.length; i++) {
			onlineSearch.facebook_user_ids.push(response.data[i].id);
			onlineSearch.facebook_user_names.push(response.data[i].name);
		}
		document.getElementById('right-arrow').style.visibility = 'hidden';
		document.getElementById('left-arrow').style.visibility = 'hidden';
		document.getElementById('first-online-button').style.visibility = 'hidden';
		if(onlineSearch.facebook_user_ids.length > 0) {
			onlineTimeout = setTimeout( requestNewCourses, 50 ); 
		}
		else {
			document.getElementById('board').innerHTML = 'You do not have any Facebook friends who play Flip-a-Blox.';
		}
	}
	else {
		document.getElementById('board').innerHTML = 'Could not connect to Facebook.';
		document.getElementById('left-arrow').style.visibility = 'hidden';
		document.getElementById('right-arrow').style.visibility = 'hidden';
		document.getElementById('first-online-button').style.visibility = 'hidden';
	}
}

// Update saves for a level
function updateSaves() {
	var xhttp = new XMLHttpRequest();
	xhttp.open('GET', 'https://game103.net/game103games/javascript/flip-a-blox/ws/updatesaves.php?id=' + level.id, true);
	xhttp.send();
}

// These functions are for URL load
// Load a level via Id
function requestSingleCourse(id) {
	var board = document.getElementById('board');
	board.innerHTML = 'Loading...';
	
	// Create a web service request to get new levels
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4) {
			if (xhttp.status == 200) {
				try {
					var response = JSON.parse(xhttp.responseText);
					if(response.status == 'success') {
						if(response.levels.length > 0) {
							// Set response levels to this sole level (It is sort of an online level,
							// just not loaded in the same way as others)
							onlineSearch.responseLevels = response.levels;
							currentLevelIndex = 0; 
							startOnlineGame();
						}
						// Level not found
						else {
							startMenu();
						}
					}
					// failure
					else {
						startMenu();
					}
				}
				// Response problem
				catch(e) {
					startMenu();
				}
			}
			// failure
			else {
				startMenu();
			}
		}
	};
	xhttp.open('GET', 'https://game103.net/game103games/javascript/flip-a-blox/ws/getlevels.php?id=' + id, true);
	xhttp.send();
}

/* Start the winning view */
function startWin() {
	removeAllEventListeners();
	document.getElementById('playing-menu').style.display = 'none';
	document.getElementById('online-menu').style.display = 'none';
	document.getElementById('main-menu').style.display = 'none';
	document.getElementById('levels-menu').style.display = 'block';
	var board = document.getElementById('board');
	board.innerHTML = '<div id="thanks">Thank you for playing Flip-a-Blox!</div>';
	board.innerHTML += '<img id="logo-small" src="images/logo.png"/>';
	board.innerHTML += '<img id="congratulations" src="images/congratulations.png"/>';
	board.style.backgroundColor = '';
	var backButton = document.getElementById('back-button');
	backButton.onclick = function() {playEffect(1); startLevels();};
}

// Start game as a tutorial
function startTutorial() {
	// May or may not be necessary
	gameType = 'tutorial';
	startGame();
	tutorialInstructionIndex = -1;
	callbackAfterMessage = nextTutorialMessage;
	nextTutorialMessage();
}

// Show the next tutorial message, or hide it if it is the last one
function nextTutorialMessage() {
	tutorialInstructionIndex ++;
	if(tutorialInstructions[tutorialInstructionIndex+1]) {
		displayMessage( "Flip-a-Blox Tutorial", tutorialInstructions[tutorialInstructionIndex].message );
	}
	else {
		callbackAfterMessage = function() {};
		hideMessage();
		playing_state = true;
	}
}


/* Menu stuff */

// Start the menu
function startMenu() {
	removeAllEventListeners();
	document.getElementById('playing-menu').style.display = 'none';
	document.getElementById('levels-menu').style.display = 'none';
	document.getElementById('online-menu').style.display = 'none';
	document.getElementById('main-menu').style.display = 'block';
	var playButton = document.getElementById('play-button');
	playButton.onclick = function() { playEffect(0); startLevels(); };
	var creatorButton = document.getElementById('creator-button');
	creatorButton.onclick = function() { playEffect(0); startLevelCreatorList(); };
	var collectionButton = document.getElementById('collection-button');
	collectionButton.onclick = function() { playEffect(0); startCollection(); };
	
	// Check to see if the user has cleared all levels with a star
	// If, so, display congratulations
	var passed = false;
	if(levelRecords.length == levels.length) {
		passed = true;
		for(var i = 0; i < levelRecords.length; i++) {
			if(levelRecords[i] > levels[i].moves) {
				passed = false;
			}
		}
	}
	
	var board = document.getElementById('board');
	board.innerHTML = '<a href="https://game103.net" target="_blank"><img id="g103logo" src="images/g103logo.png"/></a>';
	board.innerHTML += '<a target="_blank" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=Y6EMAFJYS4X4E"><div class="button" id="donate">Donate</div></a>';
	board.innerHTML += '<a target="_blank" href="https://game103.net/app/flip-a-blox"><div class="button" id="privacy">Privacy</div></a>';
	if(!passed) {
		board.innerHTML += '<img id="logo" src="images/logo.png"/>';
	}
	else {
		board.innerHTML += '<div></div>';
		board.innerHTML += '<img id="logo-very-small" src="images/logo.png"/>';
		board.innerHTML += '<img id="congratulations" src="images/congratulations.png"/>';
	}
	board.innerHTML += "<div id='credits'><div id='kasey'>Music, levels, and design by Kasey Mann</div><div id='james'>Programming and concept by James Grams</div><div id='freesfx'>Sound effects by <a href='http://freesfx.co.uk' target='_blank'>freesfx.co.uk</a></div><div id='copyright'>&copy; 2017 <a href='https://game103.net' target='_blank'>game103.net</a></div></div>";
	board.style.backgroundColor = '';
	
	// Music, create a dummy level for easy function interaction
	level = { song: 'sound/menu.mp3' };
	changeSong();
}

function removeAllEventListeners() {
	var dummyFunction = null;
	document.onkeydown = dummyFunction;
	document.getElementById('pivot-button').onclick = dummyFunction;
	document.getElementById('undo-button').onclick = dummyFunction;
	document.getElementById('message').onclick = dummyFunction;
	document.getElementById('message').style.visibility = 'hidden';
	document.getElementById('play-button').onclick = dummyFunction;
	document.getElementById('back-button').onclick = dummyFunction;
	document.getElementById('refresh-button').onclick = dummyFunction;
	document.getElementById('menu-button').onclick = dummyFunction;
	document.getElementById('mute-button').onclick = dummyFunction;
	document.getElementById('save-button').onclick = dummyFunction;
	document.getElementById('color-button').onclick = dummyFunction;
	document.getElementById('audio-button').onclick = dummyFunction;
	document.getElementById('character-button').onclick = dummyFunction;
	document.getElementById('clear-button').onclick = dummyFunction;
	document.getElementById('right-arrow').onclick = dummyFunction;
	document.getElementById('left-arrow').onclick = dummyFunction;
	document.getElementById('back-online-button').onclick = dummyFunction;
	document.getElementById('download-button').onclick = dummyFunction;
	document.getElementById('share-button').onclick = dummyFunction;
	document.getElementById('clear-online-button').onclick = dummyFunction;
	document.getElementById('board').ontouchstart = function() {return true;};
	document.getElementById('board').ontouchend = function() {return true;};
	document.getElementById('board').ontouchmove = function() {return true;};
	var levelButtons = document.getElementsByClassName('level-button');
	for(var i = 0; i < levelButtons.length; i++) {
		levelButtons[i].onclick = dummyFunction;
	}
}

/** Save & Save Check Functions **/

/* Save the game to the computer */
function saveToDisk() {
	window.localStorage.setItem("unlockedLevelIndex", unlockedLevelIndex);
	window.localStorage.setItem("levelRecords", JSON.stringify(levelRecords));
	window.localStorage.setItem("userLevels", JSON.stringify(userLevels));
	window.localStorage.setItem("collectionLevels", JSON.stringify(collectionLevels));
}

/* Load from disk */
function loadFromDisk() {
	if(window.localStorage.getItem("unlockedLevelIndex")) {
		unlockedLevelIndex = parseInt(window.localStorage.getItem("unlockedLevelIndex"));
		levelRecords = JSON.parse(window.localStorage.getItem("levelRecords"));
		userLevels = JSON.parse(window.localStorage.getItem("userLevels"));
		collectionLevels = JSON.parse(window.localStorage.getItem("collectionLevels"));
	}
}

// NOTE: On an options menu, if you are going to close the options menu
// The effect played should always be 0 for consistency's sake.

// Save a created level
// Uses level, moves, tiles, and dimensions in global memory
// This uses the option menu and will always be the last menu seen
// (Why it always sets messageOptions to false)
// You can give it a callback to perform once it finishes (i.e. go to menu)
// Note: will disable callbackAfterMessage
function saveCreatedLevel(thenFunction, hideCancel) {
	if(document.getElementById('save-button').innerHTML.length < 4) {
		// Notice how date gets reset here.
		var newLevel = createLevel(moves, level.dimensions, tiles);
		newLevel.matrix = [];
		if(!level.name) {
			level.name = 'A Level';
			document.getElementById('level-input').value = level.name;
		}
		newLevel.name = level.name;
		newLevel.backgroundColor = level.backgroundColor;
		newLevel.checkedTileColor = level.checkedTileColor;
		newLevel.image = level.image;
		newLevel.tileColor = level.tileColor;
		newLevel.song = level.song;
		//if(gameType == 'creator') {
		// These are only needed in case the user wants to edit the level
		newLevel.row = row;
		newLevel.col = col;
		newLevel.flippedColumnsRight = flippedColumnsRight;
		newLevel.flippedColumnsLeft = flippedColumnsLeft;
		newLevel.flippedRowsTop = flippedRowsTop;
		newLevel.flippedRowsBottom = flippedRowsBottom;
		newLevel.actionStack = actionStack;
		//}
		//
		for(var i = 0; i < level.dimensions; i++) {
			newLevel.matrix[i] = creationMat[i].slice();
		}
		
		for(var i = 0; i < userLevels.length; i++) {
			// If this is an already saved level
			if(i == currentLevelIndex && userLevels[i].name == level.name) {
				var title = "Do you want to overwrite";
				var message = "your previously saved level?";
				var options = [];
				var optionCallbacks = [];
				options.push("Save as new");
				options.push("Overwrite");
				if(!hideCancel) {
					options.push("Cancel");
				}
				optionCallbacks.push( 
					function() {
						userLevels.push(newLevel);
						// Update currentLevelIndex
						currentLevelIndex = userLevels.length - 1;
						// This will allow for the click to be registered
						// by the message and result in a close
						// (Click propagation travels up)
						messageOptions = false;
						enableDisableSave();
						saveToDisk();
						if(thenFunction) thenFunction();
					}
				);
				optionCallbacks.push( 
					function() { 
						// Since overwrite, no need to update level index here
						userLevels[i] = newLevel;
						messageOptions = false;
						enableDisableSave();
						saveToDisk();
						if(thenFunction) thenFunction();
					}
				);
				if(!hideCancel) {
					optionCallbacks.push( 
						function() {
							messageOptions = false;
						} 
					);
				}
				callbackAfterMessage = function() {};
				displayMessageOptions(title, message, options, optionCallbacks);
				return;
			}
		}
		userLevels.push(newLevel);
		// Update currentLevelIndex
		currentLevelIndex = userLevels.length - 1;
		enableDisableSave();
		saveToDisk();
	}

	messageOptions = false;
	if(thenFunction) thenFunction();
}

// Enable/Disable saving
function enableDisableSave() {
	// Need some moves to save
	if(moves > 0) {
		// If the level has not been saved at all, this won't be defined
		if(userLevels[currentLevelIndex]) {
			// If the dims don't match
			if(userLevels[currentLevelIndex].dimensions != level.dimensions) {
				document.getElementById('save-button').innerHTML = "&#x1f4be; ";
			}
			else {
				// Check matrix
				var creationMatMatchesSaved = true;
				for(var i = 0; i < userLevels[currentLevelIndex].dimensions; i++) {
					for(var j = 0; j < userLevels[currentLevelIndex].dimensions; j++) {
						if(userLevels[currentLevelIndex].matrix[i][j] != creationMat[i][j]) {
							creationMatMatchesSaved = false;
						}
					}
				}
				if(!creationMatMatchesSaved) {
					document.getElementById('save-button').innerHTML = "&#x1f4be; ";
				}
				// Check other properties
				// Note, all other properties about the level are simply stored in information about the level
				// creationMat, moves, and tiles are exceptions
				else {
					var reasonToSave = false;
					var levelKeys = Object.keys(level);
					for(var i = 0; i < levelKeys.length; i++) {
						// Date change not worth requiring save
						if(levelKeys[i] != 'matrix' && levelKeys[i] != 'date') {
							if(levelKeys[i] == 'moves') {
								if(userLevels[currentLevelIndex][levelKeys[i]] != moves) {
									reasonToSave = true;
								}
							}
							// This might not be necessary?
							else if(levelKeys[i] == 'tiles') {
								if(userLevels[currentLevelIndex][levelKeys[i]] != tiles) {
									reasonToSave = true;
								}
							}
							else if(userLevels[currentLevelIndex][levelKeys[i]] != level[levelKeys[i]]) {
								reasonToSave = true;
							}
						}
					}
					if(reasonToSave) {
						document.getElementById('save-button').innerHTML = "&#x1f4be; ";
					}
					else {
						document.getElementById('save-button').innerHTML = "&#x1f4be; &#x2713;";
					}
				}
			}
		}
		else {
			document.getElementById('save-button').innerHTML = "&#x1f4be; ";
		}
	}
	else {
		document.getElementById('save-button').innerHTML = "&#x1f4be; &#x2713;";
	}
}

/* Go to Course Creator Menu with a save check */
function startLevelCreatorMenuSaveCheck() {
	// If the check mark is not displayed
	if(document.getElementById('save-button').innerHTML.length < 4) {
		var title = "Do you want to save";
		var message = "before you quit?";
		var options = [];
		var optionCallbacks = [];
		options.push("Yes");
		options.push("No");
		options.push("Cancel");
		optionCallbacks.push( 
			function() {
				saveCreatedLevel(function() { playEffect(0); startLevelCreatorList(); });
				// If a prompt pops up
				if(messageOptions) {
					playEffect(0);
				}
			} 
		);
		optionCallbacks.push( 
			function() { 
				messageOptions = false;
				playEffect(0);
				startLevelCreatorList();
			}
		);
		optionCallbacks.push( 
			function() {
				messageOptions = false;
			} 
		);
		callbackAfterMessage = function() {};
		displayMessageOptions(title, message, options, optionCallbacks);
		return;
	}
	else {
		startLevelCreatorList();
	}
}

/* Reset level with a save check */
// You can choose whether or not to "keep creative changes"
// This impacts which performAction is called, and thus
// whether or not resetGame is told to keepCreatorChanges
function resetLevelSaveCheck(keepCreatorChanges) {
	// If the check mark is not displayed
	if(document.getElementById('save-button').innerHTML.length < 4) {
		var title = "Do you want to save";
		var message = "before you start a new level?";
		if(keepCreatorChanges) {
			message = "before you reset the board?";
		}
		var options = [];
		var optionCallbacks = [];
		options.push("Yes");
		options.push("No");
		options.push("Cancel");
		optionCallbacks.push( 
			function() {
				saveCreatedLevel(
					function() {
						if(!keepCreatorChanges) {
							performAction("rl");
						}
						else {
							performAction("rlk");
						}
						pivot_select = true;
					}
				);
				if(messageOptions) {
					playEffect(0);
				}
			}			
		);
		optionCallbacks.push( 
			function() { 
				messageOptions = false;
				if(!keepCreatorChanges) {
					performAction("rl");
				}
				else {
					performAction("rlk");
				}
				pivot_select = true;
			}
		);
		optionCallbacks.push( 
			function() {
				messageOptions = false;
			} 
		);
		callbackAfterMessage = function() {};
		displayMessageOptions(title, message, options, optionCallbacks);
		return;
	}
	else {
		playEffect(1);
		if(!keepCreatorChanges) {
			performAction("rl");
		}
		else {
			performAction("rlk");
		}
		pivot_select = true;
		// This is needed here, because a dialog could be visble
		// Resetting will clear out message
		hideMessage();
		playing_state = true;
		// This prevents a sound effect from being played
		messageOptions = false;
	}
}

/* Create new dims for a level with a save check (if reboot necessary) */
function startLevelCreatorDimensionsSaveCheck(thenFunction, newDims) {
	// First check if a reboot is necessary
	// Adding rows, no reboot necessary
	if(newDims >= level.dimensions) {
		hideMessage();
		expandMatrix(newDims);
		// Draw matrix takes care of updating creationMat
		drawMatrix();
		playing_state = true;
		saveState();
		return;
	}
	// Shrinking, reboot may not be necessary
	else {
		var contracted = contractMatrix(newDims);
		if(contracted) {
			hideMessage();
			// Draw matrix takes care of updating creationMat
			drawMatrix();
			playing_state = true;
			saveState();
			return;
		}
	}
	
	// If the check mark is not displayed
	if(document.getElementById('save-button').innerHTML.length < 4) {
		document.getElementById('dimensions-input').value = matrix.length;
		var title = "Do you want to save";
		var message = "before you change dimensions (this resets the board)?";
		var options = [];
		var optionCallbacks = [];
		options.push("Yes");
		options.push("No");
		options.push("Cancel");
		optionCallbacks.push( 
			function() {
				saveCreatedLevel(thenFunction);
				// If a prompt pops up
				if(messageOptions) {
					playEffect(0);
				}
			} 
		);
		optionCallbacks.push( 
			function() { 
				messageOptions = false;
				thenFunction();
			}
		);
		optionCallbacks.push( 
			function() {
				messageOptions = false;
			} 
		);
		callbackAfterMessage = function() {};
		displayMessageOptions(title, message, options, optionCallbacks);
		return;
	}
	else {
		thenFunction();
		// This is needed here, because a dialog could be visble
		// Resetting will clear out message
		hideMessage();
		playing_state = true;
		// This prevents a sound effect from being played
		messageOptions = false;
	}
}

/* See if the user wants to save the level after beating min moves in user mode */
function overwriteMovesSaveCheck(thenFunction) {
	var title = "Congratulations! Do you want to save";
	var message = "your new record score?";
	var options = [];
	var optionCallbacks = [];
	options.push("Yes");
	options.push("No");
	optionCallbacks.push( 
		function() {
			// Need to set thenFunction - I.E. go back to menu here
			// Since saveCreatedLevel wipes out callbackAfterMessage
			saveCreatedLevel(thenFunction, true);
			// If a prompt pops up
			if(messageOptions) {
				playEffect(0);
			}
		}			
	);
	optionCallbacks.push( 
		function() { 
			messageOptions = false;
			// Callback after message will be appropriately set here
			// It gets set to go back to the menu when the user beats the level
		}
	);
	displayMessageOptions(title, message, options, optionCallbacks);
}

/** End Save Check Functions **/

/** Other Menu Functions **/

// Choose 
function chooseImages() {
	var title = "What image";
	var message = "would you like for this level?";
	var options = [];
	var optionCallbacks = [];
	
	for(var i = 0; i < possibleImages.length; i++) {
		var curImage = possibleImages[i];
		options.push( "<img class='message-option-image' src='" + curImage + "' />" );
		optionCallbacks.push( (function(curImage, i) { return function() { level.image = curImage; playEffect(i % 6); drawMatrix(); } }(curImage, i)) );
	}
	
	options.push("Done");
	optionCallbacks.push( 
		function() {
			messageOptions = false;
		} 
	);
	callbackAfterMessage = function() {};
	displayMessageOptions(title, message, options, optionCallbacks, true);
}

// Choose colors option
function chooseColors() {
	var title = "What colors";
	var message = "would you like for this level?";
	var options = [];
	var optionCallbacks = [];
	options.push("Background Color: <input type='color' id='background-color-changer' value = '" + level.backgroundColor + "'/>");
	options.push("Tile Color: <input type='color' id='tile-color-changer' value = '" + level.tileColor + "' />");
	options.push("Covered Tile Color: <input type='color' id='checked-tile-color-changer' value = '" + level.checkedTileColor + "' />");
	options.push("Done");
	optionCallbacks.push( function() { document.getElementById('background-color-changer').click(); } );
	optionCallbacks.push( function() { document.getElementById('tile-color-changer').click(); } );
	optionCallbacks.push( function() { document.getElementById('checked-tile-color-changer').click(); } );
	optionCallbacks.push( 
		function() {
			messageOptions = false;
		} 
	);
	callbackAfterMessage = function() {};
	displayMessageOptions(title, message, options, optionCallbacks);
	// Prevent restart when typing in these fields
	document.getElementById('background-color-changer').onfocus = function() { document.onkeydown = null; };
	document.getElementById('background-color-changer').onblur = function() { document.onkeydown = manageInput };
	document.getElementById('tile-color-changer').onfocus = function() { document.onkeydown = null; };
	document.getElementById('tile-color-changer').onblur = function() { document.onkeydown = manageInput };
	document.getElementById('checked-tile-color-changer').onfocus = function() { document.onkeydown = null; };
	document.getElementById('checked-tile-color-changer').onblur = function() { document.onkeydown = manageInput };
	
	document.getElementById('background-color-changer').onchange = function() {
		level.backgroundColor = document.getElementById('background-color-changer').value;
		drawMatrix();
	};
	document.getElementById('tile-color-changer').onchange = function() {
		level.tileColor = document.getElementById('tile-color-changer').value;
		drawMatrix();
	};
	document.getElementById('checked-tile-color-changer').onchange = function() {
		level.checkedTileColor = document.getElementById('checked-tile-color-changer').value;
		drawMatrix();
	};
}

// Choose colors option
function chooseAudio() {
	var title = "What music";
	var message = "would you like for this level?";
	var options = [];
	var optionCallbacks = [];
	// Note, this needs to be updated as well as possibleAudio!
	var padderClass = '<div class="options-button-small-padder">';
	var padderClassEnd = '</div>';
	options.push(padderClass + "Very Easy" + padderClassEnd);
	options.push(padderClass + "Easy" + padderClassEnd);
	options.push(padderClass + "Medium" + padderClassEnd);
	options.push(padderClass + "Hard" + padderClassEnd);
	options.push(padderClass + "Expert" + padderClassEnd);
	options.push(padderClass + "Menu" + padderClassEnd);
	options.push(padderClass + "Daxpy" + padderClassEnd);
	options.push(padderClass + "Invention" + padderClassEnd);
	options.push(padderClass + "Complacency" + padderClassEnd);
	options.push(padderClass + "Pony" + padderClassEnd);
	options.push(padderClass + "Duckdee" + padderClassEnd);
	options.push(padderClass + "On My Mind" + padderClassEnd);
	options.push("Done");
	optionCallbacks.push( function() { level.song = 'sound/veryeasy.m4a'; playEffect(0); changeSong(); enableDisableSave(); } );
	optionCallbacks.push( function() { level.song = 'sound/easy.m4a'; playEffect(1); changeSong(); enableDisableSave(); } );
	optionCallbacks.push( function() { level.song = 'sound/medium.m4a'; playEffect(2); changeSong(); enableDisableSave(); } );
	optionCallbacks.push( function() { level.song = 'sound/hard.m4a'; playEffect(3); changeSong(); enableDisableSave(); } );
	optionCallbacks.push( function() { level.song = 'sound/expert.m4a'; playEffect(4); changeSong(); enableDisableSave(); } );
	optionCallbacks.push( function() { level.song = 'sound/menu.mp3'; playEffect(5); changeSong(); enableDisableSave(); } );
	
	optionCallbacks.push( function() { level.song = 'sound/daxpythedino.mp3'; playEffect(0); changeSong(); enableDisableSave(); } );
	optionCallbacks.push( function() { level.song = 'sound/inventionincmajor.wav'; playEffect(1); changeSong(); enableDisableSave(); } );
	optionCallbacks.push( function() { level.song = 'sound/mediocrecomplacency.wav'; playEffect(2); changeSong(); enableDisableSave(); } );
	optionCallbacks.push( function() { level.song = 'sound/ponyspredicament.wav'; playEffect(3); changeSong(); enableDisableSave(); } );
	optionCallbacks.push( function() { level.song = 'sound/thegreatduckdeechase.mp3'; playEffect(4); changeSong(); enableDisableSave(); } );
	optionCallbacks.push( function() { level.song = 'sound/youllbeonmymind.wav'; playEffect(5); changeSong(); enableDisableSave(); } );
	optionCallbacks.push( 
		function() {
			messageOptions = false;
		} 
	);
	callbackAfterMessage = function() {};
	displayMessageOptions(title, message, options, optionCallbacks, true);
}

// Check facebook status
// One should know webFBObject is loaded here
// Unsure if thenFunctionError is ever a possibility
function checkLoginState(thenFunctionTrue, thenFunctionFalse, thenFunctionError) {
	// Native app
	if(appFBObject) {
		appFBObject.getLoginStatus(function(response) {
			if(response.status === 'connected') {
				fbUserID = response.authResponse.userID;
				thenFunctionTrue();
			}
			else {
				fbUserID = "";
				thenFunctionFalse();
			}
		},
		function() {fbUserID = ""; thenFunctionError();});
	}
	else {
		webFBObject.getLoginStatus(function(response) {
			if(response.status === 'connected') {
				fbUserID = response.authResponse.userID;
				thenFunctionTrue();
			}
			else {
				fbUserID = "";
				thenFunctionFalse();
			}
		});
	}
}

// Log into facebook
// One should know that FB is loaded here (use checkLoginState for error)
function loginToFacebook(thenFunctionTrue, thenFunctionFalse) {
	// Preference for native app
	if(appFBObject) {
		appFBObject.login(['public_profile', 'user_friends'], function(response) {
			if(response.status === 'connected') {
				fbUserID = response.authResponse.userID;
				thenFunctionTrue();
			}
			else {
				fbUserID = "";
				thenFunctionFalse();
			}
		},
		function() {fbUserID = ""; thenFunctionFalse();});
	}
	else {
		webFBObject.login(function(response) {
			if(response.status === 'connected') {
				fbUserID = response.authResponse.userID;
				thenFunctionTrue();
			}
			else {
				fbUserID = "";
				thenFunctionFalse();
			}
		}, {scope: 'public_profile, user_friends'});
	}
}

// Share a level
function shareLevel(id) {
	var title = "How do you want";
	var message = "to share this level?";
	var options = [];
	var optionCallbacks = [];
	options.push("Get a link");
	options.push("On Facebook");
	options.push("By Email");
	options.push("Cancel");
	var siteLink = 'https://game103.net/game103games/javascript/flip-a-blox/ws/playlevel.php?l=' + id;
	optionCallbacks.push( function() { 
		playEffect(0); 
		displayMessageOptions(
			'Your link', 
			'<input type="text" value="' + siteLink + '"/>', 
			['Back','Done'], 
			[function() { playEffect(0); shareLevel(id); }, function() { playEffect(0); hideMessage(); }]
		) 
	} );
	optionCallbacks.push( function() { 
		playEffect(0);
		document.getElementsByClassName('options-button')[1].innerHTML = "On Facebook";
		// Share on facebook, display a small error on return if failed
		shareOnFacebook( 
			hideMessage, 
			function() {
				// Ask to share again if failure
				shareLevel(id);
				var facebookButton = document.getElementsByClassName('options-button')[1];
				if( facebookButton.innerHTML == 'On Facebook' ) {
					facebookButton.innerHTML = 'On Facebook - <div class="invalid-facebook-share">Error. Tap to try again.</div>';
				}
			},
			// If cancelled out, go back to the share menu
			function() { playEffect(0); shareLevel(id); },
			// Pass the link on
			siteLink
		); 
	} );
	optionCallbacks.push( function() { 
		var messageBody = 'Check out this level on Flip-a-Blox: ' + siteLink;
		window.location.href = 'mailto:?subject=Flip-a-Blox Level&body=' + messageBody + '!'; 
	} );
	optionCallbacks.push( 
		function() {
			// Only if the effect won't be played by manageInput
			if(document.getElementById('playing-menu').style.display == 'none') {
				playEffect(0);
			}
			// Do both here, because this function could be called in or out of a level
			messageOptions = false;
			hideMessage();
		} 
	);
	callbackAfterMessage = function() {};
	displayMessageOptions(title, message, options, optionCallbacks);
}

// Share a level on Facebook
// One should know that FB is loaded here (use checkLoginState for error)
function shareOnFacebook(thenFunctionTrue, thenFunctionFalse, thenFunctionCancel, siteLink) {
	if(webFBObject || appFBObject) {
		checkLoginState(
			// We are logged in, let's post
			function() { postToFacebook(thenFunctionTrue, thenFunctionFalse, siteLink); },
			// Otherwise, Ask to log in
			function() {
				displayMessageOptions( 
				"Would you like to log in to Facebook,", 
				"so you can share this level?",
				["Yes", "No"],
				[
					// If they want to use Facebook, then log in
					function() {
						playEffect(0);
						loginToFacebook( 
							function() { postToFacebook(thenFunctionTrue, thenFunctionFalse, siteLink); },
							// Otherwise, display an error if the login was unsuccessful
							thenFunctionFalse
						)
					},
					// Otherwise, cancel if click no
					thenFunctionCancel
				]
				);
			},
			// If FB code not loaded - error
			thenFunctionFalse
		);
	}
	else {
		reloadFB();
		thenFunctionFalse();
	}
}

// Post to Facebook
// Helper function to the function above
function postToFacebook(thenFunctionTrue, thenFunctionFalse, siteLink) {
	
	var uiObject = {
		method: "share",
		href: siteLink,
		picture: 'https://game103.net/game103games/javascript/flip-a-blox/www/images/logo.png',
		share_feedWeb: true
	};
	
	if(appFBObject) {
		appFBObject.showDialog( uiObject, 
			function(response) {
				// Not sure why app doesn't give response, but we'll just go ahead and close
				thenFunctionTrue();
			},
			thenFunctionFalse
		);
	}
	else {
		webFBObject.ui( uiObject, 
			function(response) {
			  if (!response || response.error) {
				thenFunctionFalse();
			  } 
			  else {
				thenFunctionTrue();
			  }
			}
		);
	}
}

/** End Other Menu Functions **/

// Start everything up
// This is its own function if it ever needs to be called
// somewhere else
function beginFlipaBlox(url) {
	resizeBoard();
	window.onresize = resizeBoard;
	levels = generateLevels();
	currentLevelIndex = 0;
	unlockedLevelIndex = 0;
	mute = true;
	toggleMute();
	loadFromDisk();
	
	FastClick.attach(document.body);
	
	// Check for direct level load
	var directLoad = false;
	var urlParam = url.indexOf('?l=') + 3;
	if(urlParam != -1) {
		var levelToLoad = url.substring(urlParam);
		if(!isNaN(levelToLoad)) {
			if(levelToLoad > 0) {
				directLoad = true;
				requestSingleCourse(levelToLoad);
			}
		}
	}
	// No direct load, just start menu
	if(!directLoad) {
		startMenu();
	}
	//startGame();
}

// Let's a go!
// once the body is ready
document.body.onload = function() {
	beginFlipaBlox(document.URL);
};

// Alternatively, we can receive a custom URL (app only)
function handleOpenURL(url) {
  beginFlipaBlox(url);
}