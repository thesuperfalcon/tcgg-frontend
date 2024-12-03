export async function fetchDrawRndCardP1() {
    try {
        const response = await fetch('https://localhost:44393/drawRndCard?PlayerId=1');
        if (!response.ok) {
            throw new Error('Failed to draw card for Player 1');
        }
        return await response.text();
    } catch (error) {
        console.error(error);
    }
}

export async function fetchDrawRndCardP2() {
    try {
        const response = await fetch('https://localhost:44393/drawRndCard?PlayerId=2');
        if (!response.ok) {
            throw new Error('Failed to draw card for Player 2');
        }
        return await response.text();
    } catch (error) {
        console.error(error);
    }
}

export async function fetchPlayCardP1(cardId) {
    try {
        const response = await fetch(`https://localhost:44393/playCard?playerId=1&cardId=${cardId}`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to play card for Player 1');
        }
        return await response.text();
    } catch (error) {
        console.error(error);
    }
}

export async function fetchPlayCardP2(cardId) {
    try {
        const response = await fetch(`https://localhost:44393/playCard?playerId=2&cardId=${cardId}`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to play card for Player 2');
        }
        return await response.text();
    } catch (error) {
        console.error(error);
    }
}


export async function fetchAttackCard(attackCardId, defenseCardId, playerId) {
    try {
        const response = await fetch(`https://localhost:44393/attackCard?attackCardId=${attackCardId}&defenseCardId=${defenseCardId}&playerId=${playerId}`, {
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

