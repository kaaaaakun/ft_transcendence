import { Pong } from '@/js/features/pong/Pong'
import { Teact } from '@/js/libs/teact'

export function testPong(){
  const data ={
    "match_id": 1,
    "players": [
      {
        "player": {
          "name": "Alice"
        },
        "matchdetail": {
          "player_id": 1,
          "match_id": 1,
          "score": 0
        }
      },
      {
        "player": {
          "name": "Bob"
        },
        "matchdetail": {
          "player_id": 2,
          "match_id": 1,
          "score": 0
        }
      }
    ]
  }
  return (Pong({data}))
}
