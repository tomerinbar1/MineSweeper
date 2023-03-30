'use strict'

var gBoard
var gLevel = { SIZE: 8, MINES: 4 }
var gGame = {
  isOn: true,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 3,
  isFirstClick: true,
}
const BOMB = '💣'
const FLAG = '🚩'
const colors = {
  1: 'blue',
  2: 'green',
  3: 'red',
  4: 'purple',
  5: 'maroon',
  6: 'turquoise',
  7: 'black',
  8: 'grey',
}

// initioalize the game
function onInitGame() {
  gBoard = buildBoard()

 
  renderBoard(gBoard, '.gameBoard')
}

// create the board

function buildBoard() {
  const board = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = []
    for (var j = 0; j < gLevel.SIZE; j++) {
      const cell = createCell(i, j)
      board[i][j] = cell
    }
  }
  // manually mines set
  // board[1][1].isMine = true
  // board[2][2].isMine = true
  // board[3][3].isMine = true
  // board[4][4].isMine = true

  return board
}

// Create Cell

function createCell(i, j) {
  return {
    isMine: false,
    isShown: false,
    isMarked: false,
    minesAroundCount: 0,
    i,
    j,
  }
}

function setMinesNegsCount(boardSize) {
  for (var i = 0; i < boardSize; i++) {
    for (var j = 0; j < boardSize; j++) {
      // find neighbours
      var neighbors = findNeighbors(gBoard, i, j)
      var mineCount = 0
      //get Mine count
      for (var k = 0; k < neighbors.length; k++) {
        var neighborCell = neighbors[k]
        if (neighborCell.isMine) mineCount++
      }
      gBoard[i][j].minesAroundCount = mineCount
    }
  }
  return gBoard
}

// find Neighbors
function findNeighbors(board, cellI, cellJ) {
  var neighbors = []
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i > board.length - 1) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      //exlude target cell
      if (i === cellI && j === cellJ) continue
      if (j < 0 || j > board[i].length - 1) continue
      neighbors.push(board[i][j])
    }
  }
  return neighbors
}

function onCellClicked(elCell, i, j) {
  var cell = gBoard[i][j]
  if (!gGame.isOn) return
  if (gBoard.isMarked) return
  if (gGame.isFirstClick) {
    gGame.isFirstClick = false
    randMinePos(i, j)
    setMinesNegsCount(gLevel.MINES)
  }
  showCell(elCell, cell)
  if (!cell.minesAroundCount && !cell.isMine && !cell.isMarked) {
    openEmptyCells(gBoard, i, j)
    
  }
console.log(gBoard);
  checkGameOver()
}

function showCell(elCell, cell) {
  if (cell.isShown) return
  if (cell.isMarked) return
  if (cell.isMine) {
    elCell.innerHTML = BOMB
  } else if (cell.minesAroundCount) elCell.innerHTML = cell.minesAroundCount
  else if (!cell.minesAroundCount)
    elCell.style.backgroundImage = 'url(img/empty.svg)'
  elCell.style.opacity = 1
  cell.isShown = true
  gGame.shownCount++
}

function openEmptyCells(board, cellI, cellJ) {
  var neighbors = findNeighbors(board, cellI, cellJ)
  for (var i = 0; i < neighbors.length; i++) {
    var neighbor = neighbors[i]
    if (neighbor.isMarked || neighbor.isShown || neighbor.isMine) continue
    var elCell = document.querySelector(
      `[data-i="${neighbor.i}"][data-j="${neighbor.j}"]`
    )
    showCell(elCell, neighbor)
    if (neighbor.minesAroundCount) continue
    openEmptyCells(board, neighbor.i, neighbor.j)
  }
}

function onCellMarked(elCell, i, j) {
  if (gBoard[i][j].isShown) return
  if (!gBoard[i][j].isMarked) {
    gBoard[i][j].isMarked = true
    elCell.innerHTML = FLAG
    gGame.markedCount++
  } else {
    elCell.innerHTML = ''
    gBoard[i][j].isMarked = false
    gGame.markedCount--
  }
  checkGameOver()
  document.addEventListener('contextmenu', event => event.preventDefault())
}

function checkGameOver() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine) {
        gBoard.lives -= 1
        if (!gBoard.lives) {
          gameOver()
        }
      }
      if (
        gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES
      ) {
        console.log('Win')
      }
    }
  }
}

function gameOver() {
  gGame.isOn = false
}

function randMinePos(clickedCellI, clickedCellJ) {
  const minePos = [] // {i, j}
  console.log(minePos);
  const mines = gLevel.MINES
  const cells = []
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard.length; j++) {
      if (i !== clickedCellI || j !== clickedCellJ) {
        cells.push({ i, j })
      }
    }
  }

  // shuffle the cells array
  for (var i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = cells[i]
    cells[i] = cells[j]
    cells[j] = temp
  }

  for (var i = 0; i < mines; i++) {
    const { i: mineI, j: mineJ } = cells[i]
    gBoard[mineI][mineJ].isMine = true
    minePos.push({ i: mineI, j: mineJ })
  }

  return minePos
}

// *utils

// Render the Board

function renderBoard(board, selector) {
  var strHTML = '<table>'
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < board[0].length; j++) {
      strHTML += `<td data-i='${i}' data-j='${j}' oncontextmenu="onCellMarked(this,${i},${j})" class="cell-start" onclick="onCellClicked(this,${i},${j})"></td>`
    }
    strHTML += '</tr>'
  }
  strHTML += '</table>'
  const elContainer = document.querySelector(selector)
  elContainer.innerHTML = strHTML
}

// location is an object like this - { i: 2, j: 7 }
function renderCell(location, value) {
  // Select the elCell and set the value
  const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
  elCell.innerHTML = value
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}
