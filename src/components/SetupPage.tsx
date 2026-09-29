import { FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import type { Player } from '../types'

type SetupPageProps = {
  players: Player[]
  playerName: string
  canStart: boolean
  onPlayerNameChange: (name: string) => void
  onAddPlayer: () => void
  onRemovePlayer: (id: string) => void
  onStartGame: () => void
}

function SetupPage({
  players,
  playerName,
  canStart,
  onPlayerNameChange,
  onAddPlayer,
  onRemovePlayer,
  onStartGame,
}: SetupPageProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onAddPlayer()
  }

  return (
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

        <form className="add-player-form" onSubmit={handleSubmit}>
          <label htmlFor="player-name">Player name</label>
          <div className="input-row">
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(event) => onPlayerNameChange(event.target.value)}
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
                    onClick={() => onRemovePlayer(player.id)}
                    aria-label={`Remove ${player.name}`}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="primary-action" type="button" onClick={onStartGame} disabled={!canStart}>
          Start scoring
        </button>
      </section>
    </main>
  )
}

export default SetupPage
