var gTimerIntervalId = null;
var gTimerSeconds = 0;
var gTimerMinutes = 0;

function startTimer() {
  gTimerIntervalId = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(gTimerIntervalId);
}

function resetTimer() {
  stopTimer();
  gTimerSeconds = 0;
  gTimerMinutes = 0;
  updateTimerDisplay();
}

function updateTimer() {
  gTimerSeconds++;
  if (gTimerSeconds === 60) {
    gTimerSeconds = 0;
    gTimerMinutes++;
  }
  updateTimerDisplay();
}

function updateTimerDisplay() {
  var secondsFormatted = gTimerSeconds < 10 ? '0' + gTimerSeconds : gTimerSeconds;
  var minutesFormatted = gTimerMinutes < 10 ? '0' + gTimerMinutes : gTimerMinutes;
  var timerDisplay = minutesFormatted + ':' + secondsFormatted;
  document.getElementById('timer').textContent = timerDisplay;
}