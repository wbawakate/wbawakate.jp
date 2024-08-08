import ns from './ns'
import common from '../page/common'
import pageHome from '../page/home'
import pageAbout from '../page/about'
import pageEvent from '../page/event'
import pageEventDetail from '../page/event-detail'

function page(pageId, callback) {
    if (document.querySelector(`body[data-page-id="${pageId}"]`)) {
        callback()
    }
}

export default class Router {
    constructor() {
        this.initialize()
    }

    initialize() {
        ns.page = ns.page || {}

        common()

        page('home', pageHome)
        page('about', pageAbout)
        page('event', pageEvent)
        page('event-detail', pageEventDetail)
    }
}
