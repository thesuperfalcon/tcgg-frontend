export async function fetchAttackPlayer1(cardId) {
    try {
      const response = await fetch(`https://localhost:44393/attackPlayer?playerId=1&cardId=${cardId}`, {
        method: 'POST'
      });
  
      if (!response.ok) {
        const errorText = await response.text(); // Get response text to show specific error
        throw new Error(`Failed to attack card for Player 1`);
      }
      
      return await response.text();
    } catch (error) {
      console.error('Error during attack (Player 1):', error);
      alert('Error: ' + error.message);
    }
  }


  export async function fetchAttackPlayer2(cardId) {
    try {
      const response = await fetch(`https://localhost:44393/attackPlayer?playerId=2&cardId=${cardId}`, {
        method: 'POST'
      });
  
      if (!response.ok) {
        const errorText = await response.text(); // Get response text to show specific error
        throw new Error(`Failed to attack card for Player 2`);
      }
      
      return await response.text();
    } catch (error) {
      console.error('Error during attack (Player 2):', error);
      alert('Error: ' + error.message);
    }
  }