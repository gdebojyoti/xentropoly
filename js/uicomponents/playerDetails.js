class PlayerDetails extends HTMLElement {
    constructor() {
        super();
    }

  connectedCallback() {
    // this.style.cursor = 'pointer';
    // this.style.userSelect = 'none';
    this.render();

    // this.addEventListener('click', this.onClick);
}

    render() {
        this.innerHTML = `
        <section id="all-player-details" class="all-player-details">
            <h2>List of in-game players -</h2>
            <!-- <div class="player-details" data-player-details="D3XT3R">
                <span class="player-name">D3XT3R</span>
                <span class="player-funds">1500</span>
                <span class="player-squares">0, 1, 3</span>
            </div> -->
        </section>
        `;
    }
}

customElements.define('player-details', PlayerDetails);
