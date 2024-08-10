import "@/styles/style.css";
import javascriptLogo from "@/assets/images/javascript.svg";
import viteLogo from "/vite.svg";
import { Teact } from "@/teact";

// document.querySelector("#app").innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//       <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
//     </a>
//     <h1>Hello Vite!</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite logo to learn more
//     </p>
//   </div>
// `;

function App() {
  const [state, setState] = Teact.useState(1);
  return Teact.createElement(
    "div",
    null,
    Teact.createElement(
      "a",
      { href: "https://vitejs.dev", target: "_blank" },
      Teact.createElement("img", {
        src: viteLogo,
        alt: "Vite logo",
      }),
    ),
    Teact.createElement(
      "a",
      {
        href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        target: "_blank",
      },
      Teact.createElement("img", {
        src: javascriptLogo,
        alt: "JavaScript logo",
      }),
    ),
    Teact.createElement("h1", null, "Hello Vite!"),
    Teact.createElement(
      "div",
      null,
      Teact.createElement(
        "button",
        {
          id: "counter",
          type: "button",
          onClick: () => setState((c) => c + 1),
        },
        `Count: ${state}`,
      ),
    ),
    Teact.createElement("p", null, "Click on the Vite logo to learn more"),
  );
}

const element = Teact.createElement(App);
const container = document.getElementById("app");
Teact.render(element, container);
