export default class WbaGlobalNav {
    constructor(opts = {}) {
        this.initialize(opts)
    }

    initialize(opts = {}) {
        const elm = (this.elm = opts.elm)
        const $elm = $(elm)
        const $bg = $elm.find('.bg')

        this.isOpen = false

        const $btnMenu = $elm.find('.btn-menu')

        $btnMenu.on('click', _evt => {
            this.isOpen = !this.isOpen
            $elm.attr('data-is-open', this.isOpen)
        })

        $bg.on('click', _evt => {
            this.isOpen = false
            $elm.attr('data-is-open', this.isOpen)
        })
    }
}
