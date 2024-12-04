<script>
    import drawCardP1  from '../routes/+page.svelte';
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
  <button on:click={drawCardP1()}>Draw Card</button>
</div>