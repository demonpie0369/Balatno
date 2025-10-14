const canvas = document.getElementById("canvas");
//const gl = canvas.getContext("webgl");
const ctx = canvas.getContext("2d");

/*
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
        x, y,
        x + width, y,
        x, y + height,
        x, y + height,
        x + width, y,
        x + width, y + height,
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
*/

// setting up some variables and such

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.translate(canvas.width / 2, canvas.height / 2);

let backgroundcolour = "#33a168";

const cardwidth = 71;
const cardheight = 95;


let chips = 0;
let mult = 0;
let score = 0;
let totalscore = 0;

let maxdiscards = 3;
let maxhands = 100;

let hands = maxhands;
let discards = maxdiscards;

let money = 0;

let round = 1;


let mouse = { x: 0, y: 0, down: false, pressed: false, released: false };


window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX - canvas.width / 2;
    mouse.y = event.clientY - canvas.height / 2;
});

window.addEventListener("mousedown", (event) => {
    mouse.down = true;
    mouse.pressed = true;
});

window.addEventListener("mouseup", (event) => {
    mouse.down = false;
    mouse.released = true;
});



function getChance(num1, num2) {
    if (Math.random() * num2 < num1) {
        return true;
    } else {
        return false;
    }
}


function getObject(list, index) {
    for (var i = 0; i < Object.entries(list).length; i++) {
        if (Object.entries(list)[i][1].index == index) {
            return Object.entries(list)[i][1];
            break;
        }
    }
}


// colour definitions for some things
const COLOURS = {
    BLACK: "#363746",
    WHITE: "#ffffff",
    SHADOW: "#0000004f",
    DEEPSHADOW: "#0000009f",
    CHIPS: "#2baaff",
    MULT: "#ff3633",
    SPADES: "#172442",
    HEARTS: "#ff0062",
    CLUBS: "#0a4a3d",
    DIAMONDS: "#ff7300",
    OTHER: "#ffb81f",
    MONEY: "#ffd92e",
    TAROT: "#a239bf",
    PLANET: "#3bb3db",
    GREEN: "#3dff77",
    NONE: "#00000000",
}


// card ranks and such
class Rank {

    constructor(name, index, chips) {
        this.name = name;
        this.index = index;
        this.chips = chips;
    }
    
}

const RANKS = {
    TWO: new Rank("2", 0, 2),
    THREE: new Rank("3", 1, 3),
    FOUR: new Rank("4", 2, 4),
    FIVE: new Rank("5", 3, 5),
    SIX: new Rank("6", 4, 6),
    SEVEN: new Rank("7", 5, 7),
    EIGHT: new Rank("8", 6, 8),
    NINE: new Rank("9", 7, 9),
    TEN: new Rank("10", 8, 10),
    JACK: new Rank("Jack", 9, 10),
    QUEEN: new Rank("Queen", 10, 10),
    KING: new Rank("King", 11, 10),
    ACE: new Rank("Ace", 12, 11),
}


// card suits and such
class Suit {

    constructor(name, index, colour) {
        this.name = name;
        this.index = index;
        this.colour = colour;
    }
    
}

const SUITS = {
    SPADES: new Suit("Spades", 0, COLOURS.SPADES),
    HEARTS: new Suit("Hearts", 1, COLOURS.HEARTS),
    CLUBS: new Suit("Clubs", 2, COLOURS.CLUBS),
    DIAMONDS: new Suit("Diamonds", 3, COLOURS.DIAMONDS),
}

const cardfrontsprite = document.getElementById("cardfronts");


// card enhancements
class Enhancement {

    constructor(name, index, score = () => { return undefined; }) {
        this.name = name;
        this.index = index;
        this.score = score;
    }
    
}

const enhancementsprite = document.getElementById("enhancements");

const ENHANCEMENTS = {
    NONE: new Enhancement("", 0),
    BONUS: new Enhancement("Bonus", 1, (card, card2) => {
        if (card2 == undefined) {
            if (gamestate == STATES.SCORE && card.holdertype == HOLDERTYPES.SCORING) {
                return [new ScoreObject(30, SCORETYPES.CHIPS, card)];
            }
        }
    }),
    MULT: new Enhancement("Mult", 2, (card, card2) => {
        if (card2 == undefined) {
            if (gamestate == STATES.SCORE && card.holdertype == HOLDERTYPES.SCORING) {
                return [new ScoreObject(4, SCORETYPES.MULT, card)];
            }
        }
    }),
    WILD: new Enhancement("Wild", 3),
    GLASS: new Enhancement("Glass", 4, (card, card2) => {
        if (card2 == undefined) {
            if (gamestate == STATES.SCORE && card.holdertype == HOLDERTYPES.SCORING) {
                return [new ScoreObject(2, SCORETYPES.XMULT, card)];
            }
            if (gamestate == STATES.FINALSCORE) {
                if (getChance(1, 4)) {
                    scoringcards.removeCard(scoringcards.findCard(card));
                }
            }
        }
    }),
    STEEL: new Enhancement("Steel", 5, (card, card2) => {
        if (card2 == undefined) {
            if (gamestate == STATES.HANDSCORE && card.holdertype == HOLDERTYPES.HAND) {
                return [new ScoreObject(1.5, SCORETYPES.XMULT, card)];
            }
        }
    }),
    STONE: new Enhancement("Stone", 6, (card, card2) => {
        if (card2 == undefined) {
            if (gamestate == STATES.SCORE && card.holdertype == HOLDERTYPES.SCORING) {
                return [new ScoreObject(50, SCORETYPES.CHIPS, card)];
            }
        }
    }),
    GOLD: new Enhancement("Gold", 7, (card, card2) => {
        if (card2 == undefined) {
            if (gamestate == STATES.ROUNDEND && card.holdertype == HOLDERTYPES.HAND) {
                return [new ScoreObject(3, SCORETYPES.MONEY, card)];
            }
        }
    }),
    LUCKY: new Enhancement("Lucky", 8, (card, card2) => {
        if (card2 == undefined) {
            if (gamestate == STATES.SCORE && card.holdertype == HOLDERTYPES.SCORING) {
                let finalscore = [];
                if (getChance(1, 5)) { finalscore.push(new ScoreObject(20, SCORETYPES.MULT, card)); }
                if (getChance(1, 15)) { finalscore.push(new ScoreObject(15, SCORETYPES.MONEY, card)); }
                return finalscore;
            }
        }
    })
}


// card editions
class Edition {

    constructor(name, index, score = () => { return undefined; }) {
        this.name = name;
        this.index = index;
        this.score = score;
    }
    
}

const EDITIONS = {
    NONE: new Edition("", 0),
    FOIL: new Edition("Foil", 1, (card, card2) => {
        if (card2 == undefined) {
            if (gamestate == STATES.SCORE && card.holdertype == HOLDERTYPES.SCORING) {
                return [new ScoreObject(50, SCORETYPES.CHIPS, card)];
            }
        }
    }),
    HOLO: new Edition("Holographic", 2, (card, card2) => {
        if (card2 == undefined) {
            if (gamestate == STATES.SCORE && card.holdertype == HOLDERTYPES.SCORING) {
                return [new ScoreObject(10, SCORETYPES.MULT, card)];
            }
        }
    }),
    POLY: new Edition("Polychrome", 3, (card, card2) => {
        if (card2 == undefined) {
            if (gamestate == STATES.SCORE && card.holdertype == HOLDERTYPES.SCORING) {
                return [new ScoreObject(1.5, SCORETYPES.XMULT, card)];
            }
        }
    }),
    NEGATIVE: new Edition("Negative", 4)
}


// card seals
class Seal {

    constructor(name, index, score = () => { return undefined; }) {
        this.name = name;
        this.index = index;
        this.score = score;
    }
    
}

const SEALS = {
    NONE: new Seal("", 0),
    GOLD: new Seal("Gold", 1, (card, card2) => {
        if (card2 == undefined) {
            if (gamestate == STATES.SCORE && card.holdertype == HOLDERTYPES.SCORING) {
                return [new ScoreObject(3, SCORETYPES.MONEY, card)];
            }
        }
    }),
    RED: new Seal("Red", 2, (card, card2) => {
        if (card2 == undefined) {
            return [new ScoreObject(1, SCORETYPES.RETRIGGER, card)];
        }
    }),
    BLUE: new Seal("Blue", 3),
    PURPLE: new Seal("Purple", 4),
}

// blinds here i guess also some ante stuff

const ANTES = [
    100,
    300,
    800,
    2000,
    5000,
    11000,
    20000,
    35000,
    50000,
    110000,
    560000,
    7200000,
    300000000,
    47000000000,
    Math.pow(2.9, 13),
    Math.pow(7.7, 16),
    Math.pow(8.6, 20),
    Math.pow(4.2, 25),
    Math.pow(9.2, 30),
    Math.pow(4.3, 43),
    Math.pow(9.7, 50),
    Math.pow(1.0, 59),
    Math.pow(5.8, 67),
    Math.pow(1.6, 77),
    Math.pow(2.4, 87),
    Math.pow(1.9, 98),
    Math.pow(8.4, 109),
    Math.pow(2.0, 122),
    Math.pow(2.7, 135),
    Math.pow(2.1, 149),
    Math.pow(9.9, 163),
    Math.pow(2.7, 179),
    Math.pow(4.4, 195),
    Math.pow(4.4, 212),
    Math.pow(2.8, 230),
    Math.pow(1.1, 249),
    Math.pow(2.7, 268),
    Math.pow(4.5, 288),
    Math.pow(4.8, 309),
];

let ante = 1;

class Blind {

    constructor(name, index, scoremult, colour, cashout = 0, desc = "", minante = -1, score = () => { return undefined; }) {

        this.name = name;
        this.index = index;
        this.scoremult = scoremult;
        this.colour = colour;
        this.cashout = cashout;
        this.desc = desc;
        this.minante = minante;
        this.score = score;
        
    }
    
}

const blindsprite = document.getElementById("blinds");
const blindwidth = 34;
const blindheight = 34;

const BLINDS = {
    SMALL: new Blind("Small Blind", 0, 1, "#2f53bd", 3, ["s,malb linde"]),
    BIG: new Blind("Big Blind", 1, 1.5, "#ebad1c", 4, ["big b.linde"]),
    HOOK: new Blind("The Hook", 2, 2, "#7a220a", 5, ["Discards 2 random cards held in", "hand after every played hand"]),
    OX: new Blind("The Ox", 3, 2, "#c75b0e", 5, ["Playing your most played hand", "this run sets money to $0"], 6),
    HOUSE: new Blind("The House", 4, 2, "#2d669c", 5, ["First hand is drawn face down"], 2),
    WALL: new Blind("The Wall", 5, 4, "#933ac9", 5, ["Extra large blind"], 2),
    WHEEL: new Blind("The Wheel", 6, 2, "#3bed3e", 5, ["1 in 7 cards get drawn face", "down during the round"], 2),
    ARM: new Blind("The Arm", 7, 2, "#6d38ff", 5, ["Decrease level of played", "poker hand by 1"], 2),
    CLUB: new Blind("The Club", 8, 2, "#cae092", 5, ["All club cards are debuffed"]),
    FISH: new Blind("The Fish", 9, 2, "#4382b5", 5, ["Cards drawn face down after", "each hand played"], 2),
    PSYCHIC: new Blind("The Psychic", 10, 2, "#ffcf30", 5, ["Must play 5 cards"]),
    GOAD: new Blind("The Goad", 11, 2, "#cc41ac", 5, ["All spade cards are debuffed"]),
    WATER: new Blind("The Water", 12, 2, "#cee6f2", 5, ["Start with 0 discards"], 2),
    WINDOW: new Blind("The Window", 13, 2, "#b5ad98", 5, ["All diamond cards are debuffed"]),
    MANACLE: new Blind("The Manacle", 14, 2, "#403e3b", 5, ["-1 Hand Size"]),
    EYE: new Blind("The Eye", 15, 2, "#2e50d9", 5, ["No repeat hand types this round"], 3),
    MOUTH: new Blind("The Mouth", 16, 2, "#c9679d", 5, ["Only one hand type can be", "played this round"], 2),
    PLANT: new Blind("The Plant", 17, 2, "#7fad8d", 5, ["All face cards are debuffed"], 4),
    SERPENT: new Blind("The Serpent", 18, 2, "#3aa64e", 5, ["After play or discard, always", "draw 3 cards"], 5),
    PILLAR: new Blind("The Pillar", 19, 2, "#7d644f", 5, ["Cards played previously this", "ante are debuffed"]),
    NEEDLE: new Blind("The Needle", 20, 1, "#567a2f", 5, ["Play only 1 hand"], 2),
    HEAD: new Blind("The Head", 21, 2, "#c7a9cf", 5, ["All heart cards are debuffed"]),
    TOOTH: new Blind("The Tooth", 22, 2, "#b52d21", 5, ["Lose $1 per card played"], 3),
    FLINT: new Blind("The Flint", 23, 2, "#ed7226", 5, ["Base Chips and Mult halved"], 2),
    MARK: new Blind("The Mark", 24, 2, "#6b3742", 5, ["All face cards are drawn face", "down"], 2),
    AMBERACORN: new Blind("Amber Acorn", 25, 2, "#ffae00", 8, ["Flips and shuffles all Joker", "cards"], 8),
    VERDANTLEAF: new Blind("Verdant Leaf", 26, 2, "#4ac274", 8, ["All cards debuffed until", "1 Joker sold"], 8),
    VIOLETVESSEL: new Blind("Violet Vessel", 27, 6, "#8f6fed", 8, ["Very large blind"], 8),
    CRIMSONHEART: new Blind("Crimson Heart", 28, 2, "#ab1d2e", 8, ["One random Joker disabled", "every hand"], 8),
    CERULEANBELL: new Blind("Cerulean Bell", 29, 2, "#1cb0ff", 8, ["Forces 1 card to always be selected"], 8),
}

let blind = getObject(BLINDS, Math.floor(Math.random() * 30));



// uhh little score popup thing
class ScoreMessage {

    constructor(text, colour, x = undefined, y = undefined) {
        this.text = text;
        this.colour = colour;
        this.x = x;
        this.y = y;
        this.lifetime = 45;
        this.rotoffset = Math.round(Math.random() * 360);
        this.rotspeed = (Math.random() * 1.8 + 0.4) * (Math.round(Math.random()) * 2 - 1);
        this.speed = 1;
    }

    update() {
        this.lifetime -= this.speed;
    }

    render() {
        ctx.translate(this.x, this.y);
        let rotation = this.rotspeed * this.lifetime + this.rotoffset;
        rotation = rotation / 180 * Math.PI;
        ctx.rotate(rotation);
        let opacity = this.lifetime * 5 + 15;
        opacity = Math.round(opacity).toString(16);
        ctx.fillStyle = this.colour + opacity[0] + opacity[1];
        let size = 96 - this.lifetime;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.rotate(-rotation);
        
        ctx.fillStyle = COLOURS.WHITE;
        ctx.font = "32px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.text, 0, 0);
        
        ctx.translate(-this.x, -this.y);
    }
    
}

messages = [];


// poker hand stuff
class PokerHand {

    constructor(name, basechips, basemult, lvlchips, lvlmult, index, getCards, hidden = false) {
        this.name = name;
        this.chips = basechips;
        this.basechips = basechips;
        this.mult = basemult;
        this.basemult = basemult;
        this.lvlchips = lvlchips;
        this.lvlmult = lvlmult;
        this.level = 1;
        this.hidden = hidden;
        this.getCards = getCards;
        this.timesplayed = 0;
    }

    levelup() {
        this.chips += this.lvlchips;
        this.mult += this.lvlmult;
        this.level += 1;
    }
    
}

const PHANDS = {
    HIGHCARD: new PokerHand("High Card", 5, 1, 10, 1, 0, (cards) => {
        return getHighest(cards);
    }),
    PAIR: new PokerHand("Pair", 10, 2, 15, 1, 1, (cards) => {
        return getCopies(cards, 2, true);
    }),
    TWOPAIR: new PokerHand("Two Pair", 20, 2, 20, 1, 2, (cards) => {
        return getTwoPair(cards);
    }),
    THREEOAK: new PokerHand("Three of a Kind", 30, 3, 20, 2, 3, (cards) => {
        return getCopies(cards, 3, true);
    }),
    STRAIGHT: new PokerHand("Straight", 30, 4, 30, 3, 4, (cards) => {
        return getStraight(cards);
    }),
    FLUSH: new PokerHand("Flush", 35, 4, 15, 2, 5, (cards) => {
        return getFlush(cards);
    }),
    FULLHOUSE: new PokerHand("Full House", 40, 4, 25, 2, 6, (cards) => {
        let returncards = getCopies(cards, 2, true);
        if (returncards.length != 0) {
            let exclude = new Array();
            exclude.push(cards[returncards[0]].rank);
            let newcards = getCopies(cards, 3, true, exclude);
            if (newcards.length != 0) {
                returncards = returncards.concat(newcards);
            } else {
                returncards = [];
            }
        } else {
            returncards = [];
        }
        return returncards;
    }),
    FOUROAK: new PokerHand("Four of a Kind", 60, 7, 30, 3, 7, (cards) => {
        return getCopies(cards, 4, true);
    }),
    SFLUSH: new PokerHand("Straight Flush", 100, 8, 40, 4, 8, (cards) => {
        let returncards = getFlush(cards);
        let othercards = getStraight(cards);
        for (var i = 0; i < othercards.length; i++) {
            let found = false;
            for (var j = 0; j < returncards.length; j++) {
                if (othercards[i] == returncards[j]) {
                    found = true;
                }
            }
            if (!found) {
                returncards.push(othercards[i]);
            }
        }
        if (getFlush(cards).length == 0 || getStraight(cards).length == 0) {
            returncards = [];
        }
        return returncards;
    }),
    FIVEOAK: new PokerHand("Five of a Kind", 120, 12, 35, 3, 9, (cards) => {
        return getCopies(cards, 5, true);
    }, true),
    FLHOUSE: new PokerHand("Flush House", 140, 14, 40, 4, 10, (cards) => {
        let returncards = getCopies(cards, 2, true);
        if (returncards.length != 0) {
            let exclude = new Array();
            exclude.push(cards[returncards[0]].rank);
            let newcards = getCopies(cards, 3, true, exclude);
            if (newcards.length != 0) {
                returncards = returncards.concat(newcards);
            } else {
                returncards = [];
            }
        } else {
            returncards = [];
        }
        if (getFlush(cards).length == 0) {
            returncards = [];
        }
        return returncards;
    }, true),
    FLFIVE: new PokerHand("Flush Five", 160, 16, 50, 3, 11, (cards) => {
        let returncards = getCopies(cards, 5, true);
        if (getFlush(cards).length == 0) {
            returncards = [];
        }
        return returncards;
    }, true),
}


function getHighest(cards) {
    let coolercards = cards.toSorted((a, b) => 0);
    for (var i = 0; i < coolercards.length; i++) {
        coolercards[i] = { card: coolercards[i], index: i };
    }
    coolercards.sort((a, b) => {
        if (a.card.enhancement == ENHANCEMENTS.STONE) { return 1; }
        return b.card.rank.index - a.card.rank.index;
    });
    let highcard = new Array();
    highcard.push(coolercards[0].index)
    return highcard;
}

function getLowest(cards) {
    let coolercards = cards.toSorted((a, b) => 0);
    for (var i = 0; i < coolercards.length; i++) {
        coolercards[i] = { card: coolercards[i], index: i };
    }
    coolercards.sort((a, b) => {
        if (a.card.enhancement == ENHANCEMENTS.STONE) { return 1; }
        return a.card.rank.index - b.card.rank.index;
    });
    let lowcard = new Array();
    lowcard.push(coolercards[0].index)
    return lowcard;
}

function getCopies(cards, amount = 2, exact = false, exclude = []) {

    for (var i = 0; i < cards.length; i++) {
        let returncards = [];
        for (var j = 0; j < cards.length; j++) {
            
            if (cards[j].enhancement == ENHANCEMENTS.STONE) { continue; }
            let excluded = false;
            for (var k = 0; k < exclude.length; k++) {
                if (cards[j].rank.name == exclude[k].name) { excluded = true; }
            }
            if (excluded) { continue; }
            
            if (cards[i].rank == cards[j].rank) {
                returncards.push(j);
            }
            
        }

        if (exact) {
            if (returncards.length == amount) { return returncards; }
        } else {
            if (returncards.length >= amount) { return returncards; }
        }
        
    }

    return [];
    
}

function getTwoPair(cards, exact = true) {
    let returncards = getCopies(cards, 2, true);
    if (returncards.length != 0) {
        let exclude = new Array();
        exclude.push(cards[returncards[0]].rank);
        let newcards = getCopies(cards, 2, exact, exclude);
        if (newcards.length != 0) {
            returncards = returncards.concat(newcards);
        } else {
            returncards = [];
        }
    } else {
        returncards = [];
    }
    return returncards;
}

function getStraight(cards) {
    let coolercards = cards.toSorted((a, b) => 0);
    for (var i = 0; i < coolercards.length; i++) {
        coolercards[i] = { card: coolercards[i], index: i };
    }
    coolercards.sort((a, b) => {
        return a.card.rank.index - b.card.rank.index;
    });
    let returncards = [];
    for (var i = 0; i < coolercards.length - 1; i++) {
        if (coolercards[i].card.rank.index + 1 == coolercards[i + 1].card.rank.index) {
            returncards.push(coolercards[i].index);
        }
        if (coolercards[i].card.rank == RANKS.FIVE && cards[getHighest(cards)].rank == RANKS.ACE) {
            returncards.push(coolercards[i].index);
        }
    }
    if ((returncards.length < 4 && getJokers(JOKERS.FOURFINGERS).length == 0) || (returncards.length < 3 && getJokers(JOKERS.FOURFINGERS).length >= 1)) {
        returncards = []; 
    } else {
        returncards.push(coolercards[coolercards.length - 1].index)
    }
    return returncards;
}

//flushin it
function getFlush(cards) {

    for (var i = 0; i < cards.length; i++) {
        let returncards = [];
        for (var j = 0; j < cards.length; j++) {
            
            if (cards[j].enhancement == ENHANCEMENTS.STONE) { continue; }
            
            if (cards[j].isSuit(cards[i].suit)) {
                returncards.push(j);
            }
            
        }

        if (returncards.length == 5) { return returncards; }
        if (returncards.length == 4 && getJokers(JOKERS.FOURFINGERS).length >= 1) { return returncards; }
        
    }

    return [];
    
}


const SCORETYPES = {
    CHIPS: 0,
    MULT: 1,
    XMULT: 2,
    MONEY: 3,
    RETRIGGER: 4,
    DISCARD: 5,
    DRAW: 6,
    NONE: 7,
    DESTROY: 8,
    OTHER: 9,
}

class ScoreObject {

    constructor(amount, scoretype, card, message = -1) {
        this.amount = amount;
        this.scoretype = scoretype;
        this.card = card;
        this.message = message;
        this.speed = 500;
        switch (scoretype) {
            case SCORETYPES.DRAW:
                this.speed = 100;
            case SCORETYPES.DISCARD:
                this.speed = 100;
        }
        if (message == -1) {
            let text = "";
            let colour = COLOURS.NONE;
            switch (scoretype) {
                case SCORETYPES.CHIPS:
                    text = "+" + amount;
                    colour = COLOURS.CHIPS;
                    break;
                case SCORETYPES.MULT:
                    text = "+" + amount;
                    colour = COLOURS.MULT;
                    break;
                case SCORETYPES.XMULT:
                    text = "X" + amount;
                    colour = COLOURS.MULT;
                    break;
                case SCORETYPES.MONEY:
                    text = "$" + amount;
                    colour = COLOURS.MONEY;
                    break;
                case SCORETYPES.RETRIGGER:
                    text = "Again!";
                    colour = COLOURS.OTHER;
                    break;
            }
            this.message = new ScoreMessage(text, colour);
        }
        if (this.message.x == undefined || this.message.y == undefined) {
            let messagey = card.targety - cardheight / 2 - 96;
            if (messagey <= -canvas.height / 2) {
                messagey = card.targety + cardheight / 2 + 96;
            }
            this.message.x = card.targetx;
            this.message.y = messagey;
        }
    }
    
}


// this thing stores a bunch of cards, stuff like the jokers and hand and such
class CardHolder {

    constructor(cards, size, x, y, type = HOLDERTYPES.HAND, width = 0, height = 0) {
        this.cards = cards;
        this.size = size;
        this.hovercard = -1;
        this.selected = [];
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.targetx = x;
        this.targety = y;
        if (width == 0) {
            this.width = size * cardwidth;
        }
        if (height == 0) {
            this.height = cardheight * 2;
        }
        this.sorttype = "rank";
    }

    getSelected() {
        let returncards = [];
        for (var i = 0; i < this.selected.length; i++) {
            returncards.push(this.cards[this.selected[i]]);
        }
        return returncards;
    }

    sortcards() {

        for (var i = 0; i < this.selected.length; i++) {
            this.cards[this.selected[i]].raised = true;
        } 

        switch (this.sorttype) {
            case "rank":
                this.cards.sort(function(a, b) {
                    if (a.enhancement == ENHANCEMENTS.STONE) {
                        return 1;
                    }
                    if (b.enhancement == ENHANCEMENTS.STONE) {
                        return -1;
                    }
                    if (a.rank == b.rank) {
                        return a.suit.index - b.suit.index;
                    } else {
                        return b.rank.index - a.rank.index;
                    }
                });
                break;
                
            case "suit":
                this.cards.sort(function(a, b) {
                    if (a.enhancement == ENHANCEMENTS.STONE) {
                        return 1;
                    }
                    if (b.enhancement == ENHANCEMENTS.STONE) {
                        return -1;
                    }
                    if (a.suit == b.suit) {
                        return b.rank.index - a.rank.index;
                    } else {
                        return a.suit.index - b.suit.index;
                    }
                });
                break;
        }

        this.selected = [];
        for (var i = 0; i < this.cards.length; i++) {
            if (this.cards[i].raised) {
                this.selected.push(i);
            }
        }
        
    }

    addcard(card, ignoresize = false) {
        if (ignoresize == false && this.cards.length >= this.size) { return false; }
        this.cards.push(card);
    }

    removeCard(index) {
        this.cards.splice(index, 1);
        for (var i = 0; i < this.selected.length; i++) {
            if (index == this.selected[i]) {
                this.selected.splice(i, 1);
            }
        }
    }

    findCard(card) {
        for (var i = 0; i < this.cards.length; i++) {
            if (this.cards[i] == card) {
                return i;
            }
        }
    }

    swapcards(index1, index2) {
        let tempcard = this.cards[index1];
        this.cards[index1] = this.cards[index2];
        this.cards[index2] = tempcard;
    }

    transferCard(index, holder) {
        let card = this.cards[index];
        for (var i = 0; i < this.selected.length; i++) {
            if (this.selected[i] == index) { this.selected.splice(i, 1); }
            if (this.selected[i] > index) { this.selected[i] -= 1; }
        }
        this.cards.splice(index, 1);
        holder.addcard(card, true);
    }

    
    score(card = undefined) {
        let scoresteps = [];
        if (this.type == HOLDERTYPES.SCORING) {
            for (var i = 0; i < this.selected.length; i++) {
                var retriggers = this.cards[this.selected[i]].score(card, 1);
                var scores = this.cards[this.selected[i]].score(card, 2);
                for (var j = 0; j < retriggers.length; j++) {
                    var _scores = this.cards[this.selected[i]].score(card, 2);
                    if (_scores.length > 0) {
                        scores.push(retriggers[j]);
                        scores = scores.concat(_scores);
                    }
                }
                scoresteps = scoresteps.concat(scores);
            }
        } else {
            for (var i = 0; i < this.cards.length; i++) {
                var retriggers = this.cards[i].score(card, 1);
                var scores = this.cards[i].score(card, 2);
                for (var j = 0; j < retriggers.length; j++) {
                    var _scores = this.cards[i].score(card, 2);
                    if (_scores.length > 0 || card != undefined) {
                        scores.push(retriggers[j]);
                        scores = scores.concat(_scores);
                    }
                }
                scoresteps = scoresteps.concat(scores);
                //scoresteps = scoresteps.concat(this.cards[i].score(card));
            }
        }

        return scoresteps;
        
    }
    

    render() {
        for (var i = 0; i < this.selected.length; i++) {
            this.cards[this.selected[i]].raised = true;
        }
        if (this.type != HOLDERTYPES.SCORING) {
            ctx.fillStyle = COLOURS.SHADOW;
            ctx.fillRect(this.x - (this.width + cardwidth + 8) / 2, this.y - (this.height + 8) / 2, this.width + cardwidth + 8, this.height + 8);
        }
        for (var i = 0; i < this.cards.length; i++) {
            this.cards[i].render();
            this.cards[i].raised = false;
        }
    }
    
    // who up updating they function
    update() {

        if (Math.abs(this.targetx - this.x) <= 0.01) {
            this.x = this.targetx;
        } else {
            this.x += (this.targetx - this.x) / 3;
        }

        if (Math.abs(this.targety - this.y) <= 0.01) {
            this.y = this.targety;
        } else {
            this.y += (this.targety - this.y) / 3;
        }
        
        this.hovercard = -1;

        for (var i = 0; i < this.selected.length; i++) {
            this.cards[this.selected[i]].raised = true;
        }
        
        for (var i = 0; i < this.cards.length; i++) {
            let card = this.cards[i];
            let xpos = (this.width / this.cards.length) * i;
            xpos -= this.width / 2;
            xpos += cardwidth / 2;
            xpos += this.x;
            this.cards[i].targetx = xpos;
            this.cards[i].targety = this.y;
            card.test = false;

            card.holdertype = this.type;

            let bbox = { 
                right: card.x + (cardwidth / 2) * card.targetscale,
                left: card.x - (cardwidth / 2) * card.targetscale,
                top: card.y - (cardheight / 2) * card.targetscale,
                bottom: card.y + (cardheight / 2) * card.targetscale};

            if (mouse.x >= bbox.left && mouse.x <= bbox.right && mouse.y >= bbox.top && mouse.y <= bbox.bottom) {
                this.hovercard = i;
            }

            this.cards[i].index = i;
            this.cards[i].holder = this;
            
            this.cards[i].update();
            
            card.hover = false;
            card.raised = false;
        }

        if (this.hovercard != -1) {
            this.cards[this.hovercard].hover = true;
            if (mouse.released && this.type != HOLDERTYPES.SCORING && gamestate == STATES.SELECTING) {
                if (this.selected.indexOf(this.hovercard) == -1) {
                    if (this.selected.length < 5) {
                        this.selected.push(this.hovercard);
                    }
                    if (this.type == HOLDERTYPES.JOKERS) {
                        this.selected = [this.hovercard];
                    }
                } else {
                    this.selected.splice(this.selected.indexOf(this.hovercard), 1);
                }
            }
        }

        /*let selectedcards = [];
        for (var i = 0; i < this.selected.length; i++) {
            selectedcards.push(this.cards[this.selected[i]]);
        }
        let copies = getCopies(selectedcards);
        for (var i = 0; i < copies.length; i++) {
            let card = this.selected[copies[i]];
            this.cards[card].test = true;
        }*/
    }
    
}


// literally just a playing card
class Card {
    constructor(rank, suit, enhancement = ENHANCEMENTS.NONE, edition = EDITIONS.NONE, seal = SEALS.NONE) {
        this.rank = rank;
        this.suit = suit;
        this.enhancement = enhancement;
        this.edition = edition;
        this.seal = seal;
        this.rotation = 0;
        this.rotationoffset = 0;    
        this.shake = 0;
        this.scale = 0;
        this.targetscale = 2;
        this.scaleoffset = 0;
        this.x = 0;
        this.y = 0;
        this.targetx = 0;
        this.targety = 0;
        this.hover = false;
        this.raised = false;
        this.test = false;
        this.holdertype = -1;
        this.holder = undefined;
    }

    update() {

        // card shakey stuff
        if (this.shake > 0) {
            this.shake -= 1;
            this.rotationoffset = Math.sin(this.shake) * this.shake / 100;
            this.scaleoffset = -((Math.sin(this.shake / 15 * 2 * Math.PI)) * 0.1);
        }

        if (this.hover) {
            this.targetscale = 2.2;
        } else {
            this.targetscale = 2;
        }


        if (this.raised) {
            this.targety -= 64; 
        }
        

        if (Math.abs(this.targetscale - this.scale) <= 0.01) {
            this.scale = this.targetscale;
        } else {
            this.scale += (this.targetscale - this.scale) / 3;
        }

        if (Math.abs(this.targetx - this.x) <= 0.01) {
            this.x = this.targetx;
        } else {
            this.x += (this.targetx - this.x) / 3;
        }

        if (Math.abs(this.targety - this.y) <= 0.01) {
            this.y = this.targety;
        } else {
            this.y += (this.targety - this.y) / 3;
        }
        
    }

    score(card = undefined, filter = 0) {

        let scores = [];

        if (this.enhancement != ENHANCEMENTS.STONE && gamestate == STATES.SCORE && this.holdertype == HOLDERTYPES.SCORING && card == undefined) {
            scores.push(new ScoreObject(this.rank.chips, SCORETYPES.CHIPS, this));
        }

        if (this.enhancement.score(this, card)) {
            scores = scores.concat(this.enhancement.score(this, card));
        }

        if (this.edition.score(this, card)) {
            scores = scores.concat(this.edition.score(this, card));
        }

        if (this.seal.score(this, card)) {
            scores = scores.concat(this.seal.score(this, card));
        }

        if (card == undefined) {
            scores = scores.concat(getScores(gamestate, this));
        }

        var retriggers = [];
        var basescores = [];

        for (var i = 0; i < scores.length; i++) {
            if (scores[i].scoretype == SCORETYPES.RETRIGGER) {
                retriggers.push(scores[i]);
            } else {
                basescores.push(scores[i]);
            }
        }

        if (card != this) {

            if (filter == 1) {
                return retriggers;
            } else if (filter == 2) {
                return basescores;
            } else {
                return scores;
            }

        } else { return []; }
        
    }

    isSuit(suit) {
        if (this.enhancement == ENHANCEMENTS.WILD) {
            return true;
        }

        if (this.enhancement == ENHANCEMENTS.STONE) {
            return false;
        }

        if (this.suit == suit) {
            return true;
        } else {
            return false;
        }
    }

    render() {
        
        // im not even sure but it works
        let tempscale = this.scale + this.scaleoffset;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation + this.rotationoffset);
        ctx.drawImage(enhancementsprite, cardwidth * this.enhancement.index, 0, cardwidth, cardheight, 0 - cardwidth * tempscale / 2, 0 - cardheight * tempscale / 2, cardwidth * tempscale, cardheight * tempscale);

        if (this.enhancement != ENHANCEMENTS.STONE) {
            ctx.drawImage(cardfrontsprite, cardwidth * this.rank.index, cardheight * this.suit.index, cardwidth, cardheight, 0 - cardwidth * tempscale / 2, 0 - cardheight * tempscale / 2, cardwidth * tempscale, cardheight * tempscale);
        }

        if (this.test) {
            ctx.fillStyle = COLOURS.CHIPS;
            ctx.fillRect(-16, -16, 32, 32);
        }

        if (this.seal != SEALS.NONE) {
            switch (this.seal) {
                case SEALS.GOLD:
                    ctx.fillStyle = COLOURS.MONEY;
                    break;
                case SEALS.RED:
                    ctx.fillStyle = COLOURS.MULT;
                    break;
                case SEALS.BLUE:
                    ctx.fillStyle = COLOURS.PLANET;
                    break;
                case SEALS.PURPLE:
                    ctx.fillStyle = COLOURS.TAROT;
                    break;
            }
            ctx.fillRect(-32, -32, 32, 32);
        }
        
        ctx.rotate(-(this.rotation + this.rotationoffset));
        ctx.translate(-this.x, -this.y);
    }

    shakecard() {
        this.shake = 15;
    }
}


class Rarity {
    constructor(name, index) {
        this.name = name;
        this.index = index;
    }
}

const RARITIES = {
    COMMON: new Rarity("Common", 0),
    UNCOMMON: new Rarity("Uncommon", 1),
    RARE: new Rarity("Rare", 2),
    LEGENDARY: new Rarity("Legendary", 3),
}


class JokerType {
    constructor(name, index, rarity = RARITIES.COMMON, cost = 0, score = () => { return undefined; }, extra = {}) {
        this.name = name;
        this.index = index;
        this.cost = cost;
        this.score = score;
        this.extra = extra;
    }
}


// all the jokers go here holy moly this will take a while
// to do:
// credit card
// marble joker

const JOKERS = {
    JOKER: new JokerType("Joker", 0, RARITIES.COMMON, 2, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined) {
            return [new ScoreObject(4, SCORETYPES.MULT, card)];
        }
    }),
    GREEDY: new JokerType("Greedy Joker", 1, RARITIES.COMMON, 5, (card, card2) => {
        if (gamestate == STATES.SCORE && card2 != undefined && card2.holdertype == HOLDERTYPES.SCORING && card2.isSuit(SUITS.DIAMONDS)) {
            return [new ScoreObject(3, SCORETYPES.MULT, card)];
        }
    }),
    LUSTY: new JokerType("Lusty Joker", 2, RARITIES.COMMON, 5, (card, card2) => {
        if (gamestate == STATES.SCORE && card2 != undefined && card2.holdertype == HOLDERTYPES.SCORING && card2.isSuit(SUITS.HEARTS)) {
            return [new ScoreObject(3, SCORETYPES.MULT, card)];
        }
    }),
    WRATHFUL: new JokerType("Wrathful Joker", 3, RARITIES.COMMON, 5, (card, card2) => {
        if (gamestate == STATES.SCORE && card2 != undefined && card2.holdertype == HOLDERTYPES.SCORING && card2.isSuit(SUITS.SPADES)) {
            return [new ScoreObject(3, SCORETYPES.MULT, card)];
        }
    }),
    GLUTTONOUS: new JokerType("Gluttonous Joker", 4, RARITIES.COMMON, 5, (card, card2) => {
        if (gamestate == STATES.SCORE && card2 != undefined && card2.holdertype == HOLDERTYPES.SCORING && card2.isSuit(SUITS.CLUBS)) {
            return [new ScoreObject(3, SCORETYPES.MULT, card)];
        }
    }),
    JOLLY: new JokerType("Jolly Joker", 5, RARITIES.COMMON, 3, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined && getCopies(scoringcards.getSelected(), 2).length != 0) {
            return [new ScoreObject(8, SCORETYPES.MULT, card)];
        }
    }),
    ZANY: new JokerType("Zany Joker", 6, RARITIES.COMMON, 4, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined && getCopies(scoringcards.getSelected(), 3).length != 0) {
            return [new ScoreObject(12, SCORETYPES.MULT, card)];
        }
    }),
    MAD: new JokerType("Mad Joker", 7, RARITIES.COMMON, 4, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined && getTwoPair(scoringcards.getSelected(), false).length != 0) {
            return [new ScoreObject(10, SCORETYPES.MULT, card)];
        }
    }),
    CRAZY: new JokerType("Crazy Joker", 8, RARITIES.COMMON, 4, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined && getStraight(scoringcards.getSelected()).length != 0) {
            return [new ScoreObject(12, SCORETYPES.MULT, card)];
        }
    }),
    DROLL: new JokerType("Droll Joker", 9, RARITIES.COMMON, 4, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined && getFlush(scoringcards.getSelected()).length != 0) {
            return [new ScoreObject(10, SCORETYPES.MULT, card)];
        }
    }),
    SLY: new JokerType("Sly Joker", 10, RARITIES.COMMON, 3, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined && getCopies(scoringcards.getSelected(), 2).length != 0) {
            return [new ScoreObject(50, SCORETYPES.CHIPS, card)];
        }
    }),
    WILY: new JokerType("Wily Joker", 11, RARITIES.COMMON, 4, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined && getCopies(scoringcards.getSelected(), 3).length != 0) {
            return [new ScoreObject(100, SCORETYPES.CHIPS, card)];
        }
    }),
    CLEVER: new JokerType("Clever Joker", 12, RARITIES.COMMON, 4, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined && getTwoPair(scoringcards.getSelected(), false).length != 0) {
            return [new ScoreObject(80, SCORETYPES.CHIPS, card)];
        }
    }),
    DEVIOUS: new JokerType("Devious Joker", 13, RARITIES.COMMON, 4, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined && getStraight(scoringcards.getSelected()).length != 0) {
            return [new ScoreObject(100, SCORETYPES.CHIPS, card)];
        }
    }),
    CRAFTY: new JokerType("Crafty Joker", 14, RARITIES.COMMON, 4, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined && getFlush(scoringcards.getSelected()).length != 0) {
            return [new ScoreObject(80, SCORETYPES.CHIPS, card)];
        }
    }),
    //
    // page 2
    //
    HALF: new JokerType("Half Joker", 15, RARITIES.COMMON, 5, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined && scoringcards.cards.length <= 3) {
            return [new ScoreObject(20, SCORETYPES.MULT, card)];
        }
    }),
    STENCIL: new JokerType("Joker Stencil", 16, RARITIES.UNCOMMON, 8, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined) {
            return [new ScoreObject(jokerslots.size - jokerslots.cards.length + getJokers(JOKERS.STENCIL).length, SCORETYPES.XMULT, card)];
        }
    }),
    FOURFINGERS: new JokerType("Four Fingers", 17, RARITIES.UNCOMMON, 7),
    MIME: new JokerType("Mime", 18, RARITIES.UNCOMMON, 5, (card, card2) => {
        if (card2 != undefined && card2.holdertype == HOLDERTYPES.HAND && gamestate != STATES.DISCARD && gamestate != STATES.DRAW) {
            return [new ScoreObject(1, SCORETYPES.RETRIGGER, card)];
        }
    }),
    CREDITCARD: new JokerType("Credit Card", 19, RARITIES.COMMON, 1),
    DAGGER: new JokerType("Ceremonial Dagger", 20, RARITIES.UNCOMMON, 6, (card, card2) => {
        if (gamestate == STATES.ROUNDSTART && card.index != jokerslots.cards.length - 1 && card2 == undefined) {
            let killjoker = jokerslots.cards[card.index + 1];
            let newmult = killjoker.cost * 2;
            return [new ScoreObject([jokerslots, card.index + 1], SCORETYPES.DESTROY, card),
                    new ScoreObject(() => { card.extra.mult += newmult; }, SCORETYPES.OTHER, card,
                        new ScoreMessage("+" + newmult, COLOURS.MULT))];
        }
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined && card.extra.mult != 0) {
            return [new ScoreObject(card.extra.mult, SCORETYPES.MULT, card)]
        }
    }, { mult: 0 }),
    BANNER: new JokerType("Banner", 21, RARITIES.COMMON, 5, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined && discards > 0) {
            return [new ScoreObject(discards * 30, SCORETYPES.CHIPS, card)];
        }
    }),
    SUMMIT: new JokerType("Mystic Summit", 22, RARITIES.COMMON, 5, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined && discards == 0) {
            return [new ScoreObject(15, SCORETYPES.MULT, card)];
        }
    }),
    MARBLE: new JokerType("Marble Joker", 23, RARITIES.UNCOMMON, 6),
    LOYALTYCARD: new JokerType("Loyalty Card", 24, RARITIES.UNCOMMON, 5, (card, card2) => {
        if (gamestate == STATES.JOKERSCORE && card.holdertype == HOLDERTYPES.JOKERS && card2 == undefined) {
            //card.extra.remaining -= 0.5;
            if (card.extra.remaining == 0) {
                return [new ScoreObject(4, SCORETYPES.XMULT, card)];
            }
        }
    }, { remaining: 6 }),
}


const jokersprite = document.getElementById("jokers");

// base joker holy moly theres going to be so much here
class Joker {
    constructor(joker, edition = EDITIONS.NONE) {
        this.joker = joker;
        this.edition = edition;
        this.rotation = 0;
        this.rotationoffset = 0;    
        this.shake = 0;
        this.scale = 0;
        this.targetscale = 2;
        this.scaleoffset = 0;
        this.x = 0;
        this.y = 0;
        this.targetx = 0;
        this.targety = 0;
        this.hover = false;
        this.raised = false;
        this.test = false;
        this.holdertype = -1;
        this.extra = joker.extra;
        this.cost = joker.cost;
        this.sellbutton = new Button("Sell\n$0", COLOURS.GREEN, this.x, this.y, 72, 72, () => { return undefined; });
        this.index = 0;
    }

    update() {

        this.sellbutton.x = (cardwidth / 2 + 32) * this.scale;
        this.sellbutton.y = 0;
        this.sellbutton.text = ["Sell", "$" + this.cost];

        // card shakey stuff
        if (this.shake > 0) {
            this.shake -= 1;
            this.rotationoffset = Math.sin(this.shake) * this.shake / 100;
            this.scaleoffset = -((Math.sin(this.shake / 15 * 2 * Math.PI)) * 0.1);
        }

        if (this.hover) {
            this.targetscale = 2.2;
        } else {
            this.targetscale = 2;
        }


        if (this.raised) {
            this.targety -= 32;
            this.sellbutton.update();
        }
        

        if (Math.abs(this.targetscale - this.scale) <= 0.01) {
            this.scale = this.targetscale;
        } else {
            this.scale += (this.targetscale - this.scale) / 3;
        }

        if (Math.abs(this.targetx - this.x) <= 0.01) {
            this.x = this.targetx;
        } else {
            this.x += (this.targetx - this.x) / 3;
        }

        if (Math.abs(this.targety - this.y) <= 0.01) {
            this.y = this.targety;
        } else {
            this.y += (this.targety - this.y) / 3;
        }
        
    }

    score(card = undefined, filter = 0) {

        let scores = [];

        if (this.edition.score(this, card)) {
            scores = scores.concat(this.edition.score(this, card));
        }

        if (this.joker.score(this, card)) {
            scores = scores.concat(this.joker.score(this, card));
        }

        if (card == undefined) {
            scores = scores.concat(getScores(gamestate, this));
        }

        var retriggers = [];
        var basescores = [];

        for (var i = 0; i < scores.length; i++) {
            if (scores[i].scoretype == SCORETYPES.RETRIGGER) {
                retriggers.push(scores[i]);
            } else {
                basescores.push(scores[i]);
            }
        }

        if (card != this) {

            if (filter == 1) {
                return retriggers;
            } else if (filter == 2) {
                return basescores;
            } else {
                return scores;
            }

        } else { return []; }
        
    }

    render() {
        
        // im not even sure but it works
        let tempscale = this.scale + this.scaleoffset;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation + this.rotationoffset);

        if (this.joker.index > 14) {
            ctx.drawImage(enhancementsprite, cardwidth * 0, 0, cardwidth, cardheight, 0 - cardwidth * tempscale / 2, 0 - cardheight * tempscale / 2, cardwidth * tempscale, cardheight * tempscale);
    
            ctx.fillStyle = COLOURS.BLACK;
            ctx.fillText(this.joker.name, 0, 0);
        } else {
            ctx.drawImage(jokersprite, cardwidth * this.joker.index, 0, cardwidth, cardheight, 0 - cardwidth * tempscale / 2, 0 - cardheight * tempscale / 2, cardwidth * tempscale, cardheight * tempscale);
        }

        if (this.test) {
            ctx.fillStyle = COLOURS.CHIPS;
            ctx.fillRect(-16, -16, 32, 32);
        }

        if (this.raised) {
            this.sellbutton.render();
        }
        
        ctx.rotate(-(this.rotation + this.rotationoffset));
        ctx.translate(-this.x, -this.y);
    }

    shakecard() {
        this.shake = 15;
    }
}


function getJokers(jokertype) {
    var returncards = [];
    for (var i = 0; i < jokerslots.cards.length; i++) {
        if (jokerslots.cards[i].joker == jokertype) {
            returncards.push(i);
        }
    }
    return returncards;
}



// button time!!!
class Button {

    constructor (text, colour, x, y, width, height, click) {
        this.text = text;
        this.colour = colour;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.click = click;
        this.targetx = x;
        this.targety = y;
    }

    update() {

        if (Math.abs(this.targetx - this.x) <= 0.01) {
            this.x = this.targetx;
        } else {
            this.x += (this.targetx - this.x) / 3;
        }

        if (Math.abs(this.targety - this.y) <= 0.01) {
            this.y = this.targety;
        } else {
            this.y += (this.targety - this.y) / 3;
        }

        let bbox = { 
            right: this.x + (this.width / 2),
            left: this.x - (this.width / 2),
            top: this.y - (this.height / 2),
            bottom: this.y + (this.height / 2)};

        if (mouse.x >= bbox.left && mouse.x <= bbox.right && mouse.y >= bbox.top && mouse.y <= bbox.bottom) {
            if (mouse.released) {
                this.click();
            }
        }
        
    }

    render() {

        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.colour;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.fillStyle = COLOURS.WHITE;
        ctx.font = "32px Arial";
        if (Array.isArray(this.text)) {
             for (var i = 0; i < this.text.length; i++) {
                 ctx.fillText(this.text[i], 0, this.height * (i / (this.text.length + 1)));
             }
        } else {
            ctx.fillText(this.text, 0, 0);
        }
        ctx.translate(-this.x, -this.y);
        
    }
    
}

const STATES = {
    SELECTING: 0,
    PRESCORE: 1,
    SCORE: 2,
    HANDSCORE: 3,
    JOKERSCORE: 4,
    FINALSCORE: 5,
    ROUNDSTART: 6,
    ROUNDEND: 7,
    DISCARD: 8,
    CASHOUT: 9,
    SHOPPING: 10,
    DRAW: 11,
}

let gamestate = STATES.ROUNDSTART;

function getScores(state, card = undefined) {
    let oldstate = gamestate;
    gamestate = state;
    let cardscore = scoringcards.score(card);
    let handscore = hand.score(card);
    let jokerscore = jokerslots.score(card);

    let finalscore = cardscore.concat(handscore.concat(jokerscore));
    gamestate = oldstate;
    return finalscore;
}

function scoreSteps(steps) {
    let step = 0;
    let prevtime = 0;

    for (var i = 0; i < steps.length; i++) {
        setTimeout(() => {

            let scorestep = steps[step];

            switch (scorestep.scoretype) {
                case SCORETYPES.CHIPS:
                    chips += scorestep.amount;
                    scorestep.card.shakecard();
                    scorestep.message.speed = 500 / Math.max(150, 500 - step * 3);
                    messages.push(scorestep.message);
                    break;
                case SCORETYPES.MULT:
                    mult += scorestep.amount;
                    scorestep.card.shakecard();
                    scorestep.message.speed = 500 / Math.max(150, 500 - step * 3);
                    messages.push(scorestep.message);
                    break;
                case SCORETYPES.XMULT:
                    mult *= scorestep.amount;
                    scorestep.card.shakecard();
                    scorestep.message.speed = 500 / Math.max(150, 500 - step * 3);
                    messages.push(scorestep.message);
                    break;
                case SCORETYPES.RETRIGGER:
                    scorestep.card.shakecard();
                    scorestep.message.speed = 500 / Math.max(150, 500 - step * 3);
                    messages.push(scorestep.message);
                    break;
                case SCORETYPES.MONEY:
                    money += scorestep.amount;
                    scorestep.card.shakecard();
                    scorestep.message.speed = 500 / Math.max(150, 500 - step * 3);
                    messages.push(scorestep.message);
                    break;
                case SCORETYPES.DRAW:
                    hand.addcard(scorestep.card);
                    hand.sortcards();
                    break;
                case SCORETYPES.DISCARD:
                    hand.transferCard(hand.selected[0], discardedcards);
                    break;
                case SCORETYPES.OTHER:
                    scorestep.amount();
                    scorestep.card.shakecard();
                    scorestep.message.speed = 500 / Math.max(150, 500 - step * 3);
                    messages.push(scorestep.message);
                    break;
                case SCORETYPES.DESTROY:
                    scorestep.amount[0].removeCard(scorestep.amount[1]);
                    break;
            }

            mult = Math.round(mult * 100) / 100;

            step += 1;
        }, prevtime + (Math.max(100, steps[i].speed - i * 3)));
        prevtime += Math.max(100, steps[i].speed - i * 3);
    }

    return prevtime;
}

// really big function

function scoreAll() {
    let cardsteps = getScores(STATES.SCORE);
    let handsteps = getScores(STATES.HANDSCORE);
    let jokersteps = getScores(STATES.JOKERSCORE);

    let scoresteps = cardsteps.concat(handsteps.concat(jokersteps));

    let prevtime = scoreSteps(scoresteps);

    return prevtime;
    
}

function fillHand() {
    let scoresteps = [];
    for (var i = 0; i < hand.size - hand.cards.length; i++) {
        let card = new Card(
                   getObject(RANKS, Math.round(Math.random() * 12)),
                   getObject(SUITS, Math.round(Math.random() * 3)),
                   getObject(ENHANCEMENTS, Math.round(Math.random() * 8)),
                   EDITIONS.NONE,
                   getObject(SEALS, Math.round(Math.random() * 5)));
        scoresteps.push(new ScoreObject(1, SCORETYPES.DRAW, card));
        scoresteps = scoresteps.concat(getScores(STATES.DRAW, card));
    }
    return scoresteps;
}


//
// class definitions end here hoorah
//


let buttons = [];

const HOLDERTYPES = {
    HAND: 0,
    SCORING: 1,
    OFFSCREEN: 2,
    JOKERS: 3
}

let hand = new CardHolder([], 8, 96, 160, HOLDERTYPES.HAND);

hand.sorttype = "rank";

let scoringcards = new CardHolder([], 5, 160, 32, HOLDERTYPES.SCORING, 5 * cardwidth * 2);

let playedcards = new CardHolder([], 1, canvas.width / 1.5, -64, HOLDERTYPES.OFFSCREEN);
let discardedcards = new CardHolder([], 1, canvas.width / 1.5, 160, HOLDERTYPES.OFFSCREEN);

let jokerslots = new CardHolder([], 5, 96, -256, HOLDERTYPES.JOKERS, hand.width);

jokerslots.addcard(new Joker(JOKERS.JOLLY));
jokerslots.addcard(new Joker(JOKERS.JOLLY));
jokerslots.addcard(new Joker(JOKERS.JOLLY));
jokerslots.addcard(new Joker(JOKERS.SLY));
jokerslots.addcard(new Joker(JOKERS.JOLLY));


let phand = PHANDS.HIGHCARD;


var sortrankbut = new Button("Rank", COLOURS.OTHER, hand.x - 96, hand.y + 160, 128, 64, () => {
    hand.sorttype = "rank";
    hand.sortcards();
});

buttons.push(sortrankbut);

var sortsuitbut = new Button("Suit", COLOURS.OTHER, hand.x + 96, hand.y + 160, 128, 64, () => {
    hand.sorttype = "suit";
    hand.sortcards();
});

buttons.push(sortsuitbut);

var discardbut = new Button("Discard", COLOURS.MULT, hand.x + 256, hand.y + 160, 128, 64, () => {
    if (gamestate == STATES.SELECTING && discards > 0) {

        discards -= 1;
        gamestate = STATES.DISCARD;
        let scoresteps = [];

        for (var i = 0; i < hand.selected.length; i++) {
            scoresteps = scoresteps.concat(getScores(STATES.DISCARD, hand.cards[hand.selected[i]]));
            scoresteps.push(new ScoreObject(1, SCORETYPES.DISCARD, hand.cards[hand.selected[i]]));
        }

        let prevtime = scoreSteps(scoresteps);

        prevtime += 200;

        setTimeout(() => {
            prevtime += scoreSteps(fillHand());
        }, prevtime);
        setTimeout(() => {
            gamestate = STATES.SELECTING;
        }, prevtime);
    }
});

buttons.push(discardbut);

var playbut = new Button("Play Hand", COLOURS.CHIPS, hand.x - 256, hand.y + 160, 128, 64, () => {
    if (gamestate == STATES.SELECTING && hands > 0 && hand.selected.length > 0) {

        hands -= 1;
        gamestate = STATES.SCORE;

        hand.targety = 256;
        playbut.targety = hand.targety + 160;
        discardbut.targety = hand.targety + 160;
        sortrankbut.targety = hand.targety + 160;
        sortsuitbut.targety = hand.targety + 160;

        prevtime = 100;
        
        for (var i = 0; i < hand.selected.length; i++) {
            setTimeout(() => {
                hand.selected.sort((a, b) => {
                    return a - b;
                });
                hand.transferCard(hand.selected[0], scoringcards);
            }, prevtime + i * 100);
        }
        prevtime += hand.selected.length * 100;
        hand.selected.sort((a, b) => a - b);
        let scorecards = phand.getCards(hand.getSelected());
        for (var i = 0; i < hand.selected.length; i++) {
            if (hand.cards[hand.selected[i]].enhancement == ENHANCEMENTS.STONE) {
                let found = true;
                for(var j = 0; j < scorecards.length; j++) {
                    if (i == j) { found = false; }
                }
                if (found) { scorecards.push(i); }
            }
        }
        scorecards.sort((a, b) => a - b);
        for (var i = 0; i < scorecards.length; i++) {
            setTimeout(() => {
                scoringcards.selected.push(scorecards[scoringcards.selected.length]);
            }, i * 100 + prevtime + 300);
        }
        prevtime += hand.selected.length * 100;
        setTimeout(() => {
            let prevtime = scoreAll();

            // huge af chunk of code here
            for (var i = 0; i < scoringcards.selected.length; i++) {
                setTimeout(() => {
        
                    scoringcards.selected.splice(0, 1);
                    
                }, prevtime + 500 + i * 100);
            }
        
            let scorechunk = 0;
        
            setTimeout(() => {
                score = Math.floor(chips * mult);
                chips = 0;
                mult = 0;
                scorechunk = score / 20;
            }, prevtime + 700);
            prevtime += 700;
        
            for (var i = 0; i < 20; i++) {
                setTimeout(() => {
                    score -= scorechunk;
                    totalscore += scorechunk;
                }, prevtime + 700 + i * 25);
            }
            prevtime += 700 + 20 * 25;
        
            for (var i = 0; i < scoringcards.cards.length; i++) {
                setTimeout(() => {
                    scoringcards.transferCard(0, playedcards)
                }, prevtime + 100);
                prevtime += 100;
            }
        
            for (var i = 0; i < hand.size - hand.cards.length; i++) {
                setTimeout(() => {
                    let card = new Card(
                        getObject(RANKS, Math.round(Math.random() * 12)),
                        getObject(SUITS, Math.round(Math.random() * 3)),
                        getObject(ENHANCEMENTS, Math.round(Math.random() * 8)),
                        EDITIONS.NONE,
                        getObject(SEALS, Math.round(Math.random() * 5)))
        
                    card.x = discardedcards.x;
                    card.y = discardedcards.y;
                    
                    hand.addcard(card);
                    hand.sortcards("rank");
                }, prevtime + 100);
                prevtime += 100;
            }
        
            setTimeout(() => {
                if (totalscore >= ANTES[ante] * blind.scoremult) {
                    
                } else {
                    gamestate = STATES.SELECTING;
                    hand.targety = 160;
                    playbut.targety = hand.targety + 160;
                    discardbut.targety = hand.targety + 160;
                    sortrankbut.targety = hand.targety + 160;
                    sortsuitbut.targety = hand.targety + 160;
                }
            }, prevtime + 200);
            // huge chunk of code ends here
            
            
        }, prevtime + 500);
        
    }
});

buttons.push(playbut);


jokerslots.update();

let startscores = getScores(STATES.ROUNDSTART);
startscores = startscores.concat(fillHand());
let prevtime = scoreSteps(startscores);

setTimeout(() => {
    gamestate = STATES.SELECTING;
}, prevtime);


function gameloop() {

    hand.update();
    scoringcards.update();
    playedcards.update();
    discardedcards.update();
    jokerslots.update();
    console.log(jokerslots.cards[0].extra.remaining);

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].update();
    }
    for (var i = 0; i < messages.length; i++) {
        messages[i].update();
        if (messages[i].lifetime <= 0) {
            messages.splice(i, 1);
        }
    }
    
    if (hand.selected.length > 0 && gamestate == STATES.SELECTING) {
        let handlist = Object.entries(PHANDS).toSorted((a, b) => {
            return b[1].basechips * b[1].basemult - a[1].basechips * a[1].basemult;
        });
        
        for (var i = 0; i < handlist.length; i++) {
            let scoringcards = handlist[i][1].getCards(hand.getSelected());
            
            if (scoringcards.length == 0) { continue; }
            
            phand = handlist[i][1];
            chips = phand.chips;
            mult = phand.mult;
            break;
        }
    } else {
        if (gamestate == STATES.SELECTING) {
            phand = PHANDS.HIGHCARD;
            chips = 0;
            mult = 0;
        }
    }


    mouse.pressed = false;
    mouse.released = false;
    
    render();
}

window.setInterval(gameloop, 1000 / 60);


function render() {
    ctx.fillStyle = backgroundcolour;
    ctx.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    
    if (gamestate == STATES.SHOPPING || gamestate == STATES.CASHOUT) {
        ctx.fillStyle = COLOURS.BLACK;
    } else {
        ctx.fillStyle = blind.colour;
    }
    ctx.fillRect(-592, -canvas.height / 2, 352, canvas.height);
    ctx.fillStyle = COLOURS.DEEPSHADOW;
    ctx.fillRect(-588, -canvas.height / 2, 344, canvas.height);

    if (gamestate == STATES.SHOPPING || gamestate == STATES.CASHOUT) {
        ctx.fillStyle = COLOURS.BLACK;
    } else {
        ctx.fillStyle = blind.colour;
    }
    // blind name
    ctx.fillRect(-584, -340, 336, 56);
    // other info
    ctx.fillRect(-584, -276, 336, 180);
    // total score
    ctx.fillRect(-584, -88, 336, 56);
    // other info 2
    ctx.fillRect(-472, 132, 108, 72);
    ctx.fillRect(-356, 132, 108, 72);
    ctx.fillRect(-472, 212, 224, 64);
    ctx.fillRect(-472, 284, 108, 72);
    ctx.fillRect(-356, 284, 108, 72);
    

    ctx.fillStyle = COLOURS.SHADOW;
    // other info
    ctx.fillRect(-584, -276, 336, 180);

    ctx.fillStyle = COLOURS.DEEPSHADOW;
    // total score
    ctx.fillRect(-376 - 116, -84, 240, 48);
    // other info 2
    ctx.fillRect(-468, 156, 100, 44);
    ctx.fillRect(-352, 156, 100, 44);
    ctx.fillRect(-468, 216, 216, 56);
    ctx.fillRect(-468, 308, 100, 44);
    ctx.fillRect(-352, 308, 100, 44);

    ctx.fillStyle = COLOURS.BLACK;
    // score box
    ctx.fillRect(-584, -24, 336, 148);
    // other info
    ctx.fillRect(-440, -212, 184, 108);
    

    hand.render();
    scoringcards.render();
    playedcards.render();
    discardedcards.render();
    jokerslots.render();

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].render();
    }
    for (var i = 0; i < messages.length; i++) {
        messages[i].render();
    }
    

    ctx.font = "32px Arial";
    ctx.fillStyle = COLOURS.CHIPS;
    ctx.fillRect(-576, 48, 128, 64);
    ctx.fillStyle = COLOURS.MULT;
    ctx.fillRect(-384, 48, 128, 64);
    ctx.fillStyle = COLOURS.WHITE;
    ctx.textAlign = "right";
    ctx.fillText(chips, -448, 80, 128);
    ctx.textAlign = "left";
    ctx.fillText(mult, -384, 80, 128);
    ctx.textAlign = "center";
    ctx.fillText("X", -416, 80);
    ctx.fillText(Math.round(totalscore), -368, -48, 256);
    ctx.fillText(blind.name, -416, -304);
    ctx.fillStyle = COLOURS.MULT;
    ctx.fillText(ANTES[ante] * blind.scoremult, -348, -152);

    ctx.fillStyle = COLOURS.WHITE;
    ctx.font = "20px Arial";
    ctx.fillText("Round", -536, -64);
    ctx.fillText("score", -536, -40);
    for (var i = 0; i < blind.desc.length; i++) {
        ctx.fillText(blind.desc[i], -416, -248 + i * 24);
    }
    ctx.fillText("Score at least", -348, -184);
    let dollar = "";
    for (var i = 0; i < blind.cashout; i++) { dollar += "$"; }
    ctx.fillText("Reward: " + dollar, -348, -120, 184);

    ctx.fillText("Hands", -472 + 108 / 2, 132 + 20);
    ctx.fillText("Discards", -356 + 108 / 2, 132 + 20);
    ctx.fillText("Ante", -472 + 108 / 2, 284 + 20);
    ctx.fillText("Round", -356 + 108 / 2, 284 + 20);

    ctx.font = "32px Arial";

    ctx.fillStyle = COLOURS.CHIPS;
    ctx.fillText(hands, -472 + 108 / 2, 156 + 44 / 2 + 12);
    ctx.fillStyle = COLOURS.MULT;
    ctx.fillText(discards, -356 + 108 / 2, 156 + 44 / 2 + 12);
    ctx.fillStyle = COLOURS.MONEY;
    ctx.fillText("$" + money, -472 + 212 / 2, 224 + 64 / 2);
    ctx.fillStyle = COLOURS.OTHER;
    ctx.fillText(ante, -472 + 108 / 2, 308 + 44 / 2 + 12);
    ctx.fillText(round, -356 + 108 / 2, 308 + 44 / 2 + 12);

    
    ctx.fillStyle = COLOURS.WHITE;
    
    ctx.drawImage(blindsprite, blindwidth * blind.index, 0, blindwidth, blindheight, -584 + (144 / 2 - blindwidth * 1.5), -212 + (108 / 2 - blindheight * 1.5), blindwidth * 3, blindheight * 3);

    if (gamestate == STATES.SELECTING) {
        if (hand.selected.length > 0) {
            ctx.fillText(phand.name, -416, 24, 512);
        }
    } else {
        if (score == 0) {
            ctx.fillText(phand.name, -416, 24, 512);
        } else {
            ctx.fillText(Math.round(score), -416, 24, 256);
        }
    }
    
}



/*
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
*/






