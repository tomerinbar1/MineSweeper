'use strict'

var gBoard
var gLevel = { SIZE: 4, MINES: 2 }
var gGame
const BOMB = '💣'
const FLAG = '🚩'
const colors = {1: 'blue', 2: 'green', 3: 'red', 4: 'purple', 5: 'maroon', 6: 'turquoise', 7: 'black', 8: 'grey'}

// initioalize the game
function onInitGame() {
  gBoard = buildBoard()
  setMinesNegsCount(gLevel.SIZE)
  renderBoard(gBoard, '.gameBoard')
}

// create the board

function buildBoard() {
  const board = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = []
    for (var j = 0; j < gLevel.SIZE; j++) {
      const cell = createCell()
      board[i][j] = cell
    }
  }
  // manually mines set
  board[1][1].isMine = true
  board[2][2].isMine = true
  return board
}

// Create Cell

function createCell() {
  return {
    isMine: false,
    isShown: false,
    isMarked: false,
    minesAroundCount: 0,
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

function onCellClicked(elCell,i,j){
  var neighbors = findNeighbors(gBoard, i, j)
  showCell(elCell, gBoard[i][j])
  elCell.classList.toggle('hide-cell')
  console.log(neighbors);
}




function showCell(elCell, cell) {
  if (cell.isShown) return;
  if (cell.isMarked) return;
  if (cell.isMine) {
    elCell.innerHTML = BOMB;
  } else if (cell.minesAroundCount) elCell.innerHTML = cell.minesAroundCount;
  else if (!cell.minesAroundCount) elCell.innerHTML = "";
  elCell.style.opacity = 1;
  cell.isShown = true;
}





// *utils

// Render the Board

function renderBoard(board, selector) {
  var strHTML = '<table>'
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < board[0].length; j++) {
      const cell = board[i][j]
      const cellValue = cell.isMine ? BOMB : cell.minesAroundCount
      strHTML += `<td class="cell-start" onclick="onCellClicked(this,${i},${j})"></td>`
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
