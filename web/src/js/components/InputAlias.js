import '@/scss/styles.scss';
import { BaseLayout } from '@/js/layouts/BaseLayout';
import { Teact } from '@/js/teact';

function handleSubmit(event) {
  event.preventDefault(); // フォームのデフォルトの送信を防ぐ（ページリロード防止）

  const formData = new FormData(event.target); // フォームのデータを取得

  // フォームのデータをオブジェクトとして取得する例
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  console.log('Form Data:', data);
  // ここで送信処理やバリデーションを行う
}


function App() {
  const [state, setState] = Teact.useState(2)

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
            onClick: () => setState(c => 2),
          },
          '2 Players'
        ),
        Teact.createElement(
          'button',
          {
            className: 'btn btn-primary btn-lg bg-darkblue',
            onClick: () => setState(c => 4),
          },
          '4 Players'
        ),
        Teact.createElement(
          'button',
          {
            className: 'btn btn-primary btn-lg bg-darkblue',
            onClick: () => setState(c => 8),
          },
          '8 Players'
        )
      ),
      Teact.createElement(
        'form',
        {
          onSubmit: handleSubmit, // フォームの送信時に呼ばれるハンドラ
          className: 'text-center mt-3 d-grid gap-2 col-3 mx-auto',
        },
        ...Array.from({ length: 4 }, (_, i) => {
          const className = i >= state / 2 ?
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
                  name: `player${i * 2}`,  // 1つ目の入力フィールド
                  disabled: i >= state / 2,
                }
              )
            ),
            Teact.createElement(  // 2つ目の入力フィールドがある場合のみ
              'div',
              { className: 'col-6' },
              Teact.createElement(
                'input',
                {
                  type: 'text',
                  className: className,
                  placeholder: `Player ${i * 2 + 2}`,
                  name: `player${i * 2 + 1}`,  // 2つ目の入力フィールド
                  disabled: i >= state / 2,
                }
              )
            )
          );
        }),
        Teact.createElement(
          'button',
          {
            type: 'submit',
            className: 'btn btn-primary btn-lg bg-darkblue mt-3',
          },
          'Submit'
        )
      )
    )
  );
}

const container = document.getElementById('app');
Teact.render(Teact.createElement(App), container);
