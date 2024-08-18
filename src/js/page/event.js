import ns from '../module/ns'
import WbaCategoryNav from '../module/wba-category-nav'

export default () => {
    console.log('event page')

    new WbaCategoryNav({
        elm: document.querySelector('.wba-category-nav'),
    })
}
