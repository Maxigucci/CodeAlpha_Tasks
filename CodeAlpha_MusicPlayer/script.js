import playlist from "./playlist.js";

const img = document.getElementById('img');
const mainBox = document.getElementById('mainBox');

img.addEventListener('load', () => {
  // Single dominant color
  const color = ColorThief.getColorSync(img);
  console.log(color.hex());   // '#a3c4bc'
  console.log(color.css());   // 'rgb(163, 196, 188)'

  // Palette
  const palette = ColorThief.getPaletteSync(img, { colorCount: 5 });
  palette.forEach(c => console.log(c.hex()));
});

// In case the image is already cached and 'load' already fired
if (img.complete) {
  const color = ColorThief.getColorSync(img);
  console.log(color.hex());
  
  const palette = ColorThief.getPaletteSync(img, { colorCount: 5 });
  palette.forEach(c => console.log(c.hex()));
  
  mainBox.style.background=`linear-gradient(to bottom, grey 25%, ${palette[0].hex()} 100%)`;
}
console.log(window.innerHeight)