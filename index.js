import TopLoaderService from './TopLoaderService.js';

//Globals

let image;
let lastCorrect = 0;

const error = document.querySelector('#error');
const range = document.querySelector('#range');
const color1 = document.querySelector('#color1');
const color2 = document.querySelector('#color2');
const change = document.querySelector('#change');
const reset = document.querySelector('#reset');
const indicator = document.querySelector('#indicator');

range.addEventListener('input', e => {
  error.value = e.target.value;
  lastCorrect = e.target.value;
});

// error input handler

error.addEventListener('input', e => {
  if (e.target.value >= 0 && e.target.value <= 255)
    lastCorrect = e.target.value;
  else {
    range.value = lastCorrect;
    error.value = lastCorrect;

    return;
  }

  range.value = e.target.value;
});

//canvas

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

function drawImage(img) {
  ctx.canvas.width = img.width;
  ctx.canvas.height = img.height;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

//image

const loader = document.querySelector('#uploader');

loader.addEventListener('change', e => {
  if (!e.target.files || !e.target.files.length) return;
  clear();

  const file = e.target.files[0];
  const img = new Image();

  if (file.type.match('image*')) {
    const reader = new FileReader();

    reader.onload = evt => {
      if (evt.target.readyState == FileReader.DONE) {
        img.src = evt.target.result;

        img.onload = () => {
          drawImage(img);
          image = img;
        };
      }
    };
    reader.readAsDataURL(file);
  }
});

//color

let basicColor, color;

color1.addEventListener('change', e => {
  basicColor = hexToRgb(e.target.value);
});

color2.addEventListener('change', e => {
  color = e.target.value;
});

//transforms

change.addEventListener('click', async e => {
  if (!image || !basicColor || !color) return;

  drawImage(image);

  await colorChange();
});

async function colorChange() {
  for (let w = 0; w <= canvas.width; w++) {
    for (let h = 0; h <= canvas.height; h++) {
      const pixel = ctx.getImageData(w, h, 1, 1);
      const err = Number(lastCorrect);
      const c = pixel.data;

      if (
        c[0] >= basicColor.r - err &&
        c[0] <= basicColor.r + err &&
        c[1] >= basicColor.g - err &&
        c[1] <= basicColor.g + err &&
        c[2] >= basicColor.b - err &&
        c[2] <= basicColor.b + err
      ) {
        ctx.fillStyle = color;
        ctx.fillRect(w, h, 1, 1);
      }
    }
  }
}

reset.addEventListener('click', () => {
  if (!image) return;

  drawImage(image);
});

// utils

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function clear() {
  error.value = 0;
  range.value = 0;
  color1.value = '#FFFFFF';
  color2.value = '#FFFFFF';
  color = undefined;
  basicColor = undefined;
}
