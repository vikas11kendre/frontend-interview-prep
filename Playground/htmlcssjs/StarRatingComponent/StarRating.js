class StarRating {
    constructor({ maxRating, defaultRating = 0, readOnly = false, onChange, container }) {
        if (!container) {
            throw new Error("StarRating: container element is required");
        }
        if (maxRating < 1) {
            throw new Error("StarRating: maxRating must be at least 1");
        }

        this.count = maxRating;
        this.selectedRating = defaultRating;
        this.readOnly = readOnly;
        this.onChange = onChange || null;
        this.container = container;

        this.render();
    }

    render() {
        const fragment = document.createDocumentFragment();

        this.starGroup = document.createElement("div");
        this.starGroup.className = "star-rating";
        this.starGroup.setAttribute("role", "radiogroup");
        this.starGroup.setAttribute("aria-label", "Star rating");

        if (this.readOnly) {
            this.starGroup.setAttribute("aria-readonly", "true");
        }

        for (let i = 1; i <= this.count; i++) {
            const star = document.createElement("div");
            star.className = i <= this.selectedRating ? "selected-star" : "star";
            star.setAttribute("role", "radio");
            star.setAttribute("data-index", i);
            star.setAttribute("aria-checked", i <= this.selectedRating ? "true" : "false");
            star.setAttribute("aria-label", `Rate ${i} out of ${this.count}`);

            const focusIndex = this.selectedRating || 1;
            star.setAttribute("tabindex", i === focusIndex ? "0" : "-1");

            if (this.readOnly) {
                star.setAttribute("aria-disabled", "true");
            }

            this.starGroup.appendChild(star);
        }

        this.resultDiv = document.createElement("div");
        this.resultDiv.className = "star-rating-result";
        this.resultDiv.setAttribute("aria-live", "polite");
        this.resultDiv.setAttribute("role", "status");

        if (this.selectedRating) {
            this.resultDiv.textContent = `Rating: ${this.selectedRating} / ${this.count}`;
        }

        if (!this.readOnly) {
            this.attachEventListeners();
        }

        fragment.appendChild(this.starGroup);
        fragment.appendChild(this.resultDiv);
        this.container.appendChild(fragment);
    }

    attachEventListeners() {
        this.starGroup.addEventListener("click", (e) => {
            console.log("e",e.target)
            const star = e.target.closest("[role='radio']");
            if (!star) return;
            this.handleClick(star);
        });

        this.starGroup.addEventListener("mouseenter", (e) => {
            const star = e.target.closest("[role='radio']");
            if (!star) return;
            this.handleHoverIn(star);
        }, true);

        this.starGroup.addEventListener("mouseleave", (e) => {
            const star = e.target.closest("[role='radio']");
            if (!star) return;
            this.handleHoverOut();
        }, true);

        this.starGroup.addEventListener("keydown", (e) => {
            const star = e.target.closest("[role='radio']");
            if (!star) return;
            this.handleKeyDown(e, star);
        });
    }

    handleClick(star) {
        const index = Number(star.dataset.index);

        if (this.selectedRating === index) {
            this.selectedRating = 0;
        } else {
            this.selectedRating = index;
        }

        this.updateStars(this.selectedRating);
        this.updateResultText(this.selectedRating);
        this.updateAriaChecked();
        this.updateRovingTabindex();
        this.onChange?.(this.selectedRating);
    }

    handleHoverIn(star) {
        const index = Number(star.dataset.index);
        this.updateStars(index);
        this.updateResultText(index);
    }

    handleHoverOut() {
        this.updateStars(this.selectedRating);
        this.updateResultText(this.selectedRating);
    }

    handleKeyDown(e, star) {
        const stars = Array.from(this.starGroup.children);
        const currentIndex = Number(star.dataset.index);
        let newIndex = null;

        switch (e.key) {
            case "ArrowRight":
            case "ArrowDown":
                e.preventDefault();
                newIndex = currentIndex >= this.count ? 1 : currentIndex + 1;
                break;
            case "ArrowLeft":
            case "ArrowUp":
                e.preventDefault();
                newIndex = currentIndex <= 1 ? this.count : currentIndex - 1;
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                this.handleClick(star);
                return;
            default:
                return;
        }

        stars[currentIndex - 1].setAttribute("tabindex", "-1");
        stars[newIndex - 1].setAttribute("tabindex", "0");
        stars[newIndex - 1].focus();
    }

    updateStars(upToIndex) {
        this.starGroup.querySelectorAll("[role='radio']").forEach((el) => {
            const idx = Number(el.dataset.index);
            el.className = idx <= upToIndex ? "selected-star" : "star";
        });
    }

    updateResultText(rating) {
        this.resultDiv.textContent = rating > 0
            ? `Rating: ${rating} / ${this.count}`
            : "No rating selected";
    }

    updateAriaChecked() {
        this.starGroup.querySelectorAll("[role='radio']").forEach((el) => {
            const idx = Number(el.dataset.index);
            el.setAttribute("aria-checked", idx <= this.selectedRating ? "true" : "false");
        });
    }

    updateRovingTabindex() {
        const focusIndex = this.selectedRating || 1;
        this.starGroup.querySelectorAll("[role='radio']").forEach((el) => {
            const idx = Number(el.dataset.index);
            el.setAttribute("tabindex", idx === focusIndex ? "0" : "-1");
        });
    }

    destroy() {
        this.starGroup.remove();
        this.resultDiv.remove();
    }
}

new StarRating({
    defaultRating: 3,
    maxRating: 5,
    readOnly: false,
    onChange: (rating) => console.log("Rating changed:", rating),
    container: document.getElementById("main-container"),
});
new StarRating({
    defaultRating: 3,
    maxRating: 5,
    readOnly: false,
    onChange: (rating) => console.log("Rating changed:", rating),
    container: document.getElementById("main-container"),
});