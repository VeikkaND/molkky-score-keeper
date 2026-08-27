import { FormEvent, useMemo, useState } from 'react'
import { ArrowLeft, Plus, RotateCcw, Trophy, Undo2, X } from 'lucide-react'

type Player = {
  id: string
  name: string
}

type Turn = {
  playerIndex: number
  points: number
  previousTotal: number
  round: number
}

const pointOptions = Array.from({ length: 13 }, (_, index) => index)

function App() {
  const [stage, setStage] = useState<'setup' | 'game'>('setup')
  const [players, setPlayers] = useState<Player[]>([])
  const [playerName, setPlayerName] = useState('')
  const [scores, setScores] = useState<number[]>([])
  const [activePlayer, setActivePlayer] = useState(0)
  const [round, setRound] = useState(1)
  const [turns, setTurns] = useState<Turn[]>([])
  const [winner, setWinner] = useState<string | null>(null)

  const rankedPlayers = useMemo(
    () =>
      players
        .map((player, index) => ({ ...player, score: scores[index] ?? 0, originalIndex: index }))
        .sort((a, b) => b.score - a.score),
    [players, scores],
  )

  const currentPlayer = players[activePlayer]
  const canStart = players.length >= 2

  const addPlayer = (event?: FormEvent) => {
    event?.preventDefault()
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

  const renderSetup = () => (
    <main className="setup-shell">
      <section className="setup-panel" aria-labelledby="setup-title">
        <div className="brand-lockup">
          <span className="pin-mark" aria-hidden="true">
            12
          </span>
          <div>
            <p className="eyebrow">Molkky night</p>
            <h1 id="setup-title">Build your lineup</h1>
          </div>
        </div>

        <form className="add-player-form" onSubmit={addPlayer}>
          <label htmlFor="player-name">Player name</label>
          <div className="input-row">
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="Ada, Mika, Sara..."
              autoComplete="off"
            />
            <button className="icon-button add-button" type="submit" aria-label="Add player">
              <Plus size={22} aria-hidden="true" />
            </button>
          </div>
        </form>

        <div className="players-section" aria-live="polite">
          <div className="section-heading">
            <span>Players</span>
            <span>{players.length}</span>
          </div>

          {players.length === 0 ? (
            <div className="empty-state">Add at least two players to begin.</div>
          ) : (
            <ul className="setup-player-list">
              {players.map((player, index) => (
                <li key={player.id}>
                  <span className="player-index">{index + 1}</span>
                  <span>{player.name}</span>
                  <button
                    type="button"
                    className="icon-button ghost-button"
                    onClick={() => removePlayer(player.id)}
                    aria-label={`Remove ${player.name}`}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="primary-action" type="button" onClick={startGame} disabled={!canStart}>
          Start scoring
        </button>
      </section>
    </main>
  )

  const renderGame = () => (
    <main className="game-shell">
      <header className="game-header">
        <button className="tool-button" type="button" onClick={editPlayers} aria-label="Edit players">
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Players</span>
        </button>
        <div className="round-pill">Round {round}</div>
        <button className="tool-button" type="button" onClick={resetGame} aria-label="Start a new game">
          <RotateCcw size={18} aria-hidden="true" />
          <span>New</span>
        </button>
      </header>

      <section className="turn-banner" aria-live="polite">
        <div>
          <p className="eyebrow">Now throwing</p>
          <h1>{winner ? `${winner} wins!` : currentPlayer?.name}</h1>
        </div>
        <div className="target-score">
          <span>Target</span>
          <strong>50</strong>
        </div>
      </section>

      {winner && (
        <section className="winner-strip" aria-label="Winner">
          <Trophy size={20} aria-hidden="true" />
          <span>{winner} hit exactly 50 points.</span>
        </section>
      )}

      <div className="game-grid">
        <section className="scoreboard" aria-label="Scoreboard">
          {rankedPlayers.map((player, index) => {
            const isActive = player.originalIndex === activePlayer && !winner
            const distance = 50 - player.score

            return (
              <article className={`player-card ${isActive ? 'active' : ''}`} key={player.id}>
                <div className="rank-badge">#{index + 1}</div>
                <div className="player-card-name">
                  <span>{player.name}</span>
                  {isActive && <small>turn</small>}
                </div>
                <div className="score-value">{player.score}</div>
                <div className="distance-line">
                  {player.score === 50 ? 'winner' : `${distance} to go`}
                </div>
              </article>
            )
          })}
        </section>

        <section className="scoring-panel" aria-label="Add score">
          <div className="panel-topline">
            <span>Add throw score</span>
            <button
              className="icon-button ghost-button"
              type="button"
              onClick={undoTurn}
              disabled={turns.length === 0}
              aria-label="Undo last score"
              title="Undo last score"
            >
              <Undo2 size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="score-pad">
            {pointOptions.map((points) => (
              <button type="button" key={points} onClick={() => recordScore(points)} disabled={Boolean(winner)}>
                <span>{points}</span>
              </button>
            ))}
          </div>

          <div className="rule-note">
            Passing 50 drops a player back to 25. First exact 50 wins.
          </div>

          <div className="history-panel">
            <div className="section-heading">
              <span>Recent throws</span>
              <span>{turns.length}</span>
            </div>
            {turns.length === 0 ? (
              <div className="empty-state compact">Scores will appear here.</div>
            ) : (
              <ol className="turn-history">
                {turns
                  .slice(-5)
                  .reverse()
                  .map((turn, index) => {
                    const total = turn.previousTotal + turn.points
                    const displayTotal = total > 50 ? 25 : total
                    const player = players[turn.playerIndex]

                    return (
                      <li key={`${turn.round}-${turn.playerIndex}-${turns.length - index}`}>
                        <span>{player?.name}</span>
                        <strong>+{turn.points}</strong>
                        <small>{displayTotal} total</small>
                      </li>
                    )
                  })}
              </ol>
            )}
          </div>
        </section>
      </div>
    </main>
  )

  return stage === 'setup' ? renderSetup() : renderGame()
}

export default App
