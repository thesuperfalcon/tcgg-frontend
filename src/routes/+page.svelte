<script>
	import { onMount } from 'svelte';
  import { fetchDrawRndCardP1, fetchDrawRndCardP2, fetchPlayCardP1, fetchPlayCardP2, fetchAttackCard } from '$api/card.js';
	import { fetchMatchData, fetchStartGame, fetchEndTurn } from '$api/match.js'; // Use the API module
  import { fetchAttackPlayer1, fetchAttackPlayer2 } from '$api/player.js';

	let gameData = null;
	let errorMessage = '';
  let currentPlayerId = null;
  let playerIds = [1, 2];
  let selectedCardIdP1 = null;
  let selectedCardIdP2 = null;
  let selectedAttackCardId = null;
  let selectedDefendCardId = null;

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

  async function drawCardP1() {
    try {
      const result = await fetchDrawRndCardP1();
      console.log('Card drawn:', result);
      selectedCardIdP1 = result.cardId;
      gameData = await fetchMatchData();
    } catch (error) {
      errorMessage = `Failed to draw card for player 1: ${error.message}`;
    }
  }

  async function drawCardP2() {
    try {
      const result = await fetchDrawRndCardP2();
      console.log('Card drawn:', result);
      selectedCardIdP2 = result.cardId;
      gameData = await fetchMatchData();
    } catch (error) {
      errorMessage = `Failed to draw card for player 2: ${error.message}`;
    }
  }

  async function endTurn() {
    try {
      if (currentPlayerId === null) {
        throw new Error('No player has started yet.');
      }
      
      const result = await fetchEndTurn(currentPlayerId); // End the turn for the current player
      console.log('Turn ended for player:', currentPlayerId, result);

      // Switch to the next player's turn
      currentPlayerId = currentPlayerId === playerIds[0] ? playerIds[1] : playerIds[0];

      // Refresh the game data after ending the turn
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


<div>
  <!-- Error Handling -->
  {#if errorMessage}
    <p>Error: {errorMessage}</p>
  {:else}

  <!-- Game Data Display -->
  {#if gameData}
    <!-- Game Status -->
    <div>
      <h2>Game Status     <!-- Start Game Button -->
        <button on:click={StartGame}>Start Game</button>
      </h2>
      <h3>Turn: {gameData.board.turns}</h3>
      <h3>Current Turn: Player {gameData.board.currentPlayerId} 
      <button on:click={endTurn}>End Turn for Player {gameData.board.currentPlayerId}</button>
      </h3>
      
    </div>

    <!-- Player 1 Section -->
    <div>
      <h3>{gameData.board.player1.name} (Health: {gameData.board.player1.health})</h3>
      <p>Cards in Match Deck: {gameData.board.player1.matchDeck.cards.length}</p>
      
      <h4>Match Deck:</h4>
      <ul>
        {#each gameData.board.player1.matchDeck.cards as card}
          <li>{card.name} (Health: {card.health}, Attack: {card.attack}, Rarity: {card.rarity})</li>
        {/each}
      </ul>

      <h4>Graveyard:</h4>
      <ul>
        {#each gameData.board.player1.graveyard as card}
          <li>{card.name} (Health: {card.health}, Attack: {card.attack}, Rarity: {card.rarity})</li>
        {/each}
      </ul>

      <h4>Cards in Hand:</h4>
      <ul>
        {#each gameData.board.player1.hand as card}
          <li>
            {card.name} (Health: {card.health}, Attack: {card.attack}, Rarity: {card.rarity})
            <button on:click={() => playCardP1(card.id)}>Play {card.name}</button>
          </li>
        {/each}
      </ul>

      <button on:click={drawCardP1}>Player 1 draw card</button>

      <h4>Field:</h4>
      <ul>
        {#each gameData.board.player1Field as card}
          <li>
            Id:{card.id} {card.name} (Health: {card.health}, Attack: {card.attack}, Rarity: {card.rarity})
            <button on:click={() => selectAttack(card.id, 'player2')}>Attack Opponent's Card</button>
            <button on:click={() => attackPlayer(card.id, 'player1')}>Attack Player</button>
          </li>
        {/each}
      </ul>
    </div>

    <!-- Player 2 Section (Made identical to Player 1) -->
    <div>
      <h3>{gameData.board.player2.name} (Health: {gameData.board.player2.health})</h3>
      <p>Cards in Match Deck: {gameData.board.player2.matchDeck.cards.length}</p>

      <h4>Match Deck:</h4>
      <ul>
        {#each gameData.board.player2.matchDeck.cards as card}
          <li>{card.name} (Health: {card.health}, Attack: {card.attack}, Rarity: {card.rarity})</li>
        {/each}
      </ul>

      <h4>Graveyard:</h4>
      <ul>
        {#each gameData.board.player2.graveyard as card}
          <li>{card.name} (Health: {card.health}, Attack: {card.attack}, Rarity: {card.rarity})</li>
        {/each}
      </ul>

      <h4>Cards in Hand:</h4>
      <ul>
        {#each gameData.board.player2.hand as card}
          <li>
            {card.name} (Health: {card.health}, Attack: {card.attack}, Rarity: {card.rarity})
            <button on:click={() => playCardP2(card.id)}>Play {card.name}</button>
          </li>
        {/each}
      </ul>

      <button on:click={drawCardP2}>Player 2 draw card</button>

      <h4>Field:</h4>
      <ul>
        {#each gameData.board.player2Field as card}
          <li>
            Id:{card.id} {card.name} (Health: {card.health}, Attack: {card.attack}, Rarity: {card.rarity})
            <button on:click={() => selectAttack(card.id, 'player1')}>Attack Opponent's Card</button>
            <button on:click={() => attackPlayer(card.id, 'player2')}>Attack Player</button>
          </li>
        {/each}
      </ul>
    </div>



  {:else}
    <p>Loading match data...</p>
  {/if}
  {/if}
</div>
