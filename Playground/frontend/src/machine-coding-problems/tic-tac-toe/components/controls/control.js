import { useRef } from "react";
import styles from "./control.module.css";

export default function GameControls({ handleStartClick, handleReset, isPlaying }) {
    const startRef = useRef(null);

    const onReset = () => {
        handleReset();
        requestAnimationFrame(() => startRef.current?.focus());
    };

    return (
        <div className={styles.gameControls_container} role="group" aria-label="Game controls">
            <button
                ref={startRef}
                className={styles.control_button}
                disabled={isPlaying}
                onClick={handleStartClick}
                aria-label="Start game"
            >
                Start
            </button>
            <button
                className={styles.control_button}
                onClick={onReset}
                aria-label="Reset game"
            >
                Reset
            </button>
        </div>
    );
}
