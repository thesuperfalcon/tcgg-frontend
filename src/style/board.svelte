<script>
    import GetGame from '$lib/getgame.svelte'; 
    import Hand from '../style/hand.svelte';
  
    let gameData = null;
    let errorMessage = '';
  
    const player1Hand = [1, 2, 3, 4, 5, 6, 7];
    const player2Hand = [28, 29, 30, 31, 32, 33, 34];
  
    function hasCard(row, index) {
      return row.includes(index);
    }
  </script>
  
  <GetGame bind:gameData bind:errorMessage />
  
  <div class="container">
    {#each Array(36) as _, index}
      <div class="box">
        {#if hasCard(player1Hand, index)}
          <Hand hand={player1Hand} gameData={gameData} playerId="player1" />
        {/if}
        {#if hasCard(player2Hand, index)}
          <Hand hand={player2Hand} gameData={gameData} playerId="player2" />
        {/if}
      </div>
    {/each}
  </div>
  
  <style>
    :global(html, body) {
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      box-sizing: border-box;
    }
  
    .container {
      display: grid;
      grid-template-columns: repeat(9, 1fr);
      grid-template-rows: repeat(4, 1fr);
      column-gap: 0;
      row-gap: 10px;
      padding: 10px;
      height: 100vh;
      width: 100vw;
      background-color: rebeccapurple;
      box-sizing: border-box;
    }
  
    .box {
      background-color: white;
      border: 1px solid black;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      height: 100%;
    }
  </style>
  