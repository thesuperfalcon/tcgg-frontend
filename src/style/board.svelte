<script>
  import Card from '../style/card.svelte'; 
  import Deck from '../style/deck.svelte';
  import { fetchMatchData, fetchStartGame, fetchEndTurn } from '$api/match.js'; // Use the API module
  import { fetchDrawRndCardP1, fetchDrawRndCardP2, fetchPlayCardP1, fetchPlayCardP2, fetchAttackCard } from '$api/card.js';

  export let gameData = null; 
  export let errorMessage = '';
  let currentPlayerId = null;
  let player1Id = null;
  let player2Id = null;
  let selectedCardIdP1 = null;
  let selectedCardIdP2 = null;
  let selectedAttackCardId = null;
  let selectedDefendCardId = null;

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

      player1Id = gameData.player1.id;
      player2Id = gameData.player2.id;

      currentPlayerId = gameData.board.currentPlayerId;

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
  } else {
    selectedDefendCardId = cardId;
    
    // Now perform the attack action
    attackCard(selectedAttackCardId, selectedDefendCardId, currentPlayerId);
    
    // Reset the selected cards after the attack
    selectedAttackCardId = null;
    selectedDefendCardId = null;
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
</style>

<div class="container">
  <!-- <GetGame bind:gameData bind:errorMessage /> -->

  {#if errorMessage}
    <div class="error">{errorMessage}</div>
  {:else if gameData}
    <!-- Player 1 Hand (Row 1) -->
    <div class="row">
      {#each player1Hand as card, index}
      <div onclick={() => playCard(1, card.id)}>
        <Card>
          {#if card}
            {card.name}<br />
            Health: {card.health}<br />
            Attack: {card.attack}
          {:else}
            P1 Hand {index + 1}
          {/if}
        </Card>
      </div>
      {/each}
      <Deck gameData={gameData} errorMessage={errorMessage} playerId={1}>
      </Deck>
    </div>
    
    <!-- Player 1 Field (Row 2) -->
    <div class="row">
      {#each player1Field as card, index}
      <div onclick={() => selectAttack(1, card.id)}>
        <Card>
          {#if card}
            {card.name}<br />
            Health: {card.health}<br />
            Attack: {card.attack}
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
      <div ondblclick={() => selectAttack(2, card.id)}>
      <Card>
        {#if card}
            {card.name}<br />
            Health: {card.health}<br />
            Attack: {card.attack}
          {:else}
            P2 Field {index + 1}
          {/if}
        </Card>
      </div>
      {/each}
    </div>
    
    <!-- Player 2 Hand (Row 4) -->
    <div class="row">
      <Deck gameData={gameData} errorMessage={errorMessage} playerId={2}/>
      {#each player2Hand as card, index}
      <div ondblclick={() => playCard(2, card.id)}>
      <Card >
          {#if card}
            {card.name}<br />
            Health: {card.health}<br />
            Attack: {card.attack}
          {:else}
            P2 Hand {index + 1}
          {/if}
        </Card>
      </div>
      {/each}
    </div>
    {:else}
      <p style="text-align: center;">Loading game data...</p>
    {/if}
</div>