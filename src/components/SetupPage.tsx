import { DragEvent, FormEvent, useState } from 'react'
import { ArrowDown, ArrowUp, GripVertical, Plus, X } from 'lucide-react'
import type { Player } from '../types'

type SetupPageProps = {
  players: Player[]
  playerName: string
  canStart: boolean
  onPlayerNameChange: (name: string) => void
  onAddPlayer: () => void
  onRemovePlayer: (id: string) => void
  onReorderPlayers: (fromIndex: number, toIndex: number) => void
  onStartGame: () => void
}

function SetupPage({
  players,
  playerName,
  canStart,
  onPlayerNameChange,
  onAddPlayer,
  onRemovePlayer,
  onReorderPlayers,
  onStartGame,
}: SetupPageProps) {
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null)
  const [dragOverPlayerId, setDragOverPlayerId] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onAddPlayer()
  }

  const handleDragStart = (event: DragEvent<HTMLLIElement>, playerId: string) => {
    setDraggedPlayerId(playerId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', playerId)
  }

  const handleDragOver = (event: DragEvent<HTMLLIElement>, playerId: string) => {
    event.preventDefault()
    setDragOverPlayerId(playerId)
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (event: DragEvent<HTMLLIElement>, targetIndex: number) => {
    event.preventDefault()

    const playerId = event.dataTransfer.getData('text/plain') || draggedPlayerId
    const fromIndex = players.findIndex((player) => player.id === playerId)

    if (fromIndex !== -1) {
      onReorderPlayers(fromIndex, targetIndex)
    }

    setDraggedPlayerId(null)
    setDragOverPlayerId(null)
  }

  const resetDragState = () => {
    setDraggedPlayerId(null)
    setDragOverPlayerId(null)
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
                <li
                  className={`${draggedPlayerId === player.id ? 'is-dragging' : ''} ${
                    dragOverPlayerId === player.id && draggedPlayerId !== player.id ? 'is-drag-over' : ''
                  }`}
                  key={player.id}
                  draggable
                  onDragStart={(event) => handleDragStart(event, player.id)}
                  onDragOver={(event) => handleDragOver(event, player.id)}
                  onDragLeave={() => setDragOverPlayerId(null)}
                  onDrop={(event) => handleDrop(event, index)}
                  onDragEnd={resetDragState}
                >
                  <span className="drag-handle" aria-hidden="true">
                    <GripVertical size={18} />
                  </span>
                  <span className="player-index">{index + 1}</span>
                  <span className="setup-player-name">{player.name}</span>
                  <div className="order-actions" aria-label={`Change ${player.name} order`}>
                    <button
                      type="button"
                      className="icon-button ghost-button"
                      onClick={() => onReorderPlayers(index, index - 1)}
                      disabled={index === 0}
                      aria-label={`Move ${player.name} up`}
                    >
                      <ArrowUp size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="icon-button ghost-button"
                      onClick={() => onReorderPlayers(index, index + 1)}
                      disabled={index === players.length - 1}
                      aria-label={`Move ${player.name} down`}
                    >
                      <ArrowDown size={16} aria-hidden="true" />
                    </button>
                  </div>
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
