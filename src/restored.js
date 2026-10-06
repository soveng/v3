for (const image of document.querySelectorAll('.profile-picture')) {
  const hide = () => { image.hidden = true; };
  image.addEventListener('error', hide, {once:true});
  if (image.complete && !image.naturalWidth) hide();
}
