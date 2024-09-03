let currentPath = window.location.pathname;
let routes = [];

export function Router({ children }) {
  return Teact.createElement('div', null, children);
}

export function Route({ path, component }) {
  routes.push({ path, component });
  return null;
}

export function Link({ to, children }) {
  const handleClick = (e) => {
    e.preventDefault();
    navigate(to);
  };

  return Teact.createElement('a', { href: to, onClick: handleClick }, children);
}

export function navigate(to) {
  window.history.pushState({}, '', to);
  currentPath = to;
  renderApp();
}

function renderApp() {
  const route = routes.find(route => route.path === currentPath);
  if (route) {
    Teact.render(Teact.createElement(route.component), document.getElementById('app'));
  } else {
    // 404 Not Found
    Teact.render(Teact.createElement('h1', null, '404 Not Found'), document.getElementById('app'));
  }
}

window.addEventListener('popstate', () => {
  currentPath = window.location.pathname;
  renderApp();
});

export function initRouter() {
  renderApp();
}
