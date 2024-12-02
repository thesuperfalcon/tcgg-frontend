<script>
  import { onMount } from 'svelte';
  
  export let gameData = null;
  export let errorMessage = '';
  
  // Fetch data from API
  async function fetchData() {
    try {
      const response = await fetch('https://localhost:44393/getMatch');
      if (!response.ok) {
        throw new Error('Failed to fetch match data');
      }
      gameData = await response.json(); // Store the data in gameData
    } catch (error) {
      errorMessage = error.message;
    }
  }
  
  // Call the fetchData function when the component mounts
  onMount(fetchData);

  // Refresh the game data whenever `gameData` is updated
  $: if (gameData) {
    console.log('New game data received:', gameData);
    // Re-fetch data whenever gameData changes
    fetchData();
  }
</script>
