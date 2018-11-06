import copy

class Level:
	def __init__(self, oneStarMoves, twoStarMoves, threeStarMoves, dimensions, tiles):
		self.oneStarMoves = oneStarMoves
		self.twoStarMoves = twoStarMoves
		self.threeStarMoves = threeStarMoves
		self.dimensions = dimensions
		self.tiles = tiles
		self.matrix = [[0 for x in range(dimensions)] for y in range(dimensions)]

VALID = 16
SELECTED = 8
PIVOT = 4
FLIPPED = 2
CHECKED = 1

def generateLevels():
	levels = []
	levelOne = Level(10, 8, 6, 10, 20)
	for i in range(0, levelOne.dimensions):
		for j in range(0, levelOne.dimensions):
			#if i >= levelOne.dimensions - 2:
			levelOne.matrix[i][j] = VALID
		
		
	levels.append(levelOne);
	return levels

# print the matrix
def drawMatrix(matrix, dimensions):
	for i in range(0, dimensions):
		for j in range(0, dimensions):
			string = str(matrix[i][j])
			if len(string) == 1:
				string = "0" + string
				
			print string,
			
		print
	

# Reset the game to a new level
def resetGame(levels, currentLevelIndex):
	level = levels[currentLevelIndex]
	loseMoves = level.oneStarMoves
	winTiles = level.tiles
	dimensions = level.dimensions
	matrix = copy.deepcopy(level.matrix)
	row =  dimensions - 1;
	col = 0;
	moves = 0
	tiles = 1
	# Inclusive of pivot
	curColumnsRight = 1;
	curColumnsLeft = 0;
	curRowsTop = 0;
	# Inclusive of pivot
	curRowsBottom = 1;
	flippedColumnsRight = 1;
	flippedColumnsLeft = 0;
	flippedRowsTop = 0;
	flippedRowsBottom = 1;
	matrix[row][col] = PIVOT + FLIPPED + SELECTED + CHECKED + VALID;
	return (dimensions, matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles, loseMoves, winTiles)

# Start the main program loop	
def startGame():
	levels = generateLevels()
	currentLevelIndex = 0
	(dimensions, matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles, loseMoves, winTiles) = resetGame(levels, currentLevelIndex)
	drawMatrix(matrix, dimensions)
	while True:
		command = raw_input("What is thy bidding, master?")
		command = command.lower()
		if(command == "rp"):
			(matrix, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom) = resetToPivotPosition(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom)
		
		elif(command == "rf"):
			(matrix, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom) = resetToFlipped(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom)
		
		elif(command == "u"):
			prevCurRowsTop = curRowsTop
			(matrix, curRowsTop) = expandAbove(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop)
			if curRowsTop == prevCurRowsTop:
				(matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curRowsTop, curRowsBottom, moves, tiles) = flipAbove(matrix, row, col,  curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles)
				if tiles >= winTiles:
					currentLevelIndex += 1
					(dimensions, matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles, loseMoves, winTiles) = resetGame(levels, currentLevelIndex)
				
				elif moves >= loseMoves:
					print "YOU LOSE"
					(dimensions, matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles, loseMoves, winTiles) = resetGame(levels, 0)
		
		
		elif(command == "d"):
			prevCurRowsBottom = curRowsBottom
			(matrix, curRowsBottom) = expandBelow(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsBottom, dimensions)
			if curRowsBottom == prevCurRowsBottom:
				(matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curRowsTop, curRowsBottom, moves, tiles) = flipBelow(matrix, row, col,  curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, dimensions, moves, tiles)
				if tiles >= winTiles:
					currentLevelIndex += 1
					(dimensions, matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles, loseMoves, winTiles) = resetGame(levels, currentLevelIndex)
				
				elif moves >= loseMoves:
					print "YOU LOSE"
					(dimensions, matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles, loseMoves, winTiles) = resetGame(levels, 0)
		
		
		elif(command == "l"):
			prevCurColumnsLeft = curColumnsLeft
			(matrix, curColumnsLeft) = expandLeft(matrix, row, col, curColumnsLeft, curRowsTop, curRowsBottom)
			if curColumnsLeft == prevCurColumnsLeft:
				(matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curColumnsRight, curColumnsLeft, moves, tiles) = flipLeft(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles)
				if tiles >= winTiles:
					currentLevelIndex += 1
					(dimensions, matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles, loseMoves, winTiles) = resetGame(levels, currentLevelIndex)
				
				elif moves >= loseMoves:
					print "YOU LOSE"
					(dimensions, matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles, loseMoves, winTiles) = resetGame(levels, 0)
		
		
		elif(command == "r"):
			prevCurColumnsRight  = curColumnsRight
			(matrix, curColumnsRight) = expandRight(matrix, row, col, curColumnsRight, curRowsTop, curRowsBottom, dimensions)
			if curColumnsRight == prevCurColumnsRight:
				(matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curColumnsRight, curColumnsLeft, moves, tiles) = flipRight(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, dimensions, moves, tiles)
				if tiles >= winTiles:
					currentLevelIndex += 1
					(dimensions, matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles, loseMoves, winTiles) = resetGame(levels, currentLevelIndex)
				
				elif moves >= loseMoves:
					print "YOU LOSE"
					(dimensions, matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles, loseMoves, winTiles) = resetGame(levels, 0)
		
		
		print tiles
		print moves
		drawMatrix(matrix, dimensions)

# Perform a flip operation
def performFlip(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles, verStart, verEnd, horStart, horEnd, horizontally, vertically, verMultiplierFlip, horMultiplierFlip, verMultiplierCur, horMultiplierCur, ourRow, ourCol):
	# Remove previous squares marked as flipped
	matrix = resetFlipped(matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom)
	newTiles = tiles
	# For all the squares that will be flipped
	for i in range(verStart, verEnd):
		for j in range(horStart, horEnd):
			# If the item is flipped or invalid, do not allow the flip
			# Note that when flipping vertically, ourRow is the row one above/below the first flipped row (part of previous selection)
			# When flipping horizontally, outCol is the row one left/right of the first flipped row
			# If we are going down, the flipped row would be one below, otherwise one above, that is where verMultiplierFlip comes in
			# verMultiplierCur is -verMultiplierFlip, since we go in the opposite direction to find rows to flip than when creating new rows
			# vertically is an extra 1/-1 (depending on verMultiplierFlip) that indicates that the flip starts one position away from ourRow
			# However, if we are flipping horizontally, similar variables are used and won't be explained. Note, however, that verMultiplierFlip will always
			# be one and vertically will always be 0 when flipped horizontally. This is because we are simply iterating through the current rows and not creating new ones.
			# verStart and end are just -curRowsTop and curRowsBottom respectively, where as when flipping vertically, they were 0, and curHeight.
			# 0 and curHeight are used in conjunction with ourRow, since it is easier to understand flipping when one away from the flip.
			if isChecked(matrix[ourRow+(i*verMultiplierFlip)+(vertically*verMultiplierFlip)][ourCol+(j*horMultiplierFlip)+(horizontally*horMultiplierFlip)]) or not isValid(matrix[ourRow+(i*verMultiplierFlip)+(vertically*verMultiplierFlip)][ourCol+(j*horMultiplierFlip)+(horizontally*horMultiplierFlip)]) :
				matrix = revertResetFlipped(matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom)
				# undo what has currently been flipped on the ith row
				# note that j is not flipped because j's flip is below the if statement
				for x in range(j-1, horStart-1, -1):
					matrix[ourRow+(i*verMultiplierFlip)+(vertically*verMultiplierFlip)][ourCol+(x*horMultiplierFlip)+(horizontally*horMultiplierFlip)] -= (FLIPPED + SELECTED + CHECKED);
					matrix[ourRow+(i*verMultiplierCur)][ourCol+(x*horMultiplierCur)] += SELECTED;
				
				# now flip back the rest of the rows
				# i-1, since that is the first row that has been entirely flipped
				# (we already flipped back the ith row partially above)
				for y in range(i-1, verStart-1, -1):
					for x in range(horEnd-1, horStart-1, -1):
						matrix[ourRow+(y*verMultiplierFlip)+(vertically*verMultiplierFlip)][ourCol+(x*horMultiplierFlip)+(horizontally*horMultiplierFlip)] -= (FLIPPED + SELECTED + CHECKED);
						matrix[ourRow+(y*verMultiplierCur)][ourCol+(x*horMultiplierCur)] += SELECTED;
				
				
				return (matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, moves, tiles)
				
			# Set the current position to be flipped, selected, and checked
			# The minus one is because we start flipping one above the start row
			matrix[ourRow+(i*verMultiplierFlip)+(vertically*verMultiplierFlip)][ourCol+(j*horMultiplierFlip)+(horizontally*horMultiplierFlip)] += FLIPPED + SELECTED + CHECKED;
			# The position that this position was flipped from is no longer selected
			# The current position is no longer selected
			matrix[ourRow+(i*verMultiplierCur)][ourCol+(j*horMultiplierCur)] -= SELECTED;
			# Add one to our tiles count
			newTiles += 1
			
			
	# After going through the loop, i or j will be as far <flip direction> as possible. Thus, we want to make 
	# that position the new pivot position (while keeping the pivot row if flip direction is vertical and vice-versa)
	#if(i == verEnd-1 and j == horEnd-1):			
	if vertically == 1:
		newRow = ourRow+(i*verMultiplierFlip)+(vertically*verMultiplierFlip)
		newCol = col
	
	else:
		newRow = row
		newCol = ourCol +(j*horMultiplierFlip)+(horizontally*horMultiplierFlip)
	
	matrix[row][col] -= PIVOT
	row = newRow
	col = newCol
	matrix[row][col] += PIVOT
	return (matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, moves + 1, newTiles)
		
# Perform a flip above the current blocks
def flipAbove(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles):
	curHeight = curRowsTop+curRowsBottom
	topRow = row - curRowsTop
	# No Index out of bounds
	if(topRow-curHeight >= 0):
		# Config
		verStart = 0
		verEnd = curHeight
		horStart = -curColumnsLeft
		horEnd = curColumnsRight
		horizontally = 0
		vertically = 1
		verMultiplierFlip = -1
		horMultiplierFlip = 1
		verMultiplierCur = 1
		horMultiplierCur = 1
		ourRow = topRow
		ourCol = col
		# End config
		prevMoves = moves
		(matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, moves, tiles) = performFlip(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles, verStart, verEnd, horStart, horEnd, horizontally, vertically, verMultiplierFlip, horMultiplierFlip, verMultiplierCur, horMultiplierCur, ourRow, ourCol)
		if moves > prevMoves:
			curRowsBottom = curRowsTop+curRowsBottom
			curRowsTop = 0
			(flippedColumnsRight, flippedColumnsLeft, flippedRowsBottom, flippedRowsTop) = recordFlip(curColumnsRight, curColumnsLeft, curRowsBottom, curRowsTop)
	
	
	else:
		print "silly buttons"
	
	return (matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curRowsTop, curRowsBottom, moves, tiles)

# Perform a flip below the current blocks
def flipBelow(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, dimensions, moves, tiles):
	lost = False
	curHeight = curRowsTop+curRowsBottom
	bottomRow = row + curRowsBottom - 1 # minus one since curRowsBottom is 1 if one row
	# No Index out of bounds
	if(bottomRow+curHeight < dimensions ):
		# Config
		verStart = 0
		verEnd = curHeight
		horStart = -curColumnsLeft
		horEnd = curColumnsRight
		horizontally = 0
		vertically = 1
		verMultiplierFlip = 1
		horMultiplierFlip = 1
		verMultiplierCur = -1
		horMultiplierCur = 1
		ourRow = bottomRow
		ourCol = col
		# End config
		prevMoves = moves
		(matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, moves, tiles) = performFlip(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles, verStart, verEnd, horStart, horEnd, horizontally, vertically, verMultiplierFlip, horMultiplierFlip, verMultiplierCur, horMultiplierCur, ourRow, ourCol)
		if moves > prevMoves:
			curRowsBottom = 1
			curRowsTop = curHeight - 1
			(flippedColumnsRight, flippedColumnsLeft, flippedRowsBottom, flippedRowsTop) = recordFlip(curColumnsRight, curColumnsLeft, curRowsBottom, curRowsTop)
	
	
	else:
		print "silly buttons"
	
	return (matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curRowsTop, curRowsBottom, moves, tiles)

# Perform a flip left of the current blocks
def flipLeft(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles):
	lost = False
	curWidth = curColumnsLeft+curColumnsRight
	leftColumn = col - curColumnsLeft
	# No Index out of bounds
	if(leftColumn-curWidth >= 0):
		# Config
		verStart = -curRowsTop
		verEnd = curRowsBottom
		horStart = 0
		horEnd = curWidth
		horizontally = 1
		vertically = 0
		verMultiplierFlip = 1
		horMultiplierFlip = -1
		verMultiplierCur = 1
		horMultiplierCur = 1
		ourRow = row
		ourCol = leftColumn
		# End config
		prevMoves = moves
		(matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, moves, tiles) = performFlip(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles, verStart, verEnd, horStart, horEnd, horizontally, vertically, verMultiplierFlip, horMultiplierFlip, verMultiplierCur, horMultiplierCur, ourRow, ourCol)
		if moves > prevMoves:
			curColumnsLeft = 0
			curColumnsRight = curWidth
			(flippedColumnsRight, flippedColumnsLeft, flippedRowsBottom, flippedRowsTop) = recordFlip(curColumnsRight, curColumnsLeft, curRowsBottom, curRowsTop)
	
	
	else:
		print "silly buttons"
	
	return (matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curColumnsRight, curColumnsLeft, moves, tiles)
	
# Perform a flip right of the current blocks
def flipRight(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, dimensions, moves, tiles):
	lost = False
	curWidth = curColumnsLeft+curColumnsRight
	rightColumn = col + curColumnsRight - 1 # minus one since curColumnsRight is 1 if one col
	# No Index out of bounds
	if(rightColumn+curWidth < dimensions ):
		# Config
		verStart = -curRowsTop
		verEnd = curRowsBottom
		horStart = 0
		horEnd = curWidth
		horizontally = 1
		vertically = 0
		verMultiplierFlip = 1
		horMultiplierFlip = 1
		verMultiplierCur = 1
		horMultiplierCur = -1
		ourRow = row
		ourCol = rightColumn
		# End config
		prevMoves = moves
		(matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, moves, tiles) = performFlip(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, moves, tiles, verStart, verEnd, horStart, horEnd, horizontally, vertically, verMultiplierFlip, horMultiplierFlip, verMultiplierCur, horMultiplierCur, ourRow, ourCol)
		if moves > prevMoves:
			curColumnsLeft = curWidth - 1
			curColumnsRight = 1
			(flippedColumnsRight, flippedColumnsLeft, flippedRowsBottom, flippedRowsTop) = recordFlip(curColumnsRight, curColumnsLeft, curRowsBottom, curRowsTop)
	
	
	else:
		print "silly buttons"
	
	return (matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom, curColumnsRight, curColumnsLeft, moves, tiles)
	
		
def expandBelow(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsBottom, dimensions):
	while(True):
		# an extra one is not needed since we already have somewhat of an extra one with the pivot position
		if(row + curRowsBottom >= dimensions):
			return (matrix, curRowsBottom)
		
		for j in range(-curColumnsLeft, curColumnsRight):
			if(not isChecked(matrix[row + curRowsBottom][col+j])):
				for x in range(j-1, -curColumnsLeft-1, -1):
					matrix[row + curRowsBottom][col+x] -= SELECTED
				return (matrix, curRowsBottom)
			
			matrix[row + curRowsBottom][col+j] += SELECTED
		
		curRowsBottom += 1
		
def expandAbove(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop):
	while(True):
		if(row - curRowsTop - 1 < 0):
			return (matrix, curRowsTop)
		
		for j in range(-curColumnsLeft, curColumnsRight):
			if(not isChecked(matrix[row - curRowsTop - 1][col+j])):
				for x in range(j-1, -curColumnsLeft-1, -1):
					matrix[row - curRowsTop - 1][col+x] -= SELECTED
				
				return (matrix, curRowsTop)
			
			matrix[row - curRowsTop - 1][col+j] += SELECTED
		
		curRowsTop += 1
			
def expandRight(matrix, row, col, curColumnsRight, curRowsTop, curRowsBottom, dimensions):
	while(True):
		# an extra one is not needed since we already have somewhat of an extra one with the pivot position
		if(col + curColumnsRight >= dimensions):
			return (matrix, curColumnsRight)
		
		for i in range(-curRowsTop, curRowsBottom):
			if(not isChecked(matrix[row+i][col + curColumnsRight])):
				for y in range(i-1, -curRowsTop-1, -1):
					matrix[row+y][col + curColumnsRight] -= SELECTED
				
				return (matrix, curColumnsRight)
			
			matrix[row+i][col + curColumnsRight]  += SELECTED
		
		curColumnsRight += 1
		
def expandLeft(matrix, row, col, curColumnsLeft, curRowsTop, curRowsBottom):
	while(True):
		if(col - curColumnsLeft - 1 < 0):
			return (matrix, curColumnsLeft)
		
		for i in range(-curRowsTop, curRowsBottom):
			if(not isChecked(matrix[row+i][col - curColumnsLeft - 1])):
				for y in range(i-1, -curRowsTop-1, -1):
					matrix[row+y][col - curColumnsLeft - 1] -= SELECTED
				
				return (matrix, curColumnsLeft)
			
			matrix[row+i][col - curColumnsLeft - 1] += SELECTED
		
		curColumnsLeft += 1
		
def resetToPivotPosition(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom):
	for i in range(-curRowsTop, curRowsBottom):
		for j in range(-curColumnsLeft, curColumnsRight):
			if(not isPivot (matrix[row+i][col+j]) ):
				matrix[row+i][col+j] -= SELECTED
				
				
				
	return (matrix, 1, 0, 0, 1)

def resetToFlipped(matrix, row, col, curColumnsRight, curColumnsLeft, curRowsTop, curRowsBottom, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom):
	for i in range(-curRowsTop, curRowsBottom):
		for j in range(-curColumnsLeft, curColumnsRight):
			matrix[row+i][col+j] -= SELECTED
			
			
	for i in range(-flippedRowsTop, flippedRowsBottom):
		for j in range(-flippedColumnsLeft, flippedColumnsRight):
				matrix[row+i][col+j] += SELECTED
				
				
	# Returns the flipped to be set as cur
	return(matrix, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom)

# Helper functions
def isValid(num):
	return ((num&(1 << 4)) != 0);

def isSelected(num):
	return ((num&(1 << 3)) != 0);
	
def isPivot(num):
	return ((num&(1 << 2)) != 0);
	
def isFlipped(num):
	return ((num&(1 << 1)) != 0);
	
def isChecked(num):
	return ((num&1) != 0);
	
def recordFlip(curColumnsRight, curColumnsLeft, curRowsBottom, curRowsTop):
	return (curColumnsRight, curColumnsLeft, curRowsBottom, curRowsTop)
	
def resetFlipped(matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom):
	for i in range(-flippedRowsTop, flippedRowsBottom):
		for j in range(-flippedColumnsLeft, flippedColumnsRight):
				matrix[row+i][col+j] -= FLIPPED
				
				
	return matrix
	
def revertResetFlipped(matrix, row, col, flippedColumnsRight, flippedColumnsLeft, flippedRowsTop, flippedRowsBottom):
	for i in range(-flippedRowsTop, flippedRowsBottom):
		for j in range(-flippedColumnsLeft, flippedColumnsRight):
				matrix[row+i][col+j] += FLIPPED
				
				
	return matrix

# Let's a go!
startGame()