import { Teact } from '@/js/teact';
import { Pong } from '@/js/features/pong/Pong';

const element = Teact.createElement(Pong);
const container = document.getElementById('app');
Teact.render(element, container);
