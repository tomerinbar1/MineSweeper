'use strict'

var gBoard
var gLevel = { SIZE: 4, MINES: 2 }
var gGame = {
  isOn: true,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 3,
  isFirstClick: true,
  hints: 3,
  isHint: false,
  safeClicks: 3,
}

var gPlayerScore = []

const BOMB = '💣'
const FLAG = '🚩'
const NORMAL = '😃'
const DEAD = '☠️'
const WIN = '😎'
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

function onInitGame() {
  gBoard = buildBoard()
  renderBoard(gBoard, '.gameBoard')
  liveCount()
  smileyMood()
}


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

function gameLevel(level) {
  if (level === 1) {
    gLevel = { SIZE: 4, MINES: 2 }
  } else if (level === 2) {
    gLevel = { SIZE: 8, MINES: 14 }
  } else if (level === 3) {
    gLevel = { SIZE: 12, MINES: 32 }
  }
  restartGame()
}

function liveCount() {
  const elLive = document.querySelector('.lives')
  const hearts = '❤️'.repeat(gGame.lives)
  elLive.innerHTML = hearts
}

function smileyMood(status) {
  const elMood = document.querySelector('.smiley')
  elMood.innerHTML = NORMAL
  if (status === WIN) {
    elMood.innerHTML = WIN
  } else if (status === DEAD) {
    elMood.innerHTML = DEAD
  } else {
    return
  }
}

function hints(elHint) {
  if (elHint.src === 'img/HintOn') return
  if (gGame.isHint) return

  elHint.src = 'img/HintOn.png'

  gGame.hints--
  gGame.isHint = true
}

function setMinesNegsCount(boardSize) {
  for (var i = 0; i < boardSize; i++) {
    for (var j = 0; j < boardSize; j++) {
      var neighbors = findNeighbors(gBoard, i, j)
      var mineCount = 0
      for (var k = 0; k < neighbors.length; k++) {
        var neighborCell = neighbors[k]
        if (neighborCell.isMine) mineCount++
      }
      gBoard[i][j].minesAroundCount = mineCount
    }
  }
  return gBoard
}

function findNeighbors(board, cellI, cellJ) {
  var neighbors = []
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i > board.length - 1) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
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
  if (cell.isMarked) return
  if (gGame.isFirstClick) {
    gGame.isFirstClick = false
    gBoard[i][j] = { isShown: true, minesAroundCount: 0 }
    randMinePos(i, j)
    setMinesNegsCount(gLevel.SIZE)
    startTimer()
  }

  if (gGame.isHint && !gGame.isFirstClick) {
    showHintNegs(elCell, i, j)
    gGame.isHint = false
    return
  }
  showCell(elCell, cell)
  if (!cell.minesAroundCount && !cell.isMine && !cell.isMarked) {
    openEmptyCells(gBoard, i, j)
  }
  checkGameOver(elCell, i, j)
}

function onSafeButton(elBtn) {
  if (!gGame.safeClicks) return

  var safeCells = []
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      const cell = gBoard[i][j]
      if (!cell.isMarked && !cell.isMine && !cell.isShown) {
        safeCells.push(cell)
      }
    }
  }
  const randCellNum = getRandomInt(0, safeCells.length)
  const randCell = safeCells[randCellNum]
  const elCell = document.querySelector(
    `[data-i="${randCell.i}"][data-j="${randCell.j}"]`
  )

  elCell.classList.add('flashing')

  setTimeout(() => {
    elCell.classList.remove('flashing')
  }, 3000)
  gGame.safeClicks--

  if (!gGame.safeClicks) {
    elBtn.disabled = true
  }
}

function showHintNegs(elCurrentCell, i, j) {
  const negs = findNeighbors(gBoard, i, j)
  negs.push(gBoard[i][j])
  const filteredNegs = negs.filter(neg => !neg.isShown)
  // show cells for 1 seconds
  for (var i = 0; i < filteredNegs.length; i++) {
    const cell = filteredNegs[i]
    var elCell = document.querySelector(
      `[data-i="${cell.i}"][data-j="${cell.j}"]`
    )
    showCell(elCell, cell)
  }
  // hide cells after 1 second
  setTimeout(() => {
    for (var i = 0; i < filteredNegs.length; i++) {
      const cell = filteredNegs[i]
      var elCell = document.querySelector(
        `[data-i="${cell.i}"][data-j="${cell.j}"]`
      )

      hideCell(elCell, cell)
    }
  }, 1000)
}

function hideCell(elCell, cell) {
  cell.isShown = false
  elCell.style.backgroundImage = 'url(img/closed.svg)'
  elCell.innerHTML = ''
  gGame.shownCount--
}

function showCell(elCell, cell) {
  if (cell.isShown) return
  if (cell.isMarked) return
  if (cell.isMine) {
    elCell.innerHTML = BOMB
    elCell.style.opacity = 1
  } else if (cell.minesAroundCount) {
    elCell.innerHTML = cell.minesAroundCount
    elCell.style.backgroundImage = 'url(img/empty.svg)'
    elCell.style.color = `${colors[cell.minesAroundCount]}`
    elCell.style.opacity = 1
  } else if (!cell.minesAroundCount) {
    elCell.style.backgroundImage = 'url(img/empty.svg)'
    elCell.style.opacity = 1
  }
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
  checkGameOver(elCell, i, j)
  document.addEventListener('contextmenu', event => event.preventDefault())
}

function checkGameOver(elCell, i, j) {
  const cell = gBoard[i][j]
  if (!gGame.isOn) return
  if (cell.isMine && !cell.isMarked) {
    gGame.lives--
    liveCount()
    if (!gGame.lives) {
      openModal('lose');
      gGame.isOn = false
      stopTimer()
      smileyMood(DEAD)
      console.log('lose');

      for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
          if (gBoard[i][j].isMine) {
            elCell.innerHTML = BOMB
          }
        }
      }
    }
  }
  if (
    gGame.markedCount === gLevel.MINES &&
    gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES
  ) {
    openModal('win')
    console.log('win');
    gGame.isOn = false
    smileyMood(WIN)
    stopTimer()
  }
}

function restartGame() {
  gGame.lives = 3
  gGame.safeClicks = 3
  gGame.markedCount = 0
  gGame.shownCount = 0
  gGame.hints = 3
  gGame.isOn = true
  gGame.isFirstClick = true
  var elHint = document.querySelectorAll('.hint img')
  elHint.forEach(img => {
    img.src = 'img/HintOff.png'
  })
  elHint.disabled = false
  gGame.isHint = false
  resetTimer()
  closeModal()
  onInitGame()
}

function randMinePos(clickedCellI, clickedCellJ) {
  const minePos = [] // {i, j}
  console.log(minePos);
  const mines = gLevel.MINES
  const cells = []
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      if (i !== clickedCellI || j !== clickedCellJ) {
        cells.push({ i, j })
      }
    }
  }
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

function openModal(status) {
  const winMessage = document.querySelector('.win-message');
  const loseMessage = document.querySelector('.lose-message');

  if (status === 'win') {
    winMessage.innerText = "Congratulations! You won!";
    winMessage.classList.add('visible');
  } else if (status === 'lose') {
    loseMessage.innerText = "Game over! You lost!";
    loseMessage.classList.add('visible');
  }
}

function closeModal() {
  const winMessage = document.querySelector('.win-message');
  const loseMessage = document.querySelector('.lose-message');

  winMessage.classList.remove('visible');
  loseMessage.classList.remove('visible');
}
