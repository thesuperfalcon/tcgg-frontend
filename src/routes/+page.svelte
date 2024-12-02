<script>
    import GetGame from '$lib/getgame.svelte';
    let gameData = null;
    let errorMessage = '';
  </script>
  
  <GetGame bind:gameData bind:errorMessage />  <!-- Bind the reactive variables to GetGame component -->

  {#if errorMessage}
    <p style="color: red;">Error: {errorMessage}</p>
  {:else if gameData}
    <div>
      <h2>Board Info</h2>
      <h3>Turn: {gameData.board.turns}</h3>
      <h3>Current Turn: Player {gameData.board.currentPlayerId}</h3>
      <div>
        <h3>{gameData.board.player1.name} (Health: {gameData.board.player1.health})</h3>
        <p>Cards in Match Deck: {gameData.board.player1.matchDeck.cards.length}</p>
        <h4>Cards:</h4>
        <ul>
          {#each gameData.board.player1.matchDeck.cards as card}
            <li>{card.name} (Health: {card.health}, Attack: {card.attack})</li>
          {/each}
        </ul>
      </div>
  
      <div>
        <h3>{gameData.board.player2.name} (Health: {gameData.board.player2.health})</h3>
        <p>Cards in Match Deck: {gameData.board.player2.matchDeck.cards.length}</p>
        <h4>Cards:</h4>
        <ul>
          {#each gameData.board.player2.matchDeck.cards as card}
            <li>{card.name} (Health: {card.health}, Attack: {card.attack})</li>
          {/each}
        </ul>
      </div>
    </div>
  {:else}
    <p>Loading match data...</p>
  {/if}
  