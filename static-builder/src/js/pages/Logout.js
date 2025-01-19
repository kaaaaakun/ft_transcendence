
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { useNavigate } from '@/js/libs/router'
import { Teact } from '@/js/libs/teact'

const navigate = useNavigate();

const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
};

export const Logout = () => {
    if (!localStorage.getItem('access_token')) {
        return BaseLayout (
            Teact.createElement('div', {className: 'text-center mb-5 text-light'},
                Teact.createElement(
                    'h3', { className: 'mb-5 text-center text-light '}, 'ログアウト済みです',
                ),
                Teact.createElement('a', { href: '/login', className: 'btn btn-primary btn-lg bg-darkblue' }, 'Login')

            )
        )
    }
    handleLogout();
    return BaseLayout (
        Teact.createElement('div', {className: 'text-center mb-5 text-light'},
            Teact.createElement(
                'h3', { className: 'mb-5 text-center text-light'}, 'ログアウトしました',
            ),
            Teact.createElement('a', { href: '/login', className: 'btn btn-primary btn-lg bg-darkblue' }, 'Login')
        )
    )
}
