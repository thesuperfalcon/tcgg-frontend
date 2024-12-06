export async function fetchStartGame() {
    try {
        const response = await fetch('https://localhost:44393/game?coinToss=1');
        if (!response.ok) {
            throw new Error('Failed to fetch match data');
        }
        return await response.text();
    } catch (error) {
        console.error(error);
    }
}


export async function fetchMatchData() {
    try {
        const response = await fetch('https://localhost:44393/getMatch');
        if (!response.ok) {
            throw new Error('Failed to fetch match data');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function fetchStartTurn(playerId)
{
    try {
        const response = await fetch(`https://localhost:44393/startTurn?PlayerId=${playerId}`, {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error('Failed to fetch start turn, wrong player!');
        }
        return await response.text();
    } catch (error) {
        console.error(error);
    }
}

export async function fetchEndTurn(playerId) {
    try {
        const response = await fetch(`https://localhost:44393/endTurn?playerId=${playerId}`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to fetch end turn, wrong player!');
        }
        return await response.text();
    } catch (error) {
        console.error(error);
    }
}

export async function fetchGetBoard() {
    try {
        const response = await fetch('https://localhost:44393/getBoard');
        if (!response.ok) {
            throw new Error('Failed to fetch match data');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}
