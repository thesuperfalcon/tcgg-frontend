<script>
  export let onRestart;
  import Card from '../style/card.svelte'; 
  import Deck from '../style/deck.svelte';
  import { fetchMatchData, fetchStartGame, fetchEndTurn, fetchStartTurn } from '$api/match.js'; // Use the API module
  import { fetchDrawRndCardP1, fetchDrawRndCardP2, fetchPlayCardP1, fetchPlayCardP2, fetchAttackCard } from '$api/card.js';
  import { fetchAttackPlayer1, fetchAttackPlayer2 } from '$api/player.js';
  import { turnInProgress } from '$lib/turnstore.js';



  export let gameData = null; 
  export let errorMessage = '';

  let currentPlayerId = null;
  let selectedCardIdP1 = null;
  let selectedCardIdP2 = null;
  let selectedAttackCardId = null;
  let highlightedCards = [];
  let selectedDefendCardId = null;
  let player1 = null;
  let player2 = null;
  let player1Hand = [];
  let player2Hand = [];
  let player1Field = [];
  let player2Field = [];


  $: {
    if (gameData) {
      player1Hand = gameData.player1.hand || [];
      player2Hand = gameData.player2.hand || [];
      player1Field = gameData.board.player1Field || [];
      player2Field = gameData.board.player2Field || [];
      player1 = gameData.board.player1;
      player2 = gameData.board.player2;
      currentPlayerId = gameData.board.currentPlayerId;

      console.log("player 1: ", player1.id);
      console.log("player 2: ", player2.id);
      console.log("current player: ", currentPlayerId);
    }
  }


  async function drawCard(playerId) {
  try {
    // const result = playerId === 1 
    //   ? await fetchDrawRndCardP1() 
    //   : await fetchDrawRndCardP2(); 

    // console.log('Card drawn:', result);

    // if (playerId === 1) {
    //   selectedCardIdP1 = result.cardId;
    // } else {
    //   selectedCardIdP2 = result.cardId; 
    // }

    if($turnInProgress) return;

    await fetchStartTurn(playerId);

    turnInProgress.set(true);

    gameData = await fetchMatchData();
  } catch (error) {
    errorMessage = `Failed to draw card for player ${playerId}: ${error.message}`;
  }
}

  async function playCard(playerId, cardId) {
  try {
    const result = playerId == 1 ? await fetchPlayCardP1(cardId) : await fetchPlayCardP2(cardId);
    console.log('Card played for Player:', result);
    gameData = await fetchMatchData();
  } catch (error) {
    errorMessage = `Failed to play card for Player: ${error.message}`;
  }
}

  async function selectAttack(playerId, cardId) {
  if (selectedAttackCardId === null) {
    selectedAttackCardId = cardId;
    highlightedCards = playerId === 1 ? player2Field.map(card => card.id) : player1Field.map(card => card.id);
  } else {
    selectedDefendCardId = cardId;
    
    await attackCard(selectedAttackCardId, selectedDefendCardId, currentPlayerId);

    selectedAttackCardId = null;
    selectedDefendCardId = null;
    highlightedCards = [];
  }
  }

async function attackCard(attackCardId, defenseCardId, playerId) {
  try {
    console.log("Attack card:", attackCardId, "Defense card:", defenseCardId, "Player ID:", playerId);
    const result = await fetchAttackCard(attackCardId, defenseCardId, playerId);
    console.log('Attack result:', result);

    gameData = await fetchMatchData(); 
  } catch (error) {
    console.error('Error during attack:', error);
  }
}

async function attackPlayer(cardId, playerId) {
  try {
    const result = playerId === 1 
      ? await fetchAttackPlayer1(cardId) 
      : await fetchAttackPlayer2(cardId);

    console.log(`Player ${playerId} attacked with card ${cardId}:`, result);

    // Refresh the game data after the attack
    gameData = await fetchMatchData();

    // Check for win condition
    if (gameData.player1.health <= 0 || gameData.player2.health <= 0) {
      const winner = gameData.player1.health > 0 
        ? gameData.player1.name 
        : gameData.player2.name;

      gameData.status = "GameOver";
      gameData.winner = winner;

      console.log(`Game Over! Winner is ${winner}`);
    }
  } catch (error) {
    console.error('Error during player attack:', error);
  }
}


</script>

<style>

.row{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  min-height: 190px;
  height: 190px;
}

.error {
  color: red;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
  font-size: 1.2em;
}

.highlight {
  outline: 3px solid #f4e04d;
  background-color: rgba(244, 224, 77, 0.2);
  transition: outline 0.3s ease, background-color 0.3s ease;
}

.card-hand, .card-field {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 170px;
}

.card-hand{
  .card{
  margin-left: -10px;
  margin-right: -10px;
  z-index: 1;
  }
  font-weight: bold;
}

.card-field{
  .card {
    margin: 5px;
  }
}

:global(#p1) {
    .card {
      border: gold 2px solid;
    
  }
    .deck {
      background-color: gold;
  }
}

:global(#p2) {
    .card {
      border: red 2px solid;
  }
    .deck {
      background-color: red;
  }
}

.player-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #555;
  padding: 8px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
  /* width: auto; */
  width: 240px;
  text-align: center;
  overflow-y: auto;
  height: 170px;
}

.card {
  background: white;
  border: 2px solid #2d2d2d;
  border-radius: 10px;
  padding: 10px;
  width: 100px;
  height: 150px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  color: #2d2d2d;
  font-family: 'Times New Roman', serif;
}



.card:hover {
  transform: scale(1.05);
  cursor: pointer;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.6);
}

.card-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  height: 100%;
  padding: 5px;
}

.card-name {
  font-size: 1em;
  font-weight: bold;
  color: #333;
}

.card-stats {
  font-size: 0.9em;
  color: #555;
  margin-top: 5px;
}

.deck {
      background-color: greenyellow;
      border: 1px solid black;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px;
      text-align: center;
      font-size: 12px;
      height: 150px;
      width: 100px;
      box-sizing: border-box;
      border-radius: 4px;
      transition: transform 0.2s;
    }
  
    .deck:hover {
      font-weight: bolder;
      font-size: larger;
      transform: scale(1.05);
    }

.deck-button {
  background-color: #f4e04d;
  border: none;
  color: #2d2d2d;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.deck-button:hover {
  background-color: #d4c300;
}



.action-buttons {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.card-name, .card-health, .card-attack {
  font-size: 0.9em;
  margin: 3px 0;
}

</style>


  {#if errorMessage}
    <div class="error">{errorMessage}</div>
    {:else if gameData}
    
  {#if gameData.status === "GameOver"}
  <div>
  <h1>Game Over</h1>
  <p>Winner: {gameData.winner}</p>
  <button onclick={onRestart}>Restart Game</button>
  </div>
  {:else}
    <!-- Player 1 Info and Deck -->
    <div class="row">
    <div class="player-info" id="p1">
      <div class="deck">
        {#if gameData.board.currentPlayerId === player1.id && turnInProgress}
        
        <button onclick={() => drawCard(player1.id)}>Draw Card</button>
        {/if}
      </div>
      <div>{player1.name}</div>
      <div>HP: {player1.health}</div>
    </div>
  </div>

    <!-- Player 1 Hand -->
    <div class="row">
    <div class="card-hand" id="p1">
      {#each player1Hand as card, index}
        <div onclick={() => playCard(1, card.id)}>
          <div class="card">
            {#if card}
            <div class="card-content">
              <div class="card-name">{card.name}</div>
              <div class="card-stats">
                Health: {card.health}<br />
                Attack: {card.attack}
              </div>
            </div>
            {:else}
              <div class="card-name">P1 Hand {index + 1}</div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>

    <!-- Player 1 Field -->
     <div class="row">
    <div class="card-field" id="p1">
      {#each player1Field as card, index}
        <div 
          class:selected={highlightedCards === card.id}
          class:highlight={highlightedCards.includes(card.id)}
          onclick={() => selectAttack(player1.id, card.id)}>
          <div class="card">
            {#if card}
            <div class="card-content">
              <div class="card-name">{card.name}</div>
              <div class="card-stats">
                Health: {card.health}<br />
                Attack: {card.attack}
              </div>
              <div class="action-buttons">
                <button class="deck-button" onclick={() => attackPlayer(card.id, player1.id)}>Attack Player</button>
              </div>
            </div>
            {:else}
              <div class="card-name">P1 Field {index + 1}</div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>

    <!-- Player 2 Field -->
    <div class="row">
    <div class="card-field" id="p2">
      {#each player2Field as card, index}
        <div 
          class:selected={highlightedCards === card.id}
          class:highlight={highlightedCards.includes(card.id)}
          onclick={() => selectAttack(player2.id, card.id)}>
          <div class="card">
            {#if card}
            <div class="card-content">
              <div class="card-name">{card.name}</div>
              <div class="card-stats">
                Health: {card.health}<br />
                Attack: {card.attack}
              </div>
              <div class="action-buttons">
                <button class="deck-button" onclick={() => attackPlayer(card.id, player2.id)}>Attack Player</button>
              </div>
            </div>
            {:else}
              <div class="card-name">P2 Field {index + 1}</div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>

    <!-- Player 2 Hand -->
    <div class="row">
    <div class="card-hand" id="p2">
      {#each player2Hand as card, index}
        <div onclick={() => playCard(2, card.id)}>
          <div class="card">
            {#if card}
            <div class="card-content">
              <div class="card-name">{card.name}</div>
              <div class="card-stats">
                Health: {card.health}<br />
                Attack: {card.attack}
              </div>
            </div>
            {:else}
              <div class="card-name">P2 Hand {index + 1}</div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>

    <!-- Player 2 Info and Deck -->
    <div class="row">
    <div class="player-info" id="p2">
      <div class="deck">
        <button class="deck-button" onclick={() => drawCard(player2.id)}>Draw Card</button>
      </div>
      <div>{player2.name}</div>
      <div>HP: {player2.health}</div>
    </div>
  </div>

  {/if }
  {:else}
    <p style="text-align: center;">Loading game data...</p>
  {/if}
