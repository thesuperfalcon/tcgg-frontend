<script>
    export let hand = [];
    export let gameData = null;
    export let playerId = '';
  
    import Card from '../style/card.svelte';
  
    function hasCard(index) {
  return gameData?.board[playerId]?.hand && gameData.board[playerId].hand[index];
}
  </script>
  
  {#each hand as _, index}
    {#if hasCard(index)}
      <Card>
        {gameData.board[playerId].hand[index]?.name}<br />
        Health: {gameData.board[playerId].hand[index]?.health}<br />
        Attack: {gameData.board[playerId].hand[index]?.attack}
      </Card>
    {/if}
  {/each}
  