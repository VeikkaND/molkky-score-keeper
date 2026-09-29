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
  const [eliminatedPlayerIds, setEliminatedPlayerIds] = useState<string[]>([])
  const [threeMissesEliminates, setThreeMissesEliminates] = useState(true)

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

  const getNextActivePlayer = (fromIndex: number, eliminatedIds: string[]) => {
    for (let offset = 1; offset <= players.length; offset += 1) {
      const nextIndex = (fromIndex + offset) % players.length

      if (!eliminatedIds.includes(players[nextIndex].id)) {
        return nextIndex
      }
    }

    return fromIndex
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
    setEliminatedPlayerIds([])
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
    setEliminatedPlayerIds([])
    setThreeMissesEliminates(true)
  }

  const recordScore = (points: number) => {
    if (!currentPlayer || winner || eliminatedPlayerIds.includes(currentPlayer.id)) {
      return
    }

    const previousTotal = scores[activePlayer] ?? 0
    const attemptedTotal = previousTotal + points
    const nextTotal = attemptedTotal > 50 ? 25 : attemptedTotal
    const nextScores = scores.map((score, index) => (index === activePlayer ? nextTotal : score))
    const lastTwoPlayerThrows = turns
      .filter((turn) => turn.playerIndex === activePlayer)
      .slice(-2)
      .map((turn) => turn.points)
    const isThirdMiss =
      threeMissesEliminates &&
      points === 0 &&
      lastTwoPlayerThrows.length === 2 &&
      lastTwoPlayerThrows.every((throwScore) => throwScore === 0)
    const nextEliminatedPlayerIds =
      isThirdMiss && !eliminatedPlayerIds.includes(currentPlayer.id)
        ? [...eliminatedPlayerIds, currentPlayer.id]
        : eliminatedPlayerIds
    const remainingPlayers = players.filter((player) => !nextEliminatedPlayerIds.includes(player.id))

    setScores(nextScores)
    setEliminatedPlayerIds(nextEliminatedPlayerIds)
    setTurns((currentTurns) => [
      ...currentTurns,
      {
        playerIndex: activePlayer,
        points,
        previousTotal,
        round,
        previousEliminatedPlayerIds: eliminatedPlayerIds,
        previousWinner: winner,
      },
    ])

    if (nextTotal === 50) {
      setWinner(currentPlayer.name)
      return
    }

    if (isThirdMiss && remainingPlayers.length === 1) {
      setWinner(remainingPlayers[0].name)
      return
    }

    const nextPlayer = getNextActivePlayer(activePlayer, nextEliminatedPlayerIds)

    setActivePlayer(nextPlayer)
    if (nextPlayer <= activePlayer) {
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
    setEliminatedPlayerIds(lastTurn.previousEliminatedPlayerIds)
    setWinner(lastTurn.previousWinner)
    setTurns((currentTurns) => currentTurns.slice(0, -1))
  }

  const editPlayers = () => {
    setStage('setup')
    setScores([])
    setTurns([])
    setWinner(null)
    setEliminatedPlayerIds([])
  }

  const updateThreeMissesSetting = (enabled: boolean) => {
    setThreeMissesEliminates(enabled)

    if (!enabled) {
      setEliminatedPlayerIds([])
    }
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
      eliminatedPlayerIds={eliminatedPlayerIds}
      threeMissesEliminates={threeMissesEliminates}
      currentPlayer={currentPlayer}
      onEditPlayers={editPlayers}
      onResetGame={resetGame}
      onRecordScore={recordScore}
      onUndoTurn={undoTurn}
      onThreeMissesEliminatesChange={updateThreeMissesSetting}
    />
  )
}

export default App
