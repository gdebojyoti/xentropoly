// Modals for trade and mortgage

class Modals extends HTMLElement {
    constructor() {
        super();
    }

	connectedCallback() {
		this.render();
	}

    render() {
        this.innerHTML = `
        <section id="modal" data-modal-type="initiate-trade" class="modal-wrapper">
            <div class="modal">
                <h3>Initiate trade</h3>
                <div data-player-list class="mortgage-modal--property-list"></div>
                <div data-my-properties class="mortgage-modal--property-list"></div>
                <div data-opponent-properties class="mortgage-modal--property-list"></div>
                <button data-modal-button="offer" class="modal-button modal-save">Offer</button>
                <button data-modal-button="cancel" class="modal-button modal-cancel">Cancel</button>
                <button data-modal-button="back" class="modal-button">Trade with different player</button>
            </div>
        </section>

        <section id="modal" data-modal-type="mortgage-properties" class="modal-wrapper">
            <div class="modal">
                <h3>Mortgage your properties</h3>
                <div data-my-properties class="mortgage-modal--property-list"></div>
                <button data-modal-button="mortgage" class="modal-button modal-save">Mortgage</button>
                <button data-modal-button="cancel" class="modal-button modal-cancel">Cancel</button>
            </div>
        </section>

        <section id="modal" data-modal-type="unmortgage-properties" class="modal-wrapper">
            <div class="modal">
                <h3>Payoff your mortgages</h3>
                <div data-my-properties class="mortgage-modal--property-list">
                    <div class="mortgage-modal--property property-mortgaged" data-property-id=3>Dhaka</div>
                    <div class="mortgage-modal--property property-mortgaged" data-property-id=10>Helsinki</div>
                </div>
                <button data-modal-button="unmortgage" class="modal-button modal-save">Unmortgage</button>
                <button data-modal-button="cancel" class="modal-button modal-cancel">Cancel</button>
            </div>
        </section>
        `;
    }
}

customElements.define('dx-modals', Modals);
