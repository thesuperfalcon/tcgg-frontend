<script>
  import { onMount } from "svelte";
  import { turnInProgress } from "$lib/turnstore.js";
  import { fetchAttackPlayer1, fetchAttackPlayer2 } from "$api/player.js";
  import {
    fetchPlayCardP1,
    fetchPlayCardP2,
    fetchAttackCard,
  } from "$api/card.js";
  import {
    fetchMatchData,
    fetchStartGame,
    fetchEndTurn,
    fetchStartTurn,
  } from "$api/match.js";

  let gameData = null;
  let errorMessage = "";
  let currentPlayerId = null;
  let player1Id = null;
  let player2Id = null;
  let selectedAttackCardId = null;
  let selectedDefendCardId = null;
  let highlightedCards = [];
  let player1 = null;
  let player2 = null;
  let player1Hand = [];
  let player2Hand = [];
  let player1Field = [];
  let player2Field = [];

  $: {
    console.log("gameData", gameData);
    if (gameData) {
      player1Id = gameData.player1.id;
      player2Id = gameData.player2.id;
      currentPlayerId = gameData.board.currentPlayerId;

      if (
        gameData.player1.graveyard.length > 0 ||
        gameData.player2.graveyard.length > 0
      ) {
        console.log("Player 1 graveyard: ", gameData.player1.graveyard.length);
        console.log("Player 2 graveyard: ", gameData.player2.graveyard.length);
      }

      player1Hand = gameData.player1.hand || [];
      player2Hand = gameData.player2.hand || [];
      player1Field = gameData.board.player1Field || [];
      player2Field = gameData.board.player2Field || [];
      player1 = gameData.board.player1;
      player2 = gameData.board.player2;
      currentPlayerId = gameData.board.currentPlayerId;

      console.log("player 1: ", player1.id);
      console.log("player 2: ", player2.id);
      console.log("current player: ", currentPlayerId);
    }
  }

  async function StartGame() {
    try {
      const result = await fetchStartGame();
      console.log("Game started:", result);

      gameData = await fetchMatchData();
      currentPlayerId = gameData.board.currentPlayerId; 
      console.log("Starting turn for Player", currentPlayerId);

      gameData = await fetchMatchData();
      console.log("Turn started for Player", currentPlayerId);
      
    } catch (error) {
      errorMessage = `Failed to start game: ${error.message}`;
      console.error(error);
    }
  }

  onMount(async () => {
    try {
      gameData = await fetchMatchData();
    } catch (error) {
      errorMessage = error.message;
    }
  });

  async function drawCard(playerId) {
    try {
      if ($turnInProgress) return;

      gameData = await fetchMatchData();

       // Check if the player's deck has cards left
      const playerDeck = playerId === 1 ? gameData.player1.matchDeck.cards : gameData.player2.matchDeck.cards;
    
      if (playerDeck.length === 0) {
      errorMessage = `No cards left in Player ${playerId}'s deck to draw.`;
      return; // Return early as there are no cards left
      }


      await fetchStartTurn(playerId);
      turnInProgress.set(true);

      gameData = await fetchMatchData();

      errorMessage = "";
    } catch (error) {
      errorMessage = `Failed to draw card for player ${playerId}: ${error.message}`;
    }
  }

  async function playCard(playerId, cardId) {
    try {
      const result =
        playerId == 1
          ? await fetchPlayCardP1(cardId)
          : await fetchPlayCardP2(cardId);
      console.log("Card played for Player:", result);
      gameData = await fetchMatchData();
    } catch (error) {
      errorMessage = `Failed to play card for Player: ${error.message}`;
    }
  }

  async function selectAttack(playerId, cardId) {
    if (selectedAttackCardId === null) {
      selectedAttackCardId = cardId;
      highlightedCards =
        playerId === 1
          ? player2Field.map((card) => card.id)
          : player1Field.map((card) => card.id);
    } else {
      selectedDefendCardId = cardId;

      await attackCard(
        selectedAttackCardId,
        selectedDefendCardId,
        currentPlayerId
      );

      selectedAttackCardId = null;
      selectedDefendCardId = null;
      highlightedCards = [];
    }
  }

  async function attackCard(attackCardId, defenseCardId, playerId) {
    try {
      console.log(
        "Attack card:",
        attackCardId,
        "Defense card:",
        defenseCardId,
        "Player ID:",
        playerId
      );
      const result = await fetchAttackCard(
        attackCardId,
        defenseCardId,
        playerId
      );
      console.log("Attack result:", result);

      gameData = await fetchMatchData();
    } catch (error) {
      console.error("Error during attack:", error);
    }
  }

  async function attackPlayer(cardId, playerId) {
    try {
      const result =
        playerId === 1
          ? await fetchAttackPlayer1(cardId)
          : await fetchAttackPlayer2(cardId);

      console.log(`Player ${playerId} attacked with card ${cardId}:`, result);

      gameData = await fetchMatchData();

      if (gameData.player1.health <= 0 || gameData.player2.health <= 0) {
        const winner =
          gameData.player1.health > 0
            ? gameData.player1.name
            : gameData.player2.name;

        gameData.status = "GameOver";
        gameData.winner = winner;

        console.log(`Game Over! Winner is ${winner}`);
      }
    } catch (error) {
      console.error("Error during player attack:", error);
    }
  }

  async function endTurn() {
    try {
      if (!gameData || currentPlayerId === null) {
        throw new Error("No player has started yet.");
      }

      console.log("Ending turn for Player:", currentPlayerId);
      await fetchEndTurn(currentPlayerId);
      turnInProgress.set(false);
      gameData = await fetchMatchData();

      currentPlayerId = currentPlayerId === player1Id ? player2Id : player1Id;

      await drawCard(currentPlayerId);
    } catch (error) {
      errorMessage = `Failed to end turn for Player ${currentPlayerId}: ${error.message}`;
    }
  }
</script>

<div class="container">
  <header class="header">
    <button onclick={StartGame} type="button" class="btn">Start Game</button>
    {#if gameData}
      <h3>
        Turn: {gameData.board.turns}
        <span>
          Current Turn: Player {gameData.board.currentPlayerId}
          <button onclick={endTurn} class="btn">
            End turn for player: {gameData.board.currentPlayerId}
          </button>
        </span>
      </h3>
    {/if}
    {#if errorMessage}
      <div class="error">{errorMessage}</div>
      {/if}
  </header>

  <div class="content">
    {#if gameData}
      {#if gameData.status === "GameOver"}
        <div>
          <h1>Game Over</h1>
          <p>Winner: {gameData.winner}</p>
          <button onclick={onRestart}>Restart Game</button>
        </div>
      {:else}
        <aside class="sidebar left">
          <div class="players">
            <div class="player-info" id="p1">
              <h2>{player1.name}</h2>
              <h2>Cards: {player1.matchDeck.cards.length}</h2>
              <h2>HP: {player1.health}</h2>
              <h2>Graveyard: {player1.graveyard.length}</h2>
            </div>
          </div>
        </aside>

        <main class="main">
          <div class="row">
            <!-- Player 1 Hand -->
            <div class="card-hand" id="p1">
              {#each player1Hand as card, index}
                <div onclick={() => playCard(1, card.id)}>
                  <div class="card">
                    {#if card}
                      <div class="card-content">
                        <div class="card-name">{card.name}</div>
                        <div class="card-stats">
                          Health: {card.health}<br />
                          Attack: {card.attack}
                        </div>
                      </div>
                    {:else}
                      <div class="card-name">P1 Hand {index + 1}</div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
            <h4 class="center-text">Player 1 hand</h4>
          </div>
          <div class="row">
            <!-- Player 1 Field -->
            <div class="card-field" id="p1">
              {#each player1Field as card, index}
                <div
                  class:selected={highlightedCards === card.id}
                  class:highlight={highlightedCards.includes(card.id)}
                  onclick={() => selectAttack(player1.id, card.id)}
                >
                  <div class="card">
                    {#if card}
                      <div class="card-content">
                        <div class="card-name">{card.name}</div>
                        <div class="action-buttons">
                          <button
                            class="deck-button"
                            onclick={() => attackPlayer(card.id, player1.id)}>Attack Player
                          </button>
                        </div>
                        <div class="card-stats">
                          Health: {card.health}<br />
                          Attack: {card.attack}
                        </div>
                      </div>
                    {:else}
                      <div class="card-name">P1 Field {index + 1}</div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
            <h4 class="center-text">Player 1 field</h4>
          </div>
          <div class="row">
            <!-- Player 2 Field -->
            <div class="card-field" id="p2">
              {#each player2Field as card, index}
                <div
                  class:selected={highlightedCards === card.id}
                  class:highlight={highlightedCards.includes(card.id)}
                  onclick={() => selectAttack(player2.id, card.id)}
                >
                  <div class="card">
                    {#if card}
                      <div class="card-content">
                        <div class="card-name">{card.name}</div>
                        <div class="action-buttons">
                          <button
                            class="deck-button"
                            onclick={() => attackPlayer(card.id, player2.id)}>Attack Player
                          </button>
                        </div>
                        <div class="card-stats">
                          Health: {card.health}<br />
                          Attack: {card.attack}
                        </div>      
                      </div>
                    {:else}
                      <div class="card-name">P2 Field {index + 1}</div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
            <h4 class="center-text">Player 2 field</h4>
          </div>
          <div class="row">
            <!-- Player 2 Hand -->
            <div class="card-hand" id="p2">
              {#each player2Hand as card, index}
                <div onclick={() => playCard(2, card.id)}>
                  <div class="card">
                    {#if card}
                      <div class="card-content">
                        <div class="card-name">{card.name}</div>
                        <div class="card-stats">
                          Health: {card.health}<br />
                          Attack: {card.attack}
                        </div>
                      </div>
                    {:else}
                      <div class="card-name">P2 Hand {index + 1}</div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
            <h4 class="center-text">Player 2 hand</h4>
          </div>
        </main>

        <aside class="sidebar right">
          <!-- Player 2 Info and Deck -->
          <div class="players">
            <div class="player-info" id="p2">
              <h2>{player2.name}</h2>
              <h2>Cards: {player2.matchDeck.cards.length}</h2>
              <h2>HP: {player2.health}</h2>
              <h2>Graveyard: {player2.graveyard.length}</h2>
            </div>
          </div>
        </aside>
      {/if}
    {:else}
      <p style="text-align: center;">Loading game data...</p>
    {/if}
  </div>
</div>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(html, body) {
    margin: 0;
    padding: 0;
    font-family: "Arial", sans-serif;
  }

  .container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    background-color: rgb(138, 138, 138);
    color: white;
    text-align: center;
    padding: 1rem;
    flex: 0 0 auto;
    border-bottom: 2px solid black;
  }

  .content {
    display: flex;
    flex: 1;
  }

  .sidebar {
    background-color: #ddd;
    padding: 1rem;
    flex: 0 0 200px;
  }

  .left {
    border-right: 2px solid #926464;
  }

  .right {
    display: flex;
    border-left: 2px solid #926464;
    align-items: flex-end;
  }

  .main {
    flex: 1;
    background-color: #e0e0e0;
    display: flex;
    flex-direction: column;
  }

  .row {
    background-color: #e0e0e0;
    padding: 1rem;
    border: 1px solid #ccc;
    text-align: center;
    justify-content: center;
    flex-direction: column;
    display: flex;
  }

  .center-text {
    text-align: center;
  }

  .error {
    color: red;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
    font-size: 1.2em;
  }

  .highlight {
    outline: 3px solid #f4e04d;
    background-color: rgba(244, 224, 77, 0.2);
    transition:
      outline 0.3s ease,
      background-color 0.3s ease;
  }

  .card-hand,
  .card-field {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 170px;
    flex-direction: row;
  }

  .card-hand {
    .card {
      margin-left: -8px;
      margin-right: -8px;
      z-index: 1;
    }
    font-weight: bold;
  }

  .card-field {
    .card {
      margin: 5px;
    }
  }

  :global(#p1) {
    .card {
      border: gold 2px solid;
    }
  }

  :global(#p2) {
    .card {
      border: #17a2b8 2px solid;
    }
  }

  .player-info#p1{
    border: gold 3px solid;
  }

  .player-info#p2{
    border: #17a2b8 3px solid;
  }

  .player-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #696969bb;
    padding: 8px;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
    width: 180px;
    text-align: center;
    overflow-y: auto;
    height: 170px;
  }

  .card {
    background: white;
    border: 2px solid #2d2d2d;
    border-radius: 10px;
    padding: 10px;
    width: 100px;
    height: 150px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    color: #2d2d2d;
    font-family: "Times New Roman", serif;
  }

  .card:hover {
    transform: scale(1.05);
    cursor: pointer;
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.6);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    height: 100%;
    padding: 5px;
  }

  .card-name {
    font-size: 1em;
    font-weight: bold;
    color: #333;
    
  }

  .card-stats {
    font-size: 0.9em;
    color: #333;
    margin-top: 5px;
    font-weight: bold;
  }

  .deck-button {
    background-color: #0dbd33;
    border: none;
    color: #2d2d2d;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s;
  }

  .deck-button:hover {
    background-color: #d4c300;
  }

  .action-buttons {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.3rem 0.8rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #fff;
    background-color: #007bff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      transform 0.2s ease;
  }

  .btn:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }

  .btn:active {
    background-color: #004085;
    transform: scale(0.98);
  }

  
</style>
