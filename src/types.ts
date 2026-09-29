export type Player = {
  id: string
  name: string
}

export type Turn = {
  playerIndex: number
  points: number
  previousTotal: number
  round: number
  previousEliminatedPlayerIds: string[]
  previousWinner: string | null
}
