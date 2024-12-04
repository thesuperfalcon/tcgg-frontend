<script>
  import { fetchDrawRndCardP1, fetchDrawRndCardP2} from '$api/card.js';

  export let gameData = null;
  export let errorMessage = '';
  export let playerId = null;

  export async function drawCard(playerId) {
  try {
    const result = playerId === 1 
      ? await fetchDrawRndCardP1() 
      : await fetchDrawRndCardP2(); 

    console.log('Card drawn:', result);

    if (playerId === 1) {
      selectedCardIdP1 = result.cardId;
    } else {
      selectedCardIdP2 = result.cardId; 
    }

    gameData = await fetchMatchData();
  } catch (error) {
    errorMessage = `Failed to draw card for player ${playerId}: ${error.message}`;
  }
}
</script>
  
  <style>
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
  </style>
  
  <div class="deck">
    <button on:click={drawCard(playerId)}>Draw Card</button>
  </div>
  