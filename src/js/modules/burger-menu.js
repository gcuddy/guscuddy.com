class BurgerMenu extends HTMLElement {
    constructor() {
        super();

        const self = this;

        this.state = new Proxy(
            {
                status: 'open',
                enabled: false
            },
            {
                set(state,key,value) {
                    const oldValue = state[key];

                    state[key] = value;
                    if (oldValue != value) {
                        self.processStartChange();
                    }
                    return state;
                }
            }
        );
    }

    get maxWidth() {
        return parseInt(this.getAttribute('max-width') || 9999, 10);
    }

    connectedCallback() {
        this.initialMarkup = this.innerHTML;
        this.render();
    }

    render() {
        this.innerHTML = `
        <div class='burger-menu' data-element='burger-root'>
            <button class="burger-menu__trigger" data-element="burger-menu-trigger" type="button" aria-label="Open Menu">
                <span class="burger-menu__bar" aria-hidden="true"></span>
            </button>
            <div class="burger-menu__panel" data-element="burger-menu-panel">
                ${this.initialMarkup};
            </div>
        </div>
        `;
        this.postRender();
    }

}

if ('customElements' in window) {
    customElements.define('burger-menu', BurgerMenu);
}

export default BurgerMenu;