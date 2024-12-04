<script>
    import Card from '../style/card.svelte'; 
    import Deck from '../style/deck.svelte';
  
    export let gameData = null; 
    export let errorMessage = '';
  
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
          <Card>
            {#if card}
              {card.name}<br />
              Health: {card.health}<br />
              Attack: {card.attack}
            {:else}
              P1 Hand {index + 1}
            {/if}
          </Card>
        {/each}
        <Deck>
        </Deck>
      </div>
      
      <!-- Player 1 Field (Row 2) -->
      <div class="row">
        {#each player1Field as card, index}
          <Card>
            {#if card}
              {card.name}<br />
              Health: {card.health}<br />
              Attack: {card.attack}
            {:else}
              P1 Field {index + 1}
            {/if}
          </Card>
        {/each}
      </div>
      
      <!-- Player 2 Field (Row 3) -->
      <div class="row">
        {#each player2Field as card, index}
          <Card>
            {#if card}
              {card.name}<br />
              Health: {card.health}<br />
              Attack: {card.attack}
            {:else}
              P2 Field {index + 1}
            {/if}
          </Card>
        {/each}
      </div>
      
      <!-- Player 2 Hand (Row 4) -->
      <div class="row">
        <Deck>Deck</Deck>
        {#each player2Hand as card, index}
          <Card>
            {#if card}
              {card.name}<br />
              Health: {card.health}<br />
              Attack: {card.attack}
            {:else}
              P2 Hand {index + 1}
            {/if}
          </Card>
        {/each}
      </div>
      {:else}
        <p style="text-align: center;">Loading game data...</p>
      {/if}
  </div>