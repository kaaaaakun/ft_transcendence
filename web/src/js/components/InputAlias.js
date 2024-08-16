import '@/scss/styles.scss';
import { BaseLayout } from '@/js/layouts/BaseLayout';
import { Teact } from '@/js/teact';

function App() {
  const [state, setState] = Teact.useState(3); //TODO: ボタンが押された時に変更できるように

  const handleGenerateInputs = (num) => {
    setState(num);
    console.log('State updated to:', num);
  };

  return BaseLayout(
    Teact.createElement(
      'div',
      { className: 'container' },
      Teact.createElement(
        'div',
       { className: 'd-flex justify-content-center' },
        Teact.createElement(
          'button',
          {
            className: 'btn btn-primary btn-lg bg-darkblue',
            onClick: () => handleGenerateInputs(2),
          },
          '2 Players'
        ),
        Teact.createElement(
          'button',
          {
            className: 'btn btn-primary btn-lg bg-darkblue',
            onClick: () => handleGenerateInputs(4),
          },
          '4 Players'
        ),
        Teact.createElement(
          'button',
          {
            className: 'btn btn-primary btn-lg bg-darkblue',
            onClick: () => handleGenerateInputs(8),
          },
          '8 Players'
        )
      ),
      Teact.createElement(
        'div',
        { id: 'inputContainer', className: 'mt-4' },
        ...Array.from({ length: state }, (_, i) => {
          console.log(`Creating input ${i + 1}`);
          return Teact.createElement(
            'div',
            { className: 'd-grid gap-2 col-3 mx-auto', key: i },
            Teact.createElement(
              'input',
              {
                type: 'text',
                className: 'form-control mt-2',
                placeholder: `Player ${i + 1}`
              }
            )
          );
        })
      )
    )
  );
}

const container = document.getElementById('app');
Teact.render(Teact.createElement(App), container);
