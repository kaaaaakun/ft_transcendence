import { Pong } from '@/js/features/pong/Pong'

export function testPong() {
  const data = {
    players: [
      {
        player: {
          name: 'Alice',
        },
        match_details: {
          player_id: 1,
          match_id: 1,
          score: 0,
        },
      },
      {
        player: {
          name: 'Bob',
        },
        match_details: {
          player_id: 2,
          match_id: 1,
          score: 0,
        },
      },
    ],
    end_match: false,
  }
  return Pong({ data })
}
