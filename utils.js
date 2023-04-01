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
  
  function renderCell(location, value) {
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
  }
  
  function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
  }
  