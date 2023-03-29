'use strict'

var gBoard
var gLevel = { SIZE: 4, MINES: 2 }
var gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 }
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

function onCellClicked(elCell, i, j) {
  var cell = gBoard[i][j]
  if (cell.isMarked || cell.isShown) return
  if (cell.isMine) {
    elCell.innerHTML = BOMB
  } else if (cell.minesAroundCount) {
    elCell.innerHTML = cell.minesAroundCount
  } else if (!cell.minesAroundCount) {
    // elCell.innerHTML = findNeighbors(gBoard,i,j)
    var expands = findNeighbors(gBoard,i,j)
    expands.forEach(element => { element.isShown = true})
    // expandShown(gBoard, i, j)
  }
  elCell.classList.remove('cell-start')
  elCell.classList.add('cell-clicked')
  cell.isShown = true
  checkGameOver()
}

function showCell(elCell, cell) {
  if (cell.isShown) return
  if (cell.isMarked) return
  if (cell.isMine) {
    elCell.innerHTML = BOMB
  } else if (cell.minesAroundCount) elCell.innerHTML = cell.minesAroundCount
  else if (!cell.minesAroundCount) elCell.innerHTML = ''
  elCell.style.opacity = 1
  cell.isShown = true
}
// function expandShown(board, elCell, i, j) {
//   if (!board[i][j].minesAroundCount || board[i][j].isMine) return

//   // if cell has already been shown, do nothing
//   if (board[i][j].isShown) return

//   // reveal the cell
//   showCell(elCell, board[i][j])
//   elCell.classList.add('cell-clicked')
//   // if there are no mines around the cell, recursively reveal the neighboring cells
//   if (!board[i][j].minesAroundCount) {
//     const neighbors = findNeighbors(board, i, j)
//     for (var neighbor of neighbors) {
//       if (!neighbor.isMarked && !neighbor.isShown) {
//         const neighborCell = document.querySelector(
//           `[data-i='${neighbor.i}'][data-j='${neighbor.j}']`
//         )
//         expandShown(board, neighborCell, neighbor.i, neighbor.j)
//       }
//     }
//   }
// }

function onCellMarked(elCell, i, j) {
  if (gBoard[i][j].isShown) return
  if (!gBoard[i][j].isMarked) {
    gBoard[i][j].isMarked = true
    elCell.innerHTML = FLAG
  } else {
    elCell.innerHTML = ''
    gBoard[i][j].isMarked = false
  }
  document.addEventListener('contextmenu', event => event.preventDefault())
}

function checkGameOver() {
  var mineCount = 0
  var nonMineShownCount = 0
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine) {
        mineCount++
      } else if (gBoard[i][j].isShown) {
        nonMineShownCount++
      }
    }
  }
  if (nonMineShownCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES) {
    gameOver()
  } else if (mineCount === gLevel.MINES) {
    gameOver()
  }
}

function gameOver() {
  gGame.isOn = false
}

// *utils

// Render the Board

function renderBoard(board, selector) {
  var strHTML = '<table>'
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < board[0].length; j++) {
      strHTML += `<td oncontextmenu="onCellMarked(this,${i},${j})" class="cell-start" onclick="onCellClicked(this,${i},${j})"></td>`
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
