
// <============================================ EJERCICIOS ============================================>
// a) Implementar la función:
//
//      GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
//
//    Si la implementación es correcta, podrán hacer rotar la caja correctamente (como en el video). Notar 
//    que esta función no es exactamente la misma que implementaron en el TP4, ya que no recibe por parámetro
//    la matriz de proyección. Es decir, deberá retornar solo la transformación antes de la proyección model-view (MV)
//    Es necesario completar esta implementación para que funcione el control de la luz en la interfaz. 
//    IMPORTANTE: No es recomendable avanzar con los ejercicios b) y c) si este no funciona correctamente. 
//
// b) Implementar los métodos:
//
//      setMesh( vertPos, texCoords, normals )
//      swapYZ( swap )
//      draw( matrixMVP, matrixMV, matrixNormal )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado, asi como también intercambiar 
//    sus coordenadas yz. Notar que es necesario pasar las normales como atributo al VertexShader. 
//    La función draw recibe ahora 3 matrices en column-major: 
//
//       * model-view-projection (MVP de 4x4)
//       * model-view (MV de 4x4)
//       * normal transformation (MV_3x3)
//
//    Estas últimas dos matrices adicionales deben ser utilizadas para transformar las posiciones y las normales del 
//    espacio objeto al esapcio cámara. 
//
// c) Implementar los métodos:
//
//      setTexture( img )
//      showTexture( show )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado y su textura.
//    Notar que los shaders deberán ser modificados entre el ejercicio b) y el c) para incorporar las texturas.
//  
// d) Implementar los métodos:
//
//      setLightDir(x,y,z)
//      setShininess(alpha)
//    
//    Estas funciones se llaman cada vez que se modifican los parámetros del modelo de iluminación en la 
//    interface. No es necesario transformar la dirección de la luz (x,y,z), ya viene en espacio cámara.
//
// Otras aclaraciones: 
//
//      * Utilizaremos una sola fuente de luz direccional en toda la escena
//      * La intensidad I para el modelo de iluminación debe ser seteada como blanca (1.0,1.0,1.0,1.0) en RGB
//      * Es opcional incorporar la componente ambiental (Ka) del modelo de iluminación
//      * Los coeficientes Kd y Ks correspondientes a las componentes difusa y especular del modelo 
//        deben ser seteados con el color blanco. En caso de que se active el uso de texturas, la 
//        componente difusa (Kd) será reemplazada por el valor de textura. 
//        
// <=====================================================================================================>

// Esta función recibe la matriz de proyección (ya calculada), una 
// traslación y dos ángulos de rotación (en radianes). Cada una de 
// las rotaciones se aplican sobre el eje x e y, respectivamente. 
// La función debe retornar la combinación de las transformaciones 
// 3D (rotación, traslación y proyección) en una matriz de 4x4, 
// representada por un arreglo en formato column-major. 

function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [COMPLETAR] Modificar el código para formar la matriz de transformación.

	// Matriz de traslación
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var rotX = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1,
	];

	var rotY = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1,
	];

	var mv = MatrixMult(trans, MatrixMult(rotX, rotY));
	return mv;
}

// [COMPLETAR] Completar la implementación de esta clase.
class MeshDrawer
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// [COMPLETAR] inicializaciones
		// 1. Compilamos el programa de shaders
		this.prog = InitShaderProgram(meshVS, meshFS);
		
		// 2. Obtenemos los IDs de las variables uniformes en los shaders
		this.unifMvp = gl.getUniformLocation(this.prog, "mvp");
		this.unifMv = gl.getUniformLocation(this.prog, "mv");
		this.unifMn = gl.getUniformLocation(this.prog, "mn");
		this.unifSwap = gl.getUniformLocation(this.prog, "swap");
		this.unifShow = gl.getUniformLocation(this.prog, "show");
		this.unifLightDir = gl.getUniformLocation(this.prog, "lightDir");
		this.unifAlpha = gl.getUniformLocation(this.prog, "alpha");
		this.unifAmbient = gl.getUniformLocation(this.prog, "ambient");
		this.sampler = gl.getUniformLocation(this.prog, "texGPU")

		// 3. Obtenemos los IDs de los atributos de los vértices en los shaders
		this.attrPos = gl.getAttribLocation(this.prog, "pos");
		this.attrTexCoord = gl.getAttribLocation(this.prog, "texCoord");
		this.attrNormCoord = gl.getAttribLocation(this.prog, "normCoord");

		// 4. Creamos los buffers
		this.buffPos = gl.createBuffer();
		this.buffTexCoord = gl.createBuffer();
		this.buffNormCoord = gl.createBuffer();
		this.texture = gl.createTexture()

		// ...
		this.swapTrans = [ 1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1];
		this.show = true;
		this.hasTexture = false;
		this.showAmbient = true;
	}
	
	// Esta función se llama cada vez que el usuario carga un nuevo
	// archivo OBJ. En los argumentos de esta función llegan un areglo
	// con las posiciones 3D de los vértices, un arreglo 2D con las
	// coordenadas de textura y las normales correspondientes a cada 
	// vértice. Todos los items en estos arreglos son del tipo float. 
	// Los vértices y normales se componen de a tres elementos 
	// consecutivos en el arreglo vertPos [x0,y0,z0,x1,y1,z1,..] y 
	// normals [n0,n0,n0,n1,n1,n1,...]. De manera similar, las 
	// cooredenadas de textura se componen de a 2 elementos 
	// consecutivos y se  asocian a cada vértice en orden. 
	setMesh( vertPos, texCoords, normals)
	{
		// [COMPLETAR] Actualizar el contenido del buffer de vértices y otros atributos..
		this.numTriangles = vertPos.length / 3 / 3;

		gl.useProgram(this.prog);

		// 1. Binding y seteo del buffer de vértices
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffPos);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// 2. Binding y seteo del buffer de coordenadas de textura	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffTexCoord);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		// 3. Binding y seteo del buffer de normales	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffNormCoord);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
	// El argumento es un boleano que indica si el checkbox está tildado
	swapYZ( swap )
	{
		// [COMPLETAR] Setear variables uniformes en el vertex shader
		if (!swap) {
			this.swapTrans = [ 1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1];
		} else {
			this.swapTrans = [ 1, 0, 0, 0,
				  0, 0, 1, 0,
				  0, 1, 0, 0,
				  0, 0, 0, 1];
		}

	}
	
	// Esta función se llama para dibujar la malla de triángulos
	// El argumento es la matriz model-view-projection (matrixMVP),
	// la matriz model-view (matrixMV) que es retornada por 
	// GetModelViewProjection y la matriz de transformación de las 
	// normales (matrixNormal) que es la inversa transpuesta de matrixMV
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [COMPLETAR] Completar con lo necesario para dibujar la colección de triángulos en WebGL
		
		// 1. Seleccionamos el shader
		gl.useProgram(this.prog);
	
		// 2. Setear uniformes con las matrices de transformaciones
		gl.uniformMatrix4fv(this.unifMvp, false, matrixMVP);
		gl.uniformMatrix4fv(this.unifMv, false,  matrixMV);
		gl.uniformMatrix3fv(this.unifMn, false, matrixNormal);
		gl.uniformMatrix4fv(this.unifSwap, false, this.swapTrans);
		gl.uniform1f(this.unifAmbient, this.showAmbient ? 1 : 0);
		gl.uniform1f(this.unifShow, this.show && this.hasTexture ? 1 : 0);
		gl.uniform1i(this.sampler, 0);

   		// 3. Habilitar atributos: vértices, normales, texturas
		gl.bindBuffer( gl.ARRAY_BUFFER, this.buffPos );
		gl.vertexAttribPointer( this.attrPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.attrPos );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.buffNormCoord );
		gl.vertexAttribPointer( this.attrNormCoord, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.attrNormCoord );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.buffTexCoord );
		gl.vertexAttribPointer( this.attrTexCoord, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.attrTexCoord );

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles * 3 );
	}
	
	// Esta función se llama para setear una textura sobre la malla
	// El argumento es un componente <img> de html que contiene la textura. 
	setTexture( img )
	{
		this.hasTexture = true;
		// [COMPLETAR] Binding de la textura
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// Pueden setear la textura utilizando esta función:
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );


		// [COMPLETAR] Ahora que la textura ya está seteada, debemos setear 
		// parámetros uniformes en el fragment shader para que pueda usarla. 
		// [COMPLETAR] Binding de la textura
		gl.generateMipmap(gl.TEXTURE_2D);
	}
		
        // Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Mostrar textura'
	// El argumento es un boleano que indica si el checkbox está tildado
	showTexture( show )
	{
		// [COMPLETAR] Setear variables uniformes en el fragment shader para indicar si debe o no usar la textura
		this.show = show;
	}
	
	// Este método se llama al actualizar la dirección de la luz desde la interfaz
	setLightDir( x, y, z )
	{		
		// [COMPLETAR] Setear variables uniformes en el fragment shader para especificar la dirección de la luz
		gl.useProgram(this.prog);
		gl.uniform3f(this.unifLightDir, x, y, z);
	}
		
	// Este método se llama al actualizar el brillo del material 
	setShininess( shininess )
	{		
		// [COMPLETAR] Setear variables uniformes en el fragment shader para especificar el brillo.
		gl.useProgram(this.prog);
		gl.uniform1f(this.unifAlpha, shininess);
	}

	showAmbientColor(show) {
		this.showAmbient = show;
	}
}



// [COMPLETAR] Calcular iluminación utilizando Blinn-Phong.

// Recordar que: 
// Si declarás las variables pero no las usás, es como que no las declaraste
// y va a tirar error. Siempre va punto y coma al finalizar la sentencia. 
// Las constantes en punto flotante necesitan ser expresadas como x.y, 
// incluso si son enteros: ejemplo, para 4 escribimos 4.0.

// Vertex Shader
var meshVS = `
	attribute vec3 pos;
	attribute vec2 texCoord;
	attribute vec3 normCoord;

	uniform mat4 mvp;
	uniform mat4 mv;
	uniform mat4 swap;

	varying vec2 v_texCoord;
	varying vec3 v_normCoord;
	varying vec4 v_vertCoord;

	void main()
	{ 
		gl_Position = mvp * swap * vec4(pos,1);
		v_texCoord = texCoord;
		v_vertCoord = normalize(-(mv * vec4(pos, 1))); // normalize(-(mv * vec4(pos, 1)));
		v_normCoord = normCoord; // normalize(mn * normCoord);
	}
`;

// Fragment Shader
// Algunas funciones útiles para escribir este shader:
// Dot product: https://thebookofshaders.com/glossary/?search=dot
// Normalize:   https://thebookofshaders.com/glossary/?search=normalize
// Pow:         https://thebookofshaders.com/glossary/?search=pow

var meshFS = `
	precision mediump float;

	uniform sampler2D texGPU;
	uniform float show;
	uniform vec3 lightDir;
	uniform float alpha;
	uniform mat3 mn;
	uniform float ambient;

	varying vec2 v_texCoord;
	varying vec3 v_normCoord;
	varying vec4 v_vertCoord;

	vec4 Ks = vec4(1.0, 1.0, 1.0, 1.0);
	vec4 I  = vec4(1.0, 1.0, 1.0, 1.0);
	vec4 Ia = vec4(0.1, 0.1, 0.1, 1.0);

	void main()
	{
		vec4 Kd = show * texture2D(texGPU, v_texCoord) + (1.0 - show) * I;
		vec3 n  = normalize(mn * v_normCoord);
		vec3 v  = vec3(v_vertCoord);
		vec3 h  = normalize(lightDir + v);
		float cos_t = dot(n, lightDir);
		float cos_w = dot(n, h);

		gl_FragColor = I * max(0.0, cos_t) * (Kd + Ks * pow(max(0.0, cos_w), alpha) / cos_t) + ambient * Ia * Kd;
	}
`;
