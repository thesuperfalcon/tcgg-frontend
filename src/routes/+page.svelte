<script>
	import { onMount } from 'svelte';
  import { fetchDrawRndCardP1, fetchDrawRndCardP2, fetchPlayCardP1, fetchPlayCardP2, fetchAttackCard } from '$api/card.js';
	import { fetchMatchData, fetchStartGame, fetchEndTurn } from '$api/match.js'; // Use the API module
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
    if (gameData) {

      player1Id = gameData.player1.id;
      player2Id = gameData.player2.id;

      currentPlayerId = gameData.board.currentPlayerId;

    }
  }

  async function StartGame(){
    try {
      const result = await fetchStartGame();
      console.log('Game started:', result);
      gameData = result;
      gameData = await fetchMatchData();
      currentPlayerId = gameData.board.currentPlayerId;
    } catch (error) {
      errorMessage = `Failed to start game: ${error.message}`;
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
      if (!gameData ||currentPlayerId === null) {
        throw new Error('No player has started yet.');
      }
      
      console.log('Ending turn for player:', currentPlayerId)

      const result = await fetchEndTurn(currentPlayerId);
      console.log('Turn ended for player:', currentPlayerId, result);

      // Switch to the next player's turn
      if (currentPlayerId === player1Id) {
        currentPlayerId = player2Id;
      } else {
        currentPlayerId = player1Id;
      }

      gameData = await fetchMatchData();
    } catch (error) {
      errorMessage = `Failed to end turn for player ${currentPlayerId}: ${error.message}`;
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

{#if errorMessage}
    <p style="color: red;">Error: {errorMessage}</p>
  {:else if gameData}
      <h2>Board Info || Turn: {gameData.board.turns} Current Turn: Player {gameData.board.currentPlayerId}</h2>
      <button onclick={StartGame}>Start Game</button>
      <button onclick={endTurn}>End turn for player: {gameData.board.currentPlayerId}</button>

  {/if}

<Board gameData={gameData} errorMessage={errorMessage} />

