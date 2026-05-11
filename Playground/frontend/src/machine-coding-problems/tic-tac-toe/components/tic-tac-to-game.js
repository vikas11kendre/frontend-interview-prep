import React, { useMemo, useState } from "react";
import Stats from "./stats/stats";
import GameControls from './controls/control';
import styles from './game.module.css';
import Board from './board/board';
import { getGridList, getResultArray,getWinner ,isDraw} from "../ulility/index.js";
export default function TicTacToeGame({size}) {
    const [currentPlayer, setCurrentPlayer] = useState("X")
    const [gameStatus, setGameStatus] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [gridList, setGridList] = useState(getGridList(size));
    const resultArray=useMemo(()=>getResultArray(size),[size])
    const handleGridClick = (index) => {
        if (!isPlaying || gameStatus || gameStatus==="isDraw") return;
        const updatedGrid = gridList.map((cell,i) => {
            if (i === index) {
                return currentPlayer;
            }
            return cell;
        });
        const currentWinner = getWinner(resultArray,updatedGrid);
        
        setGridList(updatedGrid);

        if (currentWinner) {
            setGameStatus(currentWinner);
            return;
        }
        if (isDraw(updatedGrid)) {
                setGameStatus("isDraw");
                return;
            }
        setCurrentPlayer((prevPlayer) => (prevPlayer === "X" ? "O" : "X"));
    };

    const handleStartClick=()=>{
            setIsPlaying(true)
    };
    const handleReset=()=>{
         setIsPlaying(false);
            setGridList(getGridList(size));
            setGameStatus('');
            setCurrentPlayer("X");
    }
    return (<div className={styles.main_container}>
        <div className={styles.game_board}>
            <Stats currentPlayer={currentPlayer} isPlaying={isPlaying} gameStatus={gameStatus} />
            <Board handleGridClick={handleGridClick} gridList={gridList} size={size} isPlaying={isPlaying} />
            <GameControls handleReset={handleReset} handleStartClick={handleStartClick} isPlaying={isPlaying} />
        </div>
    </div>)

}

