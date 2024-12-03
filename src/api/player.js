export async function fetchAttackPlayer(playerId, cardId) {
    try {
        const response = await fetch(`https://localhost:44393/attackPlayer?playerId=${playerId}&cardId=${cardId}`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to attack card for Player ' + playerId);
        }
        return await response.text();
    } catch (error) {
        console.error(error);
    }
}
