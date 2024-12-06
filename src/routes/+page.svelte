<script>
	import { onMount } from 'svelte';
  import { turnInProgress } from '$lib/turnstore.js';
  import { fetchDrawRndCardP1, fetchDrawRndCardP2, fetchPlayCardP1, fetchPlayCardP2, fetchAttackCard } from '$api/card.js';
	import { fetchMatchData, fetchStartGame, fetchEndTurn, fetchStartTurn } from '$api/match.js'; // Use the API module
  import { fetchAttackPlayer1, fetchAttackPlayer2 } from '$api/player.js';
  import Board from '../style/board.svelte';
  import GetGame from '$lib/getgame.svelte';

	let gameData = null;
	let errorMessage = '';
  let currentPlayerId = null;
  let player1Id = null;
  let player2Id = null;
  let selectedCardIdP1 = null;
  let selectedCardIdP2 = null;
  let selectedAttackCardId = null;
  let selectedDefendCardId = null;

  $: {
  console.log("gameData", gameData);
  if (gameData) {
    player1Id = gameData.player1.id;
    player2Id = gameData.player2.id;
    currentPlayerId = gameData.board.currentPlayerId;

    if(gameData.player1.graveyard.length > 0 || gameData.player2.graveyard.length > 0) {
      console.log("Player 1 graveyard: ", gameData.player1.graveyard.length);
      console.log("Player 2 graveyard: ", gameData.player2.graveyard.length);
    }
  // Start the turn for the current player if game is initialized
  }
}



async function StartGame() {
  try {
    const result = await fetchStartGame();
    console.log('Game started:', result);
    gameData = await fetchMatchData(); // Fetch initial game data
    currentPlayerId = gameData.board.currentPlayerId;
    
    console.log('Starting turn for Player', currentPlayerId);
    gameData = await fetchMatchData(); // Fetch initial game data
    console.log('Turn started for Player', currentPlayerId);
  } catch (error) {
    errorMessage = `Failed to start game: ${error.message}`;
    console.error(error);
  }
}


	onMount(async () => {
		try {
			gameData = await fetchMatchData();
		} catch (error) {
			errorMessage = error.message;
		}
	});


  async function endTurn() {
  try {
    if (!gameData || currentPlayerId === null) {
      throw new Error('No player has started yet.');
    }

    console.log('Ending turn for Player:', currentPlayerId);
    await fetchEndTurn(currentPlayerId); // Perform end-turn logic
    turnInProgress.set(false);
    gameData = await fetchMatchData(); // Refresh game state

    // Switch to the next player's turn
    currentPlayerId = currentPlayerId === player1Id ? player2Id : player1Id;


  } catch (error) {
    errorMessage = `Failed to end turn for Player ${currentPlayerId}: ${error.message}`;
  }
}


  async function playCardP1(cardId) {
    try {
      const result = await fetchPlayCardP1(cardId); // Pass the selected cardId for Player 1
      console.log('Card played for Player 1:', result);
      gameData = await fetchMatchData();
    } catch (error) {
      errorMessage = `Failed to play card for Player 1: ${error.message}`;
    }
  }

  async function playCardP2(cardId) {
    try {
      const result = await fetchPlayCardP2(cardId); // Pass the selected cardId for Player 2
      console.log('Card played for Player 2:', result);
      gameData = await fetchMatchData();
    } catch (error) {
      errorMessage = `Failed to play card for Player 2: ${error.message}`;
    }
  }

  async function selectAttack(cardId, player) {
    if (selectedAttackCardId === null) {
      selectedAttackCardId = cardId;
      alert(`Selected attack card: ${cardId}`);
    } else {
      selectedDefendCardId = cardId;
      alert(`Selected defend card: ${cardId}`);
      
      // Now perform the attack action
      attackCard(selectedAttackCardId, selectedDefendCardId, player === 'player1' ? 1 : 2);
      
      // Reset the selected cards after the attack
      selectedAttackCardId = null;
      selectedDefendCardId = null;
    }
  }

  async function attackCard(attackCardId, defenseCardId, playerId) {
    try {
      const result = await fetchAttackCard(attackCardId, defenseCardId, playerId);
      console.log('Attack result:', result);

      // After attack, fetch the latest game data to refresh the state
      gameData = await fetchMatchData();  // Refresh the game state
    } catch (error) {
      console.error('Error during attack:', error);
    }
  }
  
  async function attackPlayer(cardId, player) {
  try {
    // Conditionally call the appropriate fetchAttackPlayer function based on the player
    const result = player === 'player1' 
      ? await fetchAttackPlayer1(cardId) 
      : await fetchAttackPlayer2(cardId);

    // Call the attackCard function with appropriate player ID
    attackCard(cardId, null, player === 'player1' ? 1 : 2);

    // Fetch the latest game data to refresh the state
    gameData = await fetchMatchData();  // Refresh the game state
  } catch (error) {
    console.error('Error during attack:', error);
  }
}


</script>
<div class="container">

  <div>
  <button onclick={StartGame} type="button" class="btn">
    <strong>Start Game</strong>
    <div id="container-stars">
      <div id="stars"></div>
    </div>
    <div id="glow">
      <div class="circle"></div>
      <div class="circle"></div>
    </div>
  </button>

{#if errorMessage}
    <p style="color: red;">Error: {errorMessage}</p>
  {:else if gameData}
      <h2>Board Info || Turn: {gameData.board.turns} Current Turn: Player {gameData.board.currentPlayerId}</h2>
      <button onclick={endTurn}>End turn for player: {gameData.board.currentPlayerId}</button>
  {/if}
  </div>
  <div>
  <Board gameData={gameData} errorMessage={errorMessage} onRestart={StartGame} turnInProgress={turnInProgress} />
</div>
  </div>


<style>

.container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  background-color: #2d2d2d;
  color: white;
  height: 100vh;
  overflow: auto;

}

.btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 13rem;
  overflow: hidden;
  height: 3rem;
  background-size: 300% 300%;
  cursor: pointer;
  backdrop-filter: blur(1rem);
  border-radius: 5rem;
  transition: 0.5s;
  animation: gradient_301 5s ease infinite;
  border: double 4px transparent;
  background-image: linear-gradient(#212121, #212121),
    linear-gradient(
      137.48deg,
      #ffdb3b 10%,
      #fe53bb 45%,
      #8f51ea 67%,
      #0044ff 87%
    );
  background-origin: border-box;
  background-clip: content-box, border-box;
}

#container-stars {
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: 0.5s;
  backdrop-filter: blur(1rem);
  border-radius: 5rem;
}

strong {
  z-index: 2;
  font-family: "Avalors Personal Use";
  font-size: 12px;
  letter-spacing: 5px;
  color: #ffffff;
  text-shadow: 0 0 4px white;
}

#glow {
  position: absolute;
  display: flex;
  width: 12rem;
}

.circle {
  width: 100%;
  height: 30px;
  filter: blur(2rem);
  animation: pulse_3011 4s infinite;
  z-index: -1;
}

.circle:nth-of-type(1) {
  background: rgba(254, 83, 186, 0.636);
}

.circle:nth-of-type(2) {
  background: rgba(142, 81, 234, 0.704);
}

.btn:hover #container-stars {
  z-index: 1;
  background-color: #212121;
}

.btn:hover {
  transform: scale(1.1);
}

.btn:active {
  border: double 4px #fe53bb;
  background-origin: border-box;
  background-clip: content-box, border-box;
  animation: none;
}

.btn:active .circle {
  background: #fe53bb;
}

#stars {
  position: relative;
  background: transparent;
  width: 200rem;
  height: 200rem;
}

#stars::after {
  content: "";
  position: absolute;
  top: -10rem;
  left: -100rem;
  width: 100%;
  height: 100%;
  animation: animStarRotate 90s linear infinite;
}

#stars::after {
  background-image: radial-gradient(#ffffff 1px, transparent 1%);
  background-size: 50px 50px;
}

#stars::before {
  content: "";
  position: absolute;
  top: 0;
  left: -50%;
  width: 170%;
  height: 500%;
  animation: animStar 60s linear infinite;
}

#stars::before {
  background-image: radial-gradient(#ffffff 1px, transparent 1%);
  background-size: 50px 50px;
  opacity: 0.5;
}

@keyframes animStar {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-135rem);
  }
}

@keyframes animStarRotate {
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0);
  }
}

@keyframes gradient_301 {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

@keyframes pulse_3011 {
  0% {
    transform: scale(0.75);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }

  100% {
    transform: scale(0.75);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}

</style>