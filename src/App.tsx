import { useState } from 'react'
import GamePage from './components/GamePage'
import SetupPage from './components/SetupPage'
import type { Player, Turn } from './types'

function App() {
  const [stage, setStage] = useState<'setup' | 'game'>('setup')
  const [players, setPlayers] = useState<Player[]>([])
  const [playerName, setPlayerName] = useState('')
  const [scores, setScores] = useState<number[]>([])
  const [activePlayer, setActivePlayer] = useState(0)
  const [round, setRound] = useState(1)
  const [turns, setTurns] = useState<Turn[]>([])
  const [winner, setWinner] = useState<string | null>(null)

  const currentPlayer = players[activePlayer]
  const canStart = players.length >= 2

  const addPlayer = () => {
    const name = playerName.trim()

    if (!name || players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
      return
    }

    setPlayers((currentPlayers) => [...currentPlayers, { id: crypto.randomUUID(), name }])
    setPlayerName('')
  }

  const removePlayer = (id: string) => {
    setPlayers((currentPlayers) => currentPlayers.filter((player) => player.id !== id))
  }

  const reorderPlayers = (fromIndex: number, toIndex: number) => {
    setPlayers((currentPlayers) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= currentPlayers.length ||
        toIndex >= currentPlayers.length
      ) {
        return currentPlayers
      }

      const nextPlayers = [...currentPlayers]
      const [movedPlayer] = nextPlayers.splice(fromIndex, 1)
      nextPlayers.splice(toIndex, 0, movedPlayer)
      return nextPlayers
    })
  }

  const startGame = () => {
    if (!canStart) {
      return
    }

    setScores(players.map(() => 0))
    setActivePlayer(0)
    setRound(1)
    setTurns([])
    setWinner(null)
    setStage('game')
  }

  const resetGame = () => {
    setStage('setup')
    setPlayers([])
    setPlayerName('')
    setScores([])
    setActivePlayer(0)
    setRound(1)
    setTurns([])
    setWinner(null)
  }

  const recordScore = (points: number) => {
    if (!currentPlayer || winner) {
      return
    }

    const previousTotal = scores[activePlayer] ?? 0
    const attemptedTotal = previousTotal + points
    const nextTotal = attemptedTotal > 50 ? 25 : attemptedTotal
    const nextScores = scores.map((score, index) => (index === activePlayer ? nextTotal : score))
    const nextPlayer = (activePlayer + 1) % players.length

    setScores(nextScores)
    setTurns((currentTurns) => [
      ...currentTurns,
      { playerIndex: activePlayer, points, previousTotal, round },
    ])

    if (nextTotal === 50) {
      setWinner(currentPlayer.name)
      return
    }

    setActivePlayer(nextPlayer)
    if (nextPlayer === 0) {
      setRound((currentRound) => currentRound + 1)
    }
  }

  const undoTurn = () => {
    const lastTurn = turns.at(-1)

    if (!lastTurn) {
      return
    }

    setScores((currentScores) =>
      currentScores.map((score, index) =>
        index === lastTurn.playerIndex ? lastTurn.previousTotal : score,
      ),
    )
    setActivePlayer(lastTurn.playerIndex)
    setRound(lastTurn.round)
    setWinner(null)
    setTurns((currentTurns) => currentTurns.slice(0, -1))
  }

  const editPlayers = () => {
    setStage('setup')
    setScores([])
    setTurns([])
    setWinner(null)
  }

  if (stage === 'setup') {
    return (
      <SetupPage
        players={players}
        playerName={playerName}
        canStart={canStart}
        onPlayerNameChange={setPlayerName}
        onAddPlayer={addPlayer}
        onRemovePlayer={removePlayer}
        onReorderPlayers={reorderPlayers}
        onStartGame={startGame}
      />
    )
  }

  return (
    <GamePage
      players={players}
      scores={scores}
      activePlayer={activePlayer}
      round={round}
      turns={turns}
      winner={winner}
      currentPlayer={currentPlayer}
      onEditPlayers={editPlayers}
      onResetGame={resetGame}
      onRecordScore={recordScore}
      onUndoTurn={undoTurn}
    />
  )
}

export default App
