import { Teact } from '@/js/libs/teact'
import { InputAlias } from '@/js/pages/InputAlias'

export function testInputAlias() {
  const num = [2, 4, 8]
  const randomNum = num[Math.floor(Math.random() * num.length)]
  return InputAlias(randomNum)
}
