import { Pong } from '@/js/features/pong/Pong'

export function testPong() {
  const data = {
    left: {
      player_name: 'Alice',
    },
    right: {
      player_name: 'Bob',
    },
  }
  return Pong({ data })
}
