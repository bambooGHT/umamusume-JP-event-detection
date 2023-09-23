import { characters } from "../json/jp/character.js";
import { updateCharacter } from "../data/index.js";
import { debounce } from "../utils.js";

export const initUmamusumeList = () => {
  const umamusumeListDOM = document.querySelector(".umamusume-list");
  const fragment = document.createDocumentFragment();

  characters.forEach((value) => {
    const li = document.createElement("li");
    const label = document.createElement("label");
    const img = document.createElement("img");
    const p = document.createElement("p");

    img.src = value.icon;
    p.title = value.name;
    p.textContent = value.name;

    label.setAttribute("for", "select-umamusume");
    label.appendChild(img);
    label.appendChild(p);
    li.appendChild(label);
    fragment.appendChild(li);

    li.onclick = () => updateCharacter(value);
  });

  umamusumeListDOM.innerHTML = `
    <div class="searchUmamusume">
      <input type="search" placeholder="search name" maxlength="20">
    </div>
  `;

  umamusumeListDOM.appendChild(fragment);
  addEvent(umamusumeListDOM);
};

/** @param {HTMLUListElement} umamusumeListDOM */
const addEvent = (umamusumeListDOM) => {
  const list = [...umamusumeListDOM.querySelectorAll("li")];
  const input = umamusumeListDOM.querySelector("input");

  input.oninput = debounce((e) => {
    const { value } = e.target;
    if (!value) {
      list.forEach((p) => p.style.display = "block");
      return;
    }
    list.forEach((p) => {
      p.style.display = p.innerText.includes(value) ? "block" : "none";
    });
  }, 300);
};