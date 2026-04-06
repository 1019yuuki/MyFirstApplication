import { useEffect, useState } from 'react';
import { Board, initBoard } from '../Components/Board/Board'
import type { StoneType } from '../Components/Stone/Stone';
import { ModalOverlay } from '../Components/ModalOverlay/ModalOverlay'
import { Link } from 'react-router-dom';
import { PrimaryButton } from '../Components/Button/PrimaryButton';

export const CpuBattlePage = () => {

    const [nextStone, setNextStone] = useState<StoneType>("BLACK");
    const [board, setBoard] = useState<StoneType[][]>(initBoard);
    const [gameId, setGameId] = useState<string>("");
    const [errMsg, setErrMsg] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [myStone, setMyStone] = useState<StoneType>("NONE");

    useEffect(() => {

        const createGame = async () => {
            try {
                const response = await fetch("/api/games/new_game", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                const data = await response.json();

                setBoard(data.board);
                setGameId(data.gameId);
            } catch (error) {
                console.error("通信エラー:", error);
            } finally {
            }
        }

        createGame();


    }, [])

    useEffect(() => {
        //盤面が更新された場合、CPUのターンであればCPUターンのAPIを実行する
        const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

        const execCpuTurn = async () => {

            try {
                setIsOpen(true);
                const [response] = await Promise.all([
                    fetch(`/api/games/${gameId}/cpu`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }),
                    sleep(2000),
                ])

                const data = await response.json();

                console.log(data);
                setBoard(data.board);
                setNextStone(data.nextStone);
            }
            finally {
                setIsOpen(false);
            }
        }

        if (myStone === "NONE") {
            // 自分の石を決定するまでは処理しない
            return;
        }

        // 白がコンピュータのターン
        if (nextStone === (myStone === "BLACK" ? "WHITE" : "BLACK")) {
            execCpuTurn();
        }
    }, [board, myStone])

    const handleClick = (row: number, col: number) => {


        const UpdateGame = async (row: number, col: number, nextStone: StoneType) => {
            try {
                setErrMsg("");

                if (nextStone === "NONE") return;

                const response = await fetch(`/api/games/${gameId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        x: col,
                        y: row,
                        stoneType: nextStone
                    })
                });

                if (response.status === 400) {
                    setErrMsg("そこに石を置くことはできません！")
                    return;
                }

                const data = await response.json();

                console.log(data);

                setBoard(data.board);
                setNextStone(data.nextStone);
            } catch (error) {
                console.error("通信エラー:", error);
            } finally {
            }
        }

        UpdateGame(row, col, nextStone);
    }

    return (
        <>
            <h1>CPU対局</h1>
            {
                nextStone === "NONE" &&
                (
                    <>
                        <p style={{ color: 'red' }}>勝敗が決定しました！<Link style={{padding:"10px"}} to={"/"}>Homeに戻る</Link><Link style={{padding:"10px"}} to={"/game/cpu"} reloadDocument>もう一度対戦する</Link></p>
                        <p style={{ color: 'red' }}>{`黒：${board.flat().filter(stone => stone === "BLACK").length}　白：${board.flat().filter(stone => stone === "WHITE").length}`}</p>
                    </>
                )
            }
            {nextStone !== "NONE" && <p>{`次は ${nextStone === "BLACK" ? `黒（${myStone === 'BLACK' ? "あなた" : "CPU"}）` : `白（${myStone === 'WHITE' ? "あなた" : "CPU"}）`} の番です`}</p>}
            {errMsg !== "" && <p style={{ color: 'red' }}>{errMsg}</p>}
            <Board board={board} handleClick={handleClick}></Board>
            <ModalOverlay isOpen={isOpen}>
                <div style={{ backgroundColor: "#DDD", padding: "20px", borderRadius: "15px" }}>
                    <span style={{ fontSize: "20px" }}>コンピュータが操作中です...</span>
                </div>
            </ModalOverlay>

            <ModalOverlay isOpen={myStone === "NONE"}>
                <div style={{ backgroundColor: "#EEE", padding: "100px", borderRadius: "10px" }}>
                    <h1 style={{ margin: "0px 0px 50px 0px"}}>石を選択してください</h1>
                    <hr />
                    <PrimaryButton onClick={() => setMyStone("BLACK")}>黒</PrimaryButton>
                    <PrimaryButton onClick={() => setMyStone("WHITE")}>白</PrimaryButton>
                </div>
            </ModalOverlay>

        </>
    )
}

