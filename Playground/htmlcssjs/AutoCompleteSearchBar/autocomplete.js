import LRUCache from "./LRU_Cache.js";
import { getSearchResult,useDebounce, useThrottle } from "./utility.js";

export default class AutoComplete {
  constructor(input, list, error) {
    this.searchInput = document.getElementById(input);
    this.suggestionContainer = document.getElementById(list);
    this.displayError = document.getElementById(error);
    this.LRU_Cache= new LRUCache(20);
    this.controller = null;
    this.suggestions = [];
    this.searchButton= document.getElementById("search-button")
    this.init();
  }

  init() {
    this.bindEvent();
  }

  bindEvent() {
    const debounceFn = useDebounce(
      this.handleInputChange.bind(this),
      900
    );

    this.searchInput.addEventListener("input", (e) => {
      debounceFn(e.target.value.trim());
    });

    window.addEventListener(
      "click",
      (e) => {
        if (
          e.target === this.searchInput ||
          this.suggestionContainer.contains(e.target)
        ) {
          if (this.suggestionContainer.children.length) {
            this.suggestionContainer.style.display = "block";
          }

          if (e.target.classList.contains("suggestion-item")) {
            this.searchInput.value = e.target.innerText;
            this.clearSuggestions();
          }

          return;
        }

        this.hideSuggestions();
      },
      true
    );
    this.suggestionContainer.addEventListener("keydown",this.handleSuggestionsKeyPress.bind(this))

    this.searchButton.addEventListener("click",(e)=>{
      console.log("click")
    })
  }

  async handleInputChange(value) {
    this.suggestions = [];
    this.controller?.abort();

    this.displayError.innerHTML = "";
    this.suggestionContainer.innerHTML = "";
    this.suggestionContainer.style.display = "none";

    if (!value) {
      this.clearSuggestions();
      return;
    }
   const cached = this.LRU_Cache.get(value);
    if (cached !== -1) {
          this.suggestions = cached;
          this.renderSuggestions();
          return;
      };
    this.controller = new AbortController();

    try {
      const data = await getSearchResult(value, this.controller.signal);
      this.suggestions =
        data?.recipes
          ?.slice(0, 7)
          .map((item) => item?.name)
          .filter(Boolean) || [];
        this.LRU_Cache.put(value, this.suggestions);

      if (!this.suggestions.length) {
        this.showError("No result found");
        return;
      }

      this.renderSuggestions();
    } catch (e) {
      if (e.name === "AbortError") return;

      this.showError("Something went wrong. Try again.");
    }
  }

  renderSuggestions() {
    this.suggestionContainer.innerHTML = "";

    const announcement = document.createElement("p");
    announcement.className = "scrOnly";
    announcement.innerText = `${this.suggestions.length} results found. Use tab to navigate suggestions.`;

    const ul = document.createElement("ul");
    ul.className = "suggestion-list";

    this.suggestions.forEach((item,i) => {
      const li = document.createElement("li");

      li.className = "suggestion-item";
      li.setAttribute("tabindex", "0");
      li.setAttribute("index",i)
      li.setAttribute("role", "option");
      li.innerText = item;

      ul.appendChild(li);
    });

    this.suggestionContainer.appendChild(announcement);
    this.suggestionContainer.appendChild(ul);
    this.suggestionContainer.style.display = "block";
    this.searchInput.setAttribute("aria-expanded", "true");
  }

  showError(message) {
    this.displayError.innerHTML = "";

    const error = document.createElement("p");
    error.setAttribute("role", "alert");
    error.innerText = message;

    this.displayError.appendChild(error);
    this.searchInput.setAttribute("aria-expanded", "false");
  }

  clearSuggestions() {
    this.suggestionContainer.innerHTML = "";
    this.suggestionContainer.style.display = "none";
    this.searchInput.setAttribute("aria-expanded", "false");
  }

  hideSuggestions() {
    this.suggestionContainer.style.display = "none";
    this.searchInput.setAttribute("aria-expanded", "false");
  }

  handleSuggestionsKeyPress(e){
     let listItems=this.suggestionContainer.querySelectorAll(".suggestion-item");

      let lastIndex=listItems.length-1;
      let currentIndex=Number(e.target.getAttribute("index"));
      switch (e.key){
        case "ArrowDown":{
            e.preventDefault();
          if(currentIndex===lastIndex){
            listItems[0].focus()
          }else{  
            listItems[currentIndex+1].focus()
          }
          return
        }
        case "ArrowUp":{
            e.preventDefault();
          if(currentIndex===0){
            listItems[lastIndex].focus()
          }else{  
            listItems[currentIndex-1].focus()
          }
          return
        };
        case "Enter":{
            e.preventDefault();
              this.searchInput.value=e.target.innerText;
              this.clearSuggestions();
               this.searchButton.focus();
        }
        default: return
      }
  }
}