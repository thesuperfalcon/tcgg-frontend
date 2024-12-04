<script>
  import { onMount } from 'svelte';

  export let gameData = null; // This will be bound to the parent
  export let errorMessage = ''; // This will be bound to the parent
  
  let lastFetchedData = null;  // Track the last fetched data

  // Fetch data from API and only update if new data is received
  async function fetchData() {
    try {
      const response = await fetch('https://localhost:44393/getMatch');
      if (!response.ok) {
        throw new Error('Failed to fetch match data');
      }
      const newGameData = await response.json();
      
      // Only update gameData if it is different from the last fetched data
      if (JSON.stringify(newGameData) !== JSON.stringify(lastFetchedData)) {
        gameData = newGameData;
        lastFetchedData = newGameData;
        console.log('Game data updated:', gameData);
      }
    } catch (error) {
      errorMessage = error.message;
      console.error(errorMessage);
    }
  }

  // Call the fetchData function when the component mounts
  onMount(fetchData);
</script>

<!-- You can have other HTML/UI logic in GetGame.svelte here if necessary -->
