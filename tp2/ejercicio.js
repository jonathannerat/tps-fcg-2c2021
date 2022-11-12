function I(i, j) {
	return j * 3 + i;
}

function mult(A, B) {
	var C = Array(0, 0, 0, 0, 0, 0, 0, 0, 0);

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			for (let k = 0; k < 3; k++) {
				C[I(i, j)] += A[I(i, k)] * B[I(k, j)];
			}
		}
	}

	return C;
}

// Esta función construye una matriz de transfromación de 3x3 en coordenadas homogéneas 
// utilizando los parámetros de posición, rotación y escala. La estructura de datos a 
// devolver es un arreglo 1D con 9 valores en orden "column-major". Es decir, para un 
// arreglo A[] de 0 a 8, cada posición corresponderá a la siguiente matriz:
//
// | A[0] A[3] A[6] |
// | A[1] A[4] A[7] |
// | A[2] A[5] A[8] |
// 
// Se deberá aplicar primero la escala, luego la rotación y finalmente la traslación. 
// Las rotaciones vienen expresadas en grados. 
function BuildTransform(positionX, positionY, rotation, scale) {
	let T = Array(
		1,0,0,
		0,1,0,
		positionX,positionY,1);
	var id = Array(
		1, 0, 0,
		0, 1, 0,
		0, 0, 1);

	let cos = Math.cos(rotation * Math.PI/180);
	let sin = Math.sin(rotation * Math.PI/180);
	let R = Array(
		cos, sin, 0,
		-sin, cos, 0,
		0, 0, 1);

	let S = Array(
		scale, 0, 0,
		0, scale, 0,
		0, 0, 1);

	let res = mult(mult(T, R), S);

	return res;
}

// Esta función retorna una matriz que resula de la composición de trasn1 y trans2. Ambas 
// matrices vienen como un arreglo 1D expresado en orden "column-major", y se deberá 
// retornar también una matriz en orden "column-major". La composición debe aplicar 
// primero trans1 y luego trans2. 
function ComposeTransforms(trans1, trans2) {
	return mult(trans2, trans1);
}
