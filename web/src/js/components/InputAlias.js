import '@/scss/styles.scss';
import { BaseLayout } from '@/js/layouts/BaseLayout';
import { Teact } from '@/js/teact';
import DefaultButton from '@/js/components/ui/button';

function handleSubmit(event) {
  event.preventDefault(); // フォームのデフォルトの送信を防ぐ（ページリロード防止）

  const formData = new FormData(event.target);

  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  console.log('Form Data:', data);
}


function App() {
  const [numberOfPlayers, setNumberOfPlayers] = Teact.useState(2)

  return BaseLayout(
    Teact.createElement(
      'div',
      { className: 'container' },
      Teact.createElement(
        'div',
        { className: 'd-flex justify-content-center' },
        DefaultButton({ text: '2 Players', onClick: () => setNumberOfPlayers(c => 2) }),
        DefaultButton({ text: '4 Players', onClick: () => setNumberOfPlayers(c => 4) }),
        DefaultButton({ text: '8 Players', onClick: () => setNumberOfPlayers(c => 8) }),
      ),
      Teact.createElement(
        'form',
        {
          onSubmit: handleSubmit,
          className: 'text-center mt-3 d-grid gap-2 col-3 mx-auto',
        },
        ...Array.from({ length: 4 }, (_, i) => {
          const className = i >= numberOfPlayers / 2 ?
            'form-control mt-2 bg-secondary' :
            'form-control mt-2';
          return Teact.createElement(
            'div',
            { className: 'row form-group', key: i },
            Teact.createElement(
              'div',
              { className: 'col-6' },
              Teact.createElement(
                'input',
                {
                  type: 'text',
                  className: className,
                  placeholder: `Player ${i * 2 + 1}`,
                  name: `player${i * 2}`,
                  disabled: i >= numberOfPlayers / 2,
                }
              )
            ),
            Teact.createElement(
              'div',
              { className: 'col-6' },
              Teact.createElement(
                'input',
                {
                  type: 'text',
                  className: className,
                  placeholder: `Player ${i * 2 + 2}`,
                  name: `player${i * 2 + 1}`,
                  disabled: i >= numberOfPlayers / 2,
                }
              )
            )
          );
        }),
        DefaultButton({ type: 'submit', text: 'submit'}),
      )
    )
  );
}

const container = document.getElementById('app');
Teact.render(Teact.createElement(App), container);