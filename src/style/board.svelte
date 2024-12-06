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
  // let player1Id = null;
  // let player2Id = null;
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

      // player1Id = gameData.player1.id;
      // player2Id = gameData.player2.id;
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
    
    // Now perform the attack action
    await attackCard(selectedAttackCardId, selectedDefendCardId, currentPlayerId);
    
    // Reset the selected cards after the attack
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

    // After attack, fetch the latest game data to refresh the state
    gameData = await fetchMatchData();  // Refresh the game state
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
  :global(html, body) {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    box-sizing: border-box;
  }

  .container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    background-color: rebeccapurple;
    box-sizing: border-box;
    padding: 10px;
  }

  .row {
    display: flex;
    justify-content: flex-start; 
    margin-bottom: 10px;
    flex: 1; 
    justify-content: center;

  }
  .error {
    color: red;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
  }

  .non-clickable {
    pointer-events: none;

  }
    
  .highlight {
    outline: 3px solid yellow;
    background-color: rgba(255, 255, 0, 0.2);
    transition: outline 0.3s ease, background-color 0.3s ease;
  }
  

</style>

<div class="container">

  <!-- <GetGame bind:gameData bind:errorMessage /> -->

  {#if errorMessage}
    <div class="error">{errorMessage}</div>
  {:else if gameData}
{#if gameData.status === "GameOver"}
<div class>
  <h1>Game Over</h1>
  <p>Winner: {gameData.winner}</p>
  <button onclick={onRestart}>Restart Game</button>
</div>
{:else}
  <div class="row">
    <Card>
      <div class="non-clickable">
      {player1.name}<br>
      HP: {player1.health}
    </Card>
  </div>
    <!-- Player 1 Hand (Row 1) -->
    <div class="row">
      {#each player1Hand as card, index}
      <div onclick={() => playCard(1, card.id)}>
        <Card>
          {#if card}
          <div class="non-clickable">
            {card.name}<br />
            Health: {card.health}<br />
            Attack: {card.attack}
          </div>
          {:else}
            P1 Hand {index + 1}
          {/if}
        </Card>
      </div>
      {/each}
      <Deck>
        {#if gameData.board.currentPlayerId === player1.id && turnInProgress}
        
        <button onclick={() => drawCard(player1.id)}>Draw Card</button>
        {/if}
      </Deck>
    </div>
    
    <!-- Player 1 Field (Row 2) -->
    <div class="row">
      {#each player1Field as card, index}
      <div 
      class:selected={highlightedCards === card.id}
      class:highlight={highlightedCards.includes(card.id)}
      onclick={() => selectAttack(player1.id, card.id)}>
        <Card>
          {#if card}
          <div class="non-clickable">
            {card.name}<br />
            Health: {card.health}<br />
            Attack: {card.attack}
          </div>
            <button onclick={() => attackPlayer(card.id, player1.id)}>attack player</button>
          {:else}
            P1 Field {index + 1}
          {/if}
        </Card>
        </div>
      {/each}
    </div>
    
    <!-- Player 2 Field (Row 3) -->
    <div class="row">
      {#each player2Field as card, index}
      <div 
      class:selected={highlightedCards === card.id}
      class:highlight={highlightedCards.includes(card.id)}
      onclick={() => selectAttack(player2.id, card.id)}>
      <Card>
        {#if card}
        <div class="non-clickable">
            {card.name}<br />
            Health: {card.health}<br />
            Attack: {card.attack}
          </div>
            <button onclick={() => attackPlayer(card.id, player2.id)}>attack player</button>
          {:else}
            P2 Field {index + 1}  
          {/if}
        </Card>
      </div>
      {/each}
    </div>
    
    <!-- Player 2 Hand (Row 4) -->
    <div class="row">
      <Deck>
        {#if gameData.board.currentPlayerId === player2.id && turnInProgress}
        <button onclick={() => drawCard(player2.id)}>Draw Card</button>
        {/if}
      </Deck>
      {#each player2Hand as card, index}
      <div onclick={() => playCard(2, card.id)}>
      <Card >
          {#if card}
          <div class="non-clickable">
            {card.name}<br />
            Health: {card.health}<br />
            Attack: {card.attack}
          </div>
          {:else}
            P2 Hand {index + 1}
          {/if}
        </Card>
      </div>
      {/each}
    </div>
    <div class="row">
      <Card >
        <div class="non-clickable">
        {player2.name}<br>
        HP: {player2.health}
      </div>
      </Card>
    </div>
    {/if}
    {:else}
      <p style="text-align: center;">Loading game data...</p>
    {/if}
</div>