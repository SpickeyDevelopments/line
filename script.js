console.log("Game On!!!");

let canvas = document.getElementById("canvas");
let canvas2 = document.getElementById("canvas2");

let width = Math.ceil(innerWidth*0.85);
let height = Math.ceil(innerHeight*0.85);
if(height<width) width = height/0.6;
if(width<height) height = width*0.6;

canvas.width = width;
canvas2.width = width;
canvas.height = height;
canvas2.height = height;

document.getElementById("dv").style.width = `${width}px`;
document.getElementById("dv").style.fontSize = `${width/45}px`;
// document.getElementById("dv").style.fontSize = `10px`;

console.log(`${innerWidth}, ${width}`);
let ctx = canvas.getContext("2d");
let bulletCtx = canvas2.getContext("2d");

let timer = 0;
let levelTimer = 0;

let spaceDown = false;
let level = 0;
let end = [];

const tam = Math.ceil(width/25);

let highScore = document.cookie;

if(!highScore){
	document.cookie = "highScore=0;"
	highScore = 0;
} else {
	highScore = document.cookie.split("=")[1];
}
document.getElementById("highScore").innerHTML = `High Score: ${parseFloat(highScore).toFixed(1)} seconds`;

let changeDir = {
	up: { x: [], y: [] },
	down: { x: [], y: [] },
	left: { x: [], y: [] },
	right: { x: [], y: [] }
}

let player = {
	x: 0,
	y: 0,
	dir: 'right',
	newLevel: true,
	tam: 3*tam/4
}

let speed = tam/4;

let bullets = [];
let spaceCounter = 0;

let targetX1, targetY1;
let targetX2, targetY2;

let target1, target2;

let findPos = (arr, charToFind) => {
	let ret = [];
	for (let i in arr) {
		if (arr[i] == charToFind) ret.push(i);
	}
	return ret;
}

let drawScreen = () => {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, tam*25, tam*15);
	ctx.fillStyle = "white";
	ctx.font = `${tam*2.5}px Monospace`;
	ctx.textAlign = "center";

	ctx.fillText("Line", tam*12.5, tam*5);
	ctx.font = `${tam}px Monospace`
	ctx.fillText("A Game", tam*12.5, tam*7.5);

	ctx.font = `${tam/2}px Monospace`
	ctx.fillText("Press Space(or tap the screen) to Continue", tam*12.5, tam*12.5);
	ctx.textAlign = "start";
}

let enemie;

function findBulletEnd(dir, x, y) {
	let mapaAtual = maps[level].map.split('\n');
	enemie = mapaAtual[y / tam + 1][x / tam];

	let upDownCounter = 0;
	let leftRightCounter = 0;
	let enemieFound = false;
	let endFound = false;

	if (dir == 'right' || dir == 'left') {
		for (let p of mapaAtual) {
			if (dir == 'right') {
				for (let k of p) {
					leftRightCounter++;

					if (enemieFound) {
						if (k == '0') {
							endFound = true;
							break;
						}
					}
					else if ((leftRightCounter-1)*tam == x && k == enemie) {
						enemieFound = true;
					}
				}
			}
			else {
				for (let k of p.split('').reverse().join('')) {
					leftRightCounter++;

					if (enemieFound) {
						if (k == '0') {
							endFound = true;
							break;
						}
					}
					else if ((leftRightCounter-1)*tam == x && k == enemie) {
						enemieFound = true;
					}
				}
			}

			if (endFound) {
				break;
			}
			else {
				leftRightCounter = 0;
				upDownCounter++;
			}
		}
	}
	else {
		if (dir == 'up') {
			for (let p of mapaAtual.reverse()) {
				if (enemieFound) {
					if(p[leftRightCounter-1] == '0') {
						endFound = true;
					}
				}
				else {
					leftRightCounter = 0;

					for (let k of p) {
						leftRightCounter++;

						if ((leftRightCounter-1)*tam == x && k == enemie) {
							enemieFound = true;
							break;
						}
					}
				}
				if(endFound) {
					break;
				}
				else {
					upDownCounter++;
				}	
			}
		}
		else {
			for (let p of mapaAtual) {
				if (enemieFound) {
					if(p[leftRightCounter-1] == '0') {
						endFound = true;
					}
				}
				else {
					leftRightCounter = 0;

					for (let k of p) {
						leftRightCounter++;

						if ((leftRightCounter-1)*tam == x && k == enemie) {//here
							enemieFound = true;
							break;
						}
					}
				}
				if(endFound) {
					break;
				}
				else {
					upDownCounter++;
				}	
			}
		}
	}
	
	let endPos = [0,0];

	if(dir=='right' || dir=='down') {//here
		endPos[0] = ((leftRightCounter-1) * tam);
		endPos[1] = ((upDownCounter - 1) * tam);
	}
	else if(dir=='left') {
		endPos[0] = (tam*25 - (leftRightCounter+1) * tam);
		endPos[1] = ((upDownCounter - 1) * tam);
	}
	else {
		endPos[0] = ((leftRightCounter-1) * tam);
		endPos[1] = (tam*15 - (upDownCounter+1) * tam);
	}

	return endPos;
}

async function move(key) {
	if (level == 0) {
		level+=1;
		console.log("cleared all");
		ctx.fillStyle = "white";
		await ctx.fillRect(0, 0, width, width*0.6);
		await drawMap(level);
		return drawPlayer();
	}

	spaceCounter++;
	reDrawBg();

	switch (player.dir) {
		case 'up':
			player.y -= speed;
			break;

		case 'down':
			player.y += speed;
			break;

		case 'left':
			player.x -= speed;
			break;

		case 'right':
			player.x += speed;
			break;
	}
	if (player.dir == "up" || player.dir == "down") {
		let leftDir = changeDir.left;
		let rightDir = changeDir.right;
		if (leftDir.x.includes(player.x)) {
			findPos(leftDir.x, player.x).forEach(num => {
				if (leftDir.y[num] == player.y) player.dir = "left";
			})
		}
		else if (rightDir.x.includes(player.x)) {
			findPos(rightDir.x, player.x).forEach(num => {
				if (rightDir.y[num] == player.y) player.dir = "right";
			})
		}
	}
	else {
		let upDir = changeDir.up;
		let downDir = changeDir.down;
		if (upDir.x.includes(player.x)) {
			findPos(upDir.x, player.x).forEach(num => {
				if (upDir.y[num] == player.y) player.dir = "up";
			})
		}
		else if (downDir.x.includes(player.x)) {
			findPos(downDir.x, player.x).forEach(num => {
				if (downDir.y[num] == player.y) player.dir = "down";
			})
		}
	}
	if (player.x >= end[0] && player.y == end[1] && player.x <= end[0] + tam) {
		changeDir = {
			up: { x: [], y: [] },
			down: { x: [], y: [] },
			left: { x: [], y: [] },
			right: { x: [], y: [] }
		}
		ctx.fillStyle = "white";
		await ctx.fillRect(0, 0, width, width*0.6);
		level++;
		bullets = [];
		player.newLevel = true;
	}
	update();
}

async function update() {
	await reDrawBg();
	drawPlayer();
}

function reDrawBg() {
	if (player.newLevel) {
		drawMap(level);
		levelTimer = 0;
		return;
	}
	let x = player.x, y = player.y;
	ctx.fillStyle = "green";
	ctx.fillRect(x - tam/8, y - tam/8, tam, tam);
}

function drawPlayer() {
	ctx.fillStyle = "yellow";
	ctx.fillRect(player.x, player.y, player.tam, player.tam);
}

async function drawMap(lv) {
	ctx.fillStyle = "white";
	let mapaAtual = maps[lv].map;
	mapaAtual = mapaAtual.split("\n");

	let x = 0, y = -tam;
	let pos;

	for (let arr of mapaAtual) {
		x = 0;

		for (let ch of arr) {
			switch (ch) {
				case '0':
					ctx.fillStyle = "white";
					ctx.fillRect(x, y, tam, tam);
					break;

				case '1':
					ctx.fillStyle = "black";
					ctx.fillRect(x, y, tam, tam);
					break;

				case '2':
					ctx.fillStyle = "green";
					ctx.fillRect(x, y, tam, tam);

					if (player.newLevel) {
						player.dir = "right";
						player.x = x + (tam / 8);
						player.y = y + (tam / 8);
					}
					break;

				case '3':
					ctx.fillStyle = "blue";
					ctx.fillRect(x, y, tam, tam);

					end = [x - player.tam, y + (tam / 8)];
					break;

				case '6':
					ctx.fillStyle = "red";
					ctx.fillRect(x, y, tam, tam);

					pos = findBulletEnd('right', x, y);

					bullets.push([[x + (tam / 2), y + (tam / 2)], 'right', pos]);
					break;

				case '7':
					ctx.fillStyle = "red";
					ctx.fillRect(x, y, tam, tam);

					pos = findBulletEnd('down', x, y);

					bullets.push([[x + (tam / 2), y + (tam / 2)], 'down', pos]);
					break;

				case '8':
					ctx.fillStyle = "red";
					ctx.fillRect(x, y, tam, tam);

					pos = findBulletEnd('left', x, y);

					bullets.push([[x + (tam / 2), y + (tam / 2)], 'left', pos]);
					break;

				case '9':
					ctx.fillStyle = "red";
					ctx.fillRect(x, y, tam, tam);

					pos = findBulletEnd('up', x, y);

					bullets.push([[x + (tam / 2), y + (tam / 2)], 'up', pos]);
					break;

				case '!':
					ctx.fillStyle = "black";
					ctx.fillRect(x, y, tam, tam);
					if (player.newLevel) {
						changeDir.up.x.push(x + tam/8)
						changeDir.up.y.push(y + tam/8)
					}
					break;
				case '@':
					ctx.fillStyle = "black";
					ctx.fillRect(x, y, tam, tam);
					if (player.newLevel) {
						changeDir.down.x.push(x + tam/8)
						changeDir.down.y.push(y + tam/8)
					}
					break;
				case '#':
					ctx.fillStyle = "black";
					ctx.fillRect(x, y, tam, tam);
					if (player.newLevel) {
						changeDir.right.x.push(x + tam/8)
						changeDir.right.y.push(y + tam/8)
					}
					break;
				case '$':
					ctx.fillStyle = "black";
					ctx.fillRect(x, y, tam, tam);
					if (player.newLevel) {
						changeDir.left.x.push(x + tam/8)
						changeDir.left.y.push(y + tam/8)
					}
					break;

				default:
					ctx.fillStyle = "black";
					ctx.fillText(ch, x, y);
					break;
			}
			x += tam;
		}
		y += tam;
	}
	player.newLevel = false;
}

let collision = async(bulletP) => {
	let bullet = {
		x: bulletP[0],
		y: bulletP[1],
		tam: tam/8,
	}
	if(player.x <= bullet.x + bullet.tam && player.x + player.tam >= bullet.x
	&& player.y <= bullet.y + bullet.tam && player.y + player.tam >= bullet.y){
		player.newLevel = true;
		bullets = [];
		drawMap(level);
		drawPlayer();
		return true;
	}
	return false;
}

function fire() {
	for (let enemie of bullets){
		//dir == enemie[1]
		//x = enemie[0][0]
		//y = enemie[0][1]
		//endX = enemie[2][0]
		//endY = enemie[2][1]

		if(enemie[1]=='right') {
			let bulletPos = [enemie[0][0], enemie[0][1]-tam/8];

			bulletCtx.fillStyle = "red";
			bulletCtx.fillRect(bulletPos[0], bulletPos[1], tam/4, tam/4);

			let interval = setInterval(()=>{
				collision(bulletPos);
				if(bulletPos[0]>=(enemie[2][0]-tam/4)) {
					clearInterval(interval);

					bulletCtx.clearRect(bulletPos[0]-(tam*0.025), bulletPos[1]-(tam*0.025), tam/4+tam/10, tam/4+tam/10);
				}
				else {
					
					bulletCtx.clearRect(bulletPos[0]-(tam*0.025), bulletPos[1]-(tam*0.025), tam/4+tam/10, tam/4+tam/10);

					bulletPos[0] += speed;

					bulletCtx.fillRect(bulletPos[0], bulletPos[1], tam/4, tam/4);
				}
			},50);
		}

		if(enemie[1]=='left') {
			let bulletPos = [enemie[0][0], enemie[0][1]-tam/8];

			bulletCtx.fillStyle = "red";
			bulletCtx.fillRect(bulletPos[0], bulletPos[1], tam/4, tam/4);
			// console.log('enemie '+enemie[2][0])
			// console.log('bullet '+bulletPos[0])

			let interval = setInterval(()=>{
				collision(bulletPos);
				if(bulletPos[0]<=(enemie[2][0]-tam/4)) {
					clearInterval(interval);

					bulletCtx.clearRect(bulletPos[0]-(tam*0.025), bulletPos[1]-(tam*0.025), tam/4+(tam*0.025), tam/4+(tam*0.025));
				}
				else {
					bulletCtx.clearRect(bulletPos[0]-(tam*0.025), bulletPos[1]-(tam*0.025), tam/4+tam/10, tam/4+tam/10);

					bulletPos[0] -= speed;

					bulletCtx.fillRect(bulletPos[0], bulletPos[1], tam/4, tam/4);
				}
			},50);
		}

		if(enemie[1]=='up') {
			let bulletPos = [enemie[0][0]-tam/8, enemie[0][1]];

			bulletCtx.fillStyle = "red";
			bulletCtx.fillRect(bulletPos[0], bulletPos[1], tam/4, tam/4);

			let interval = setInterval(()=>{
				collision(bulletPos);
				if(bulletPos[1]<=(enemie[2][1]+tam)) {
					clearInterval(interval);

					bulletCtx.clearRect(bulletPos[0], bulletPos[1], tam/4+tam/10, tam/4+tam/10);
				}
				else {
					bulletCtx.clearRect(bulletPos[0], bulletPos[1], tam/4+tam/10, tam/4+tam/10);

					bulletPos[1] -= speed;

					bulletCtx.fillRect(bulletPos[0], bulletPos[1], tam/4, tam/4);
				}
			},50);
		}

		if(enemie[1]=='down') {
			let bulletPos = [enemie[0][0]-tam/8, enemie[0][1]];

			bulletCtx.fillStyle = "red";
			bulletCtx.fillRect(bulletPos[0], bulletPos[1], tam/4, tam/4);

			let interval = setInterval(()=>{
				collision(bulletPos);
				if(bulletPos[1]>=(enemie[2][1]-tam/4)) {
					clearInterval(interval);

					bulletCtx.clearRect(bulletPos[0]-(tam*0.025), bulletPos[1]-(tam*0.025), tam/4+tam/10, tam/4+tam/10);
				}
				else {
					bulletCtx.clearRect(bulletPos[0]-(tam*0.025), bulletPos[1]-(tam*0.025), tam/4+tam/10, tam/4+tam/10);

					bulletPos[1] += speed;

					bulletCtx.fillRect(bulletPos[0], bulletPos[1], tam/4, tam/4);
				}
			},50);
		}
	}
}

const maps = {
	//0 = nada
	//1 = linha
	//2 = spawn point
	//3 = end point
	//4 = nothing
	//! = cima
	//@ = baixo
	//# = direita
	//$ = esquerda
	//6 = enemie right
	//7 = enemie down
	//8 = enemie left
	//9 = enemie up
	//else = texto, tipo 00First Level00

	"1": {
		"map": `
1111111111111111111111111
1000000000000000000000001
1000000000000000000000001
10000Welcome to Line00001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1021111111111111111111301
1000000000000000000000001
1000000000000000000000001
100Press Space to Move001
1000Or Tap the Screen0001
1000000000000000000000001
1000000000000000000000001
1111111111111111111111111`,
	},
	"2": {
		"map": `
1111111111111111111111111
1000000000000000000000001
1000000000000000000000001
1000You can't go back0001
1000000000000000000000001
100000Only forward0000001
1000000000000000000000001
1021111111111111111111301
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1111111111111111111111111`,
	},
	"3": {
		"map": `
1111111111111111111111111
1000000000000000000000001
1000000000000000000000001
100000You turn00000000001
10000000automatically0001
1000000000000000000000001
100000#111@000000#1@00001
102111!00010000#1!010#301
1000000000#1111!000#1!001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1111111111111111111111111`,
	},
	"4": {
		"map": `
1111111111111111111111111
1000000000000000000000001
1000000000000000000000001
10There are enemies too01
1000000000000000000000001
1000000000000000007000001
100006#111@006#111@000001
102111!000#111!000#111301
1000000000900090000000001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1111111111111111111111111`,
	},
	"5": {
		"map": `
1111111111111111111111111
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1021@0000706#111111111301
100010#11@001000000000001
1006#1!001001000000000001
1000000001001000000000001
100000006#11!000000000001
1000000000009000000000001
1000000000000000000000001
1111111111111111111111111`,
	},
	"6": {
		"map": `
1111111111111111111111111
1000000000000000000000001
1000#1@700000000000000001
100010#@00000000000000001
1000100170000000000000001
1000100#@00000#1@00000001
1000100017000010#@0000001
1021!000#@000010010#11301
1000900001700010010100001
100000000#@0#1!00#1!00001
1000000000101090009000001
1000000006#1!000000000001
1000000000009000000000001
1000000000000000000000001
1111111111111111111111111`,
	},
	"7": {
		"map": `
1111111111111111111111111
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
100000#00@000000000000001
100000000000000#0000@0001
1000000000000000000000001
102000!0000000000000#0301
1000000000000000000000001
1000000000000000000000001
100000000#00000!000000001
1000000000000000000000001
10000INVISIBLE PATH?00001
1000000000000000000000001
1111111111111111111111111`
	},
	"8": {
		"map": `
1117171717171717171717111
1111111111111111111111111
1111111111111111111111111
1111717171717171717171111
1111111111111111111111111
111111111!111111111111111
1111111111111111111111111
1121111111111111111111311
1111111111111111111111111
1111111111111111111111111
1111111111111111111111111
1111111111111111111111111
1111111111111111111111111
1111111111111111111111111
1111111111111111111111111`
	},
	"9": {
		"map": `
1117171717171717171717171
11#111111111111111111111@
#1111111111111111111111@1
1111111111111111111111111
1111111111111111111111111
1111111111111111111111111
111111111111111111111#@11
12!1111111111111111111311
111111111111111111111!1$1
1111111111111111111111111
1111111111111111111111111
1111111111111111111111111
1111111111111111111111111
!11111111111111111111111$
1191919191919191919191911`
	},
  "10": {
		"map": `
1111111111111111111111111
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1000MORE PHASE00000000001
10000000COMING SOON000001
1000000000000000000000001
1020000000000000000000301
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1000000000000000000000001
1111111111111111111111111`
	},
	"11":{
		"map": `
3333333333333333333333333
3000000000000000000000003
3000000000000000000000003
3000000000000000000000003
30000We will0000000000003
3000000000000000000000003
300NEVER GONNA GIVE UP003
3000000000000000000000003
300000making new phases03
3000000000@1$000000000003
300000000012!000000000003
3000000000#1!000000000003
3000000000000000000000003
30Developed by Spickey003
3333333333333333333333333
		`
	},
}

ctx.font = `${tam/2}px Monospace`;

drawScreen();

document.addEventListener('keydown', (key) => {
	if(key.keyCode==32) spaceDown = true;
});
document.addEventListener('keyup', (key) => {
	if(key.keyCode==32)	spaceDown = false;
});
document.addEventListener('touchstart', () => {
	spaceDown = true;
});
document.addEventListener('touchend', () => {
	spaceDown = false;
});

setInterval(async()=>{
	if(document.hidden) return;
	if(spaceDown) move()
}, 50)

setInterval(async() => {
	if(document.hidden) return;
	// console.log(bullets.length);
	if(bullets.length!=0) fire();
}, 3000);

setInterval(async()=>{
	if(level == 0||level==11){
		if(level == 11 && (timer<highScore||highScore==0)) {
			highScore = timer;
			document.cookie=`highScore=${highScore}`;
			document.getElementById("highScore").innerHTML = `High Score: ${parseFloat(highScore).toFixed(1)} seconds`;
		}
		return levelTimer = 0;
	}

	timer+=0.1;
	levelTimer+=0.1;
	document.getElementById("timer").innerHTML = "Time: " + timer.toFixed(1) + " seconds";

	document.getElementById("levelTimer").innerHTML = "Level Time: " + levelTimer.toFixed(1) + " seconds";

}, 100)