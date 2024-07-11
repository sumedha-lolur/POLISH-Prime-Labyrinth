var pathCount = 0;
var levelStatus = 0;
var points,
  maxPoints = 100;
let levelsData;
let currentLevel;
let mazearray, levelPath, levelMoves, timeLimit;

let start = document.getElementById("start-button");
start.addEventListener("click", fetchJSONData);

let next = document.getElementById("next-button");
next.addEventListener("click", goToNextLevel);

let reset = document.getElementById("reset-button");
reset.addEventListener("click", resetGame);
async function fetchJSONData() {
  try {
    const response = await fetch("/api/data");
    const jsonData = await response.json();
    levelsData = jsonData.levelsData;
    currentLevel = jsonData.playerProfile.levelPlaying;
    console.log("Parsed Current Level:", currentLevel);
    document.getElementById("level-heading").innerHTML = `Level ${currentLevel}`;
    if(currentLevel<=jsonData.playerProfile.levelsAvailable)
        loadLevel(currentLevel);
    else{
        document.getElementById("maze-container").innerHTML = "<h2>All levels completed! Congratulations!</h2>";
        start.style.display = "none";
        document.getElementById("container").style.display = "flex";
        document.getElementById("pass-buttons").style.display = "flex";
        document.getElementById("next-button").style.display = "none";
        document.getElementById("reset-button").style.display = "flex";
    }
  } catch (error) {
    console.log("Error fetching JSON:", error);
  }
}

function loadLevel(levelId) {
  const levelData = levelsData[levelId];
  if (levelData) {
    mazearray = levelData.maze;
    levelPath = levelData.path;
    levelMoves = levelData.moves;
    timeLimit = levelData.timeLimit;
    createMaze();
  } else {
    console.log("Level not found:", levelId);
  }
  start.style.display = "none";
  document.getElementById("pass-buttons").style.display = "none";
  document.getElementById("container").style.display = "flex";
  pathCount = 0; // Reset path count
  startTimer();
}

var maze = document.getElementById("maze-container");

const primeNums = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97,
];
const nonPrimeNums = [
  0, 1, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30,
  32, 33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 46, 48, 49, 50, 51, 52, 54, 55,
  56, 57, 58, 60, 62, 63, 64, 65, 66, 68, 69, 70, 72, 74, 75, 76, 77, 78, 80,
  81, 82, 84, 85, 86, 87, 88, 90, 91, 92, 93, 94, 95, 96, 98, 99,
];

function createMaze() {
  document.getElementById("container").style.display = "flex";
  maze.innerHTML = ""; // Clear the maze container before creating a new maze
  for (let i = 0; i < mazearray.length; i++) {
    var row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < mazearray[i].length; j++) {
      var cell = document.createElement("div");
      cell.classList.add("cell");

      var val = document.createElement("div");
      val.classList.add("val");
      if (mazearray[i][j] == 0) {
        cell.classList.add("wall");
        const randomNonPrime = Math.floor(Math.random() * nonPrimeNums.length);
        val.innerText = `${nonPrimeNums[randomNonPrime]}`;
      } else {
        cell.classList.add("path");
        if (levelPath[i][j] == 1) {
          cell.classList.add("correct");
        }
        const randomPrime = Math.floor(Math.random() * primeNums.length);
        val.innerText = `${primeNums[randomPrime]}`;
      }
      cell.appendChild(val);
      row.appendChild(cell);
    }
    maze.appendChild(row);
  }
}

$("#maze-container").on("click", ".wall", function () {
  $(this).css("backgroundColor", "#FF4343");
});

$("#maze-container").on("click", ".path", function () {
  $(this).css("backgroundColor", "#F7AF14");
});

$("#maze-container").on("click", ".correct", function (event) {
  if (++pathCount >= levelMoves) {
    console.log("Congratulations");
    levelStatus = 1;
    congratulations();
  }
});

var remainingTime = 0,
  countdownInterval;
function startTimer() {
  remainingTime = timeLimit;
  const timerElement = document.getElementById("timer");
  timerElement.textContent = `Time Remaining: ${remainingTime}s`;
  countdownInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  remainingTime--;
  const timerElement = document.getElementById("timer");
  timerElement.textContent = `Time Remaining: ${remainingTime}s`;

  if (remainingTime <= 0) {
    clearInterval(countdownInterval);
    handleTimeout();
  }
  if (levelStatus == 1) {
    clearInterval(countdownInterval);
  }
}

function handleTimeout() {
  tryAgain();
}

function congratulations() {
  document.getElementById("congratulations").style.display = "flex";
  document.getElementById("container").style.display = "none";
  document.getElementById("pass-buttons").style.display = "flex";
  if (remainingTime >= (timeLimit * 2) / 3) points = maxPoints;
  else if (remainingTime >= timeLimit / 3) points = maxPoints / 2;
  else points = maxPoints / 4;
  document.getElementById("points").innerText = `Level Completed! Points: ${points}`;
  updatePlayerProfile(); // Update the player profile with points
}

function tryAgain() {
  document.getElementById("fail").style.display = "flex";
  document.getElementById("main-container").style.display = "flex";
  document.getElementById("fail-buttons").style.display = "flex";
}

async function updatePlayerProfile() {
  try {
    const response = await fetch('/api/data');
    const jsonData = await response.json();
    const playerProfile = jsonData.playerProfile;

    playerProfile.levelsCleared += 1;
    playerProfile.levelPlaying += 1;
    playerProfile.totalPoints += points;
    playerProfile[currentLevel].points = points;
    playerProfile[currentLevel].attempts += 1;

    const updateResponse = await fetch('/api/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerProfile }),
    });

    const updateData = await updateResponse.json();
    console.log(updateData.message);
  } catch (error) {
    console.log("Error updating player profile:", error);
  }
}

function goToNextLevel() {
//   currentLevel += 1; // Increment the current level
  // if (currentLevel <= levelsData.levelsAvailable) {
    document.getElementById("congratulations").style.display = "none";
    document.getElementById("container").style.display = "none";
    document.getElementById("pass-buttons").style.display = "none";
    start.style.display = "block"; // Show the start button for the next level
    levelStatus = 0; // Reset the level status
  // } else {
    document.getElementById("container").innerHTML = "<h2>All levels completed! Congratulations!</h2>";
    document.getElementById("next-button").style.display = "none";
    fetchJSONData();
  }


async function resetGame() {
  if (confirm("Are you sure you want to reset your game progress?")) {
    try {
      const response = await fetch('/api/data');
      const jsonData = await response.json();
      const playerProfile = jsonData.playerProfile;

      // Resetting player profile values
      playerProfile.levelsCleared = 0;
      playerProfile.levelPlaying = 1;
      playerProfile.totalPoints = 0;

      // Resetting points and attempts for each level
      for (let i = 1; i <= jsonData.levelsData.levelsLength; i++) {
        playerProfile[i].points = 0;
        playerProfile[i].attempts = 0;
      }

      const updateResponse = await fetch('/api/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerProfile }),
      });

      const updateData = await updateResponse.json();
      console.log(updateData.message);
    } catch (error) {
      console.log("Error resetting player profile:", error);
    }
    fetchJSONData();
  }}
  
