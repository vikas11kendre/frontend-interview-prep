import React from "react";
import styles from "./stats.module.css";

function Stats({ currentPlayer, isPlaying, gameStatus }) {
    const isDraw = gameStatus === "isDraw";
    const hasWinner = !!gameStatus && !isDraw;
    const gameEnded = hasWinner || isDraw;

    let message;
    if (hasWinner) message = `Winner is ${gameStatus}`;
    else if (isDraw) message = "Game is a draw";
    else if (isPlaying) message = `${currentPlayer}'s turn`;
    else message = "Press the Start button to begin the game";

    return (
        <div className={styles.stat_container}>
            <h1>Tic Tac Toe Game</h1>
            <p
                role={gameEnded ? "alert" : "status"}
                aria-live={gameEnded ? "assertive" : "polite"}
                aria-atomic="true"
            >
                {message}
            </p>
            <p className={styles.sr_only}>
                Use arrow keys to navigate cells. Press Enter or Space to place your mark.
            </p>
        </div>
    );
}

export default React.memo(Stats);
