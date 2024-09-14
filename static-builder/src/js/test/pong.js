import { Pong } from '@/js/features/pong/Pong'
import { Teact } from '@/js/libs/teact'

const element = Teact.createElement(Pong)
const container = document.getElementById('app')
Teact.render(element, container)
