import ns from '../module/ns';

export default () => {
  console.log('event detail page');

  $('.image-link').each((i, elm) => {
    const $elm = $(elm);
    const $img = $elm.find('.elm-img');
    const src = $img.attr('src');
    const $content = $(
`<a href="${src}" target="_blank" class="elm-a">
  <img class="elm-img" src="${src}">
</a>`
    );

    $elm.html('');
    $elm.append($content);
  });
};
