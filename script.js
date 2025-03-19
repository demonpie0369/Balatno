const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl")


// funky webgl stuff time
let vssource = `
attribute vec2 a_position;

uniform vec2 u_resolution;

attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
    vec2 zerotoone = a_position / u_resolution;
    vec2 zerototwo = zerotoone * 2.0;
    vec2 clipspace = zerototwo - 1.0;
    clipspace.y = -clipspace.y;
    v_texCoord = a_texCoord;
    gl_Position = vec4(clipspace, 0, 1);
}`;

let fssource = `
precision mediump float;

uniform sampler2D u_image;

varying vec2 v_texCoord;

void main() {
    gl_FragColor = texture2D(u_image, v_texCoord);
}`;

function createshader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

let vertexshader = createshader(gl, gl.VERTEX_SHADER, vssource);
let fragmentshader = createshader(gl, gl.FRAGMENT_SHADER, fssource);

function createprogram(gl, vertexshader, fragmentshader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexshader);
    gl.attachShader(program, fragmentshader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

let program = createprogram(gl, vertexshader, fragmentshader);


let posattribloc = gl.getAttribLocation(program, "a_position");
let resuniformloc = gl.getUniformLocation(program, "u_resolution");

let positionbuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionbuffer);

let positions = [
    52, 73,
    730, 73,
    52, 520,
    52, 520,
    730, 73,
    730, 520
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

function drawimage(image, x, y, width, height) {
    let texcoord = gl.getAttribLocation(program, "a_texCoord");

    let texcoordbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        //x, y,
        //x + width, y,
        //x, y + height,
        //x, y + height,
        //x + width, y,
        //x + width, y + height,
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texcoord);
    gl.vertexAttribPointer(texcoord, 2, gl.FLOAT, false, 0, 0);

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.useProgram(program);

    gl.enableVertexAttribArray(posattribloc);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionbuffer);

    let size = 2;
    let type = gl.FLOAT;
    let normalise = false;
    let stride = 0;
    let offset = 0;
    gl.vertexAttribPointer(posattribloc, size, type, normalise, stride, offset);

    gl.enableVertexAttribArray(texcoord);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordbuffer);

    size = 2;
    type = gl.FLOAT;
    normalise = false;
    stride = 0;
    offset = 0;
    gl.vertexAttribPointer(texcoord, size, type, normalise, stride, offset);

    gl.uniform2f(resuniformloc, gl.canvas.width, gl.canvas.height);

    let primitivetype = gl.TRIANGLES;
    offset = 0;
    let count = 6;
    gl.drawArrays(primitivetype, offset, count);
}
// funky webgl stuff ends probably


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const cardwidth = 70;
const cardheight = 98;

const enhancementsprite = document.getElementById("enhancements")
const enhancements = {
    none: { name: "", index: 0},
    bonus: { name: "Bonus", index: 1},
    mult: { name: "Mult", index: 2},
    wild: { name: "Wild", index: 3},
    glass: { name: "Glass", index: 4},
    steel: { name: "Steel", index: 5},
    stone: { name: "Stone", index: 6},
    gold: { name: "Gold", index: 7},
    lucky: { name: "Lucky", index: 8}
}

const editions = {
    none: "",
    foil: "Foil",
    holo: "Holographic",
    poly: "Polychrome",
    negative: "Negative"
}

const seals = {
    none: "",
    gold: "Gold",
    red: "Red",
    blue: "Blue",
    purple: "Purple"
}

class Card {
    constructor(rank, suit, enhancement = enhancements.none, edition = editions.none, seal = seals.none) {
        this.rank = rank;
        this.suit = suit;
        this.enhancement = enhancement;
        this.edition = edition;
        this.seal = seal;
    }

    render(x, y) {
        
    }
}





// rendering stuff starts here
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.clearColor(1, 1, 1, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);

gl.uniform2f(resuniformloc, gl.canvas.width, gl.canvas.height);

gl.enableVertexAttribArray(posattribloc);
gl.bindBuffer(gl.ARRAY_BUFFER, positionbuffer);
let size = 2;
let type = gl.FLOAT;
let normalise = false;
let stride = 0;
let offset = 0;
gl.vertexAttribPointer(posattribloc, size, type, normalise, stride, offset);

let primitivetype = gl.TRIANGLES;
let count = 6;
gl.drawArrays(primitivetype, offset, count);

sillyimage = document.getElementById("enhancements");
//let sillyimage = new Image();
//sillyimage.src = "https://webglfundamentals.org/webgl/resources/leaves.jpg";
sillyimage.onload = function() {
    drawimage(sillyimage, 80, 80, cardwidth, cardheight);
}







