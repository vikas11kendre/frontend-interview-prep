import { useEffect, useRef, useState } from 'react';
import styles from './board.module.css';

export default function Board({ handleGridClick, gridList, size, isPlaying }) {
    const [focusedIndex, setFocusedIndex] = useState(0);
    const cellRefs = useRef([]);
    const prevIsPlaying = useRef(isPlaying);

    useEffect(() => {
        if (!prevIsPlaying.current && isPlaying) {
            const center = Math.floor((size * size) / 2);
            setFocusedIndex(center);
            cellRefs.current[center]?.focus();
        }
        prevIsPlaying.current = isPlaying;
    }, [isPlaying, size]);

    const moveFocus = (newIndex) => {
        setFocusedIndex(newIndex);
        cellRefs.current[newIndex]?.focus();
    };

    const handleKeyDown = (e, index) => {
        const row = Math.floor(index / size);
        const col = index % size;
        let newRow = row;
        let newCol = col;

        switch (e.key) {
            case 'ArrowUp':    newRow = (row - 1 + size) % size; break;
            case 'ArrowDown':  newRow = (row + 1) % size; break;
            case 'ArrowLeft':  newCol = (col - 1 + size) % size; break;
            case 'ArrowRight': newCol = (col + 1) % size; break;
            case 'Home':       newCol = 0; break;
            case 'End':        newCol = size - 1; break;
            case 'PageUp':     newRow = 0; break;
            case 'PageDown':   newRow = size - 1; break;
            default: return;
        }
        e.preventDefault();
        moveFocus(newRow * size + newCol);
    };

    return (
        <div
            role="grid"
            aria-label={`Tic Tac Toe ${size} by ${size} board`}
            className={styles.board_grid}
            style={{ "--size": size }}
        >
            {Array.from({ length: size }).map((_, rowIdx) => (
                <div role="row" key={rowIdx} className={styles.board_row}>
                    {Array.from({ length: size }).map((_, colIdx) => {
                        const index = rowIdx * size + colIdx;
                        const cell = gridList[index];
                        const filled = cell !== '';
                        return (
                            <button
                                key={index}
                                ref={(el) => { cellRefs.current[index] = el; }}
                                role="gridcell"
                                aria-label={`Row ${rowIdx + 1}, Column ${colIdx + 1}, ${filled ? cell : 'empty'}`}
                                aria-disabled={filled || !isPlaying}
                                tabIndex={focusedIndex === index ? 0 : -1}
                                onClick={() => { if (!filled && isPlaying) handleGridClick(index); }}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onFocus={() => setFocusedIndex(index)}
                                className={styles.grid_item}
                            >
                                <span aria-hidden="true">{cell}</span>
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
