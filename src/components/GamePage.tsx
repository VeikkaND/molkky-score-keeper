import { useMemo } from 'react'
import { ArrowLeft, RotateCcw, Trophy, Undo2 } from 'lucide-react'
import type { Player, Turn } from '../types'

type GamePageProps = {
  players: Player[]
  scores: number[]
  activePlayer: number
  round: number
  turns: Turn[]
  winner: string | null
  currentPlayer?: Player
  onEditPlayers: () => void
  onResetGame: () => void
  onRecordScore: (points: number) => void
  onUndoTurn: () => void
}

const pointOptions = Array.from({ length: 13 }, (_, index) => index)

function GamePage({
  players,
  scores,
  activePlayer,
  round,
  turns,
  winner,
  currentPlayer,
  onEditPlayers,
  onResetGame,
  onRecordScore,
  onUndoTurn,
}: GamePageProps) {
  const rankedPlayers = useMemo(
    () =>
      players
        .map((player, index) => ({ ...player, score: scores[index] ?? 0, originalIndex: index }))
        .sort((a, b) => b.score - a.score),
    [players, scores],
  )

  return (
    <main className="game-shell">
      <header className="game-header">
        <button className="tool-button" type="button" onClick={onEditPlayers} aria-label="Edit players">
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Players</span>
        </button>
        <div className="round-pill">Round {round}</div>
        <button className="tool-button" type="button" onClick={onResetGame} aria-label="Start a new game">
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
              onClick={onUndoTurn}
              disabled={turns.length === 0}
              aria-label="Undo last score"
              title="Undo last score"
            >
              <Undo2 size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="score-pad">
            {pointOptions.map((points) => (
              <button type="button" key={points} onClick={() => onRecordScore(points)} disabled={Boolean(winner)}>
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
}

export default GamePage
