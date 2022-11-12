function paleta_mas_cercana(value, factor) {
  return Math.round(Math.round(value/255 * factor)*255/factor)
}

// La imagen que tienen que modificar viene en el parámetro image y contiene inicialmente los datos originales
// es objeto del tipo ImageData ( más info acá https://mzl.la/3rETTC6  )
// Factor indica la cantidad de intensidades permitidas (sin contar el 0)
function dither(image, factor) {
  let w = image.width, h = image.height, d = image.data;
  let flat = (x, y) => y * w * 4 + x * 4;
  let valid = (x, y) => 0 <= x && x < w && 0 <= y && y < h

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      for (let rgb = 0; rgb < 3; rgb++) {
        let old_pixel = d[flat(x, y) + rgb];
        let new_pixel = paleta_mas_cercana(old_pixel, factor);
        d[flat(x, y) + rgb] = new_pixel;

        let err = old_pixel - new_pixel;

        if (method === "FS") { // Floyd-Steinberg
          if (valid(x + 1, y    )) d[flat(x + 1, y    ) + rgb] += err * 7/16
          if (valid(x - 1, y + 1)) d[flat(x - 1, y + 1) + rgb] += err * 3/16
          if (valid(x,     y + 1)) d[flat(x,     y + 1) + rgb] += err * 5/16
          if (valid(x + 1, y + 1)) d[flat(x + 1, y + 1) + rgb] += err * 1/16
        } else { // Jarvis-Judice
          if (valid(x + 1, y    )) d[flat(x + 1, y    ) + rgb] += err * 7/48
          if (valid(x + 2, y    )) d[flat(x + 2, y    ) + rgb] += err * 5/48
          if (valid(x - 2, y + 1)) d[flat(x - 2, y + 1) + rgb] += err * 3/48
          if (valid(x - 1, y + 1)) d[flat(x - 1, y + 1) + rgb] += err * 5/48
          if (valid(x,     y + 1)) d[flat(x,     y + 1) + rgb] += err * 7/48
          if (valid(x + 1, y + 1)) d[flat(x + 1, y + 1) + rgb] += err * 5/48
          if (valid(x + 2, y + 1)) d[flat(x + 2, y + 1) + rgb] += err * 3/48
          if (valid(x - 2, y + 2)) d[flat(x - 2, y + 2) + rgb] += err * 1/48
          if (valid(x - 1, y + 2)) d[flat(x - 1, y + 2) + rgb] += err * 3/48
          if (valid(x ,    y + 2)) d[flat(x ,    y + 2) + rgb] += err * 5/48
          if (valid(x + 1, y + 2)) d[flat(x + 1, y + 2) + rgb] += err * 3/48
          if (valid(x + 2, y + 2)) d[flat(x + 2, y + 2) + rgb] += err * 1/48
        }
      }
    }
  }
}

// Imágenes a restar (imageA y imageB) y el retorno en result
function substraction(imageA,imageB,result) {
  let w = imageA.width, h = imageA.height, d1 = imageA.data, d2 = imageB.data, r =result.data;
  let flat = (x, y) => y * w * 4 + x * 4;

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      for (let rgb = 0; rgb < 3; rgb++) {
        let old_pixel = d1[flat(x, y) + rgb];
        let new_pixel = d2[flat(x, y) + rgb];

        r[flat(x, y) + rgb] = Math.abs(old_pixel - new_pixel);
      }
    }
  }
}
