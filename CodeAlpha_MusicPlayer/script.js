import playlist from "./playlist.js";

const mainBox = document.getElementById("mainBox");
const img = new Image();
img.src = "./artworks/water.jpg";

function getColors(img) {
  await img.decode(); // ensures image is fully loaded

  const vibrant = new Vibrant(img);
  const palette = await Vibrant.from(img).getPalette();

  const color1 = palette.Vibrant?.hex;
  const color2 = palette.Muted?.hex;

mainBox.style.background=`linear-gradient(to bottom, ${color1} 0%, ${color2} 100%)`;
  return { color1, color2 };
}

getColors(img)



