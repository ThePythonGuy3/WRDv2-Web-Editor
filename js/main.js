let size = [50, 36];
let opening = 2; // *2

let biomes = [
	"any",
	"brick",
	"spookastle"
];

let element = id => {
	return document.getElementById(id);
}

let classes = className => {
	return document.getElementsByClassName(className);
}

let create = type => {
	return document.createElement(type);
}

let isOpening = (x, y) => {
	if((x == 0 || x == size[0] - 1) && y >= size[1] / 2 - opening && y <= size[1] / 2 + opening - 1) return x == 0 ? 2 : 4;

	if((y == 0 || y == size[1] - 1) && x >= size[0] / 2 - opening && x <= size[0] / 2 + opening - 1) return y == 0 ? 3 : 1;

	return 0;
}

let clearFloor = (tiles, x, y) => {
	for(let x2 = 0; x2 < 4; x2++) {
		let tile = tiles[getPos(x + x2, y + 1)];
		tile.setAttribute("block", "F");
		tile.children[0].src = "./resources/tiles/F.png";
	}

	updateFloor(tiles, x - 1, y + 1);
	updateFloor(tiles, x + 4, y + 1);
}

let actOnPath = (tiles, path, hide) => {
	let elems = classes("tilePath");

	for(let i = 0; i < elems.length; i++){
		if(elems[i].getAttribute("wall") == path) {
			elems[i].className = "tile tilePath";
			if(hide){
				elems[i].className += " activePath";
				elems[i].children[0].src = "./resources/tiles/F.png";
				elems[i].setAttribute("block", "B");

				let x = elems[i].getAttribute("x");
				let y = elems[i].getAttribute("y");
				for(let x2 = -1; x2 < 2; x2++) {
					for(let y2 = -1; y2 < 2; y2++) {
						let pos = getPos(x - 1 + x2, y - 1 + y2);
						if(inRange(pos)){ 
							updateTile(tiles, x - 1 + x2, y - 1 + y2);
						}
					}
				}
			}
		}
	}

	//clearFloor(tiles, elems[0].getAttribute("x"), elems[0].getAttribute("y"));    VERY BUGGY, not a great practice.
}

let getPos = (x, y) => {
	if(x < 0 || x >= size[0] || y < 0 || y >= size[1]) return -1;
	return x + y * size[0];
}

let inRange = p => {
	return p >= 0 && p < 1800;
}

let updateTile = (tiles, x, y) => {
	let i = getPos(x, y);
	let t = tiles[i].getAttribute("block");
	if(t != "W") return;

	let o = "";

	let p = getPos(x, y + 1);
	if(inRange(p)){
		if(tiles[p].getAttribute("block") == "W") o += "D";
	}
	p = getPos(x - 1, y);
	if(inRange(p)){
		if(tiles[p].getAttribute("block") == "W") o += "L";
	}
	p = getPos(x, y - 1);
	if(inRange(p)){
		if(tiles[p].getAttribute("block") == "W") o += "U";
	}
	p = getPos(x + 1, y);
	if(inRange(p)){
		if(tiles[p].getAttribute("block") == "W") o += "R";
	}

	if(o == "") o = "C";

	tiles[i].children[0].src = "./resources/tiles/" + o + ".png";
}

let updateFloor = (tiles, x, y) => {
	let tile = tiles[getPos(x, y)];

	if(tile == undefined) return;

	if(tile.getAttribute("block") == "W" || (inRange(getPos(x, y - 1)) && tiles[getPos(x, y - 1)].getAttribute("block") != "W")) return;

	let o = "s";

	let p = getPos(x - 1, y);
	if(inRange(p)){
		if(tiles[getPos(x - 1, y)].getAttribute("block") == "s") o += "L";
	}
	p = getPos(x + 1, y);
	if(inRange(p)){
		if(tiles[getPos(x + 1, y)].getAttribute("block") == "s") o += "R";
	}

	if(o == "s") o = "sC";

	tile.children[0].src = "./resources/tiles/" + o + ".png";
}

let updatePos = (tiles, x, y) => {
	let att = tiles[getPos(x, y)].getAttribute("block");
	if(att == "s") updateFloor(tiles, x, y);
	else if(att == "W") updateTile(tiles, x, y);
}

let updateArea = (tiles, x, y) => {
	for(let x2 = -1; x2 < 2; x2++) {
		for(let y2 = -1; y2 < 2; y2++) {
			let pos = getPos(x + x2, y + y2);
			if(inRange(pos)){ 
				updatePos(tiles, x + x2, y + y2);
			}
		}
	}
}

let paintTile = (tiles, erase, x, y) => {
	let i = getPos(x - 1, y - 1);
	if(!tiles[i].className.includes("activePath")){
		tiles[i].setAttribute("block", erase ? "B" : "W");
		let under = getPos(x - 1, y);

		for(let x2 = -1; x2 < 2; x2++) {
			for(let y2 = -1; y2 < 2; y2++) {
				let pos = getPos(x - 1 + x2, y - 1 + y2);
				if(inRange(pos)){ 
					updateTile(tiles, x - 1 + x2, y - 1 + y2);
				}
			}
		}

		if(!inRange(under)) return;
		if(tiles[under].getAttribute("block") != "W"){
			tiles[under].setAttribute("block", "s")
		}

		if(tiles[getPos(x - 1, y)].getAttribute("block") != "W") {
			for(let x2 = -1; x2 < 2; x2++) {
				updateFloor(tiles, x - 1 + x2, y);
			}
		}

		updateArea(tiles, x - 1, y - 1);
	}
}

let clearTools = root => {
	root.style.setProperty("--brush-color", "#BEBEBE");
	root.style.setProperty("--line-color", "#BEBEBE");
	root.style.setProperty("--rect-color", "#BEBEBE");
	root.style.setProperty("--fill-color", "#BEBEBE");
	root.style.setProperty("--select-color", "#BEBEBE");
}

let swapMode = (root, nightCheck) => {
	root.style.setProperty("--bg-color", nightCheck.checked ? "#0D1117" : "#FEFEFE");
	root.style.setProperty("--text-color", nightCheck.checked ? "#DEDEDE" : "#303030");

	root.style.setProperty("--button-bg-hover", nightCheck.checked ? "#DEDEDE" : "#AEAEAE");
	root.style.setProperty("--button-bg-active", nightCheck.checked ? "#FEFEFE" : "#8E8E8E");
}

let getLine = (x, y, x2, y2, depth = 15) => {
	if(x == x2 && y == y2) return [[x, y]];

	let posArray = [];

	let px, py;
	for(let i = 0; i <= depth; i++){
		if(x == x2) px = x;
		else px = parseInt(x * (1 - i / depth) + x2 * (i / depth));

		if(y == y2) py = y;
		else py = parseInt(y * (1 - i / depth) + y2 * (i / depth));
		let pos = [px, py];

		if(!posArray.includes(pos)) posArray.push(pos);
	}

	return posArray;
}

let paintArray = (tiles, erase, array) => {
	for(let i = 0; i < array.length; i++){
		paintTile(tiles, erase, array[i][0], array[i][1]);
	}
}

let getCursorTileE = (e, map) => {
	let rect = map.getBoundingClientRect();
	return [parseInt((parseInt(e.clientX - rect.left) - 4) / 12) + 1, parseInt((parseInt(e.clientY - rect.top)) / 12) + 1];
}

let getCursorTile = (x, y, map) => {
	let rect = map.getBoundingClientRect();
	return [parseInt((parseInt(x - rect.left) - 4) / 12) + 1, parseInt((parseInt(y - rect.top)) / 12) + 1];
}

let capitalize = s => {
	return s[0].toUpperCase() + s.slice(1);
};

let clCp = (tiles, cpx, cpy) => {
	if(cpx == -1) return;
	tiles[getPos(cpx - 1, cpy - 1)].style.filter = "brightness(1.0)";
}

let zoom = 1;
const z_speed = 0.2;

let tool = 1;

let erase = false;

let initTheme = true;
window.onload = () => {
	let root = document.querySelector(":root");

	let mapContainer = element("mapContainer");
	let nightCheck = element("nightCheck");

	let down = element("D");
	let left = element("L");
	let up = element("U");
	let right = element("R");

	let buttons = classes("toolButton");

	let brush = element("brush");
	let line = element("line");
	let rect = element("rect");
	let fill = element("fill");
	let select = element("select");

	let biome = element("biome");

	let px = py = -1;
	let cpx = cpy = -1;

	mapContainer.addEventListener('contextmenu', event => event.preventDefault());

	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		nightCheck.checked = true;
		swapMode(root, nightCheck);
	}

	for(let i = 0; i < biomes.length; i++){
		let option = create("option");
		option.value = biomes[i];

		option.innerHTML = capitalize(biomes[i]);

		biome.appendChild(option);
	}

	down.onchange = () => {
		actOnPath(tiles, 1, down.checked);
	}

	left.onchange = () => {
		actOnPath(tiles, 2, left.checked);
	}

	up.onchange = () => {
		actOnPath(tiles, 3, up.checked);
	}

	right.onchange = () => {
		actOnPath(tiles, 4, right.checked);
	}

	for(let i = 0; i < buttons.length; i++){
		buttons[i].src = "./resources/icons/" + buttons[i].id + ".png";
		buttons[i].title = ""

		let sp = buttons[i].id.split("_");
		buttons[i].title += capitalize(sp[0]) + " ";

		for(let n = 1; n < sp.length; n++){
			buttons[i].title += sp[n] + " ";
		}
	}

	brush.onclick = () => {
		tool = 1;

		clCp(tiles, cpx, cpy);
		px = py = -1;
		cpx = cpy = -1;

		clearTools(root);

		root.style.setProperty("--brush-color", "var(--button-bg-active)");
	}

	line.onclick = () => {
		tool = 2;

		clCp(tiles, cpx, cpy);
		px = py = -1;
		cpx = cpy = -1;

		clearTools(root);

		root.style.setProperty("--line-color", "var(--button-bg-active)");
	}

	rect.onclick = () => {
		tool = 3;

		clCp(tiles, cpx, cpy);
		px = py = -1;
		cpx = cpy = -1;

		clearTools(root);

		root.style.setProperty("--rect-color", "var(--button-bg-active)");
	}

	fill.onclick = () => {
		tool = 4;

		clCp(tiles, cpx, cpy);
		px = py = -1;
		cpx = cpy = -1;

		clearTools(root);

		root.style.setProperty("--fill-color", "var(--button-bg-active)");
	}

	select.onclick = () => {
		tool = 5;

		clCp(tiles, cpx, cpy);
		px = py = -1;
		cpx = cpy = -1;

		clearTools(root);

		root.style.setProperty("--select-color", "var(--button-bg-active)");
	}

	nightCheck.onchange = () => {
		swapMode(root, nightCheck);
	}


	mapContainer.style.width = size[0] * 12 + 6 + "px";
	mapContainer.style.height = size[1] * 12 + 6 + "px";

	for(let y = 0; y < size[1]; y++){
		for(let x = 0; x < size[0]; x++){
			let n = create("div");
			let n2 = create("img");

			n.tabIndex = 1;
			n2.src = "./resources/tiles/F.png"
			n2.tabIndex = 1;
			n2.innerHTML = " ";
			n.className = "tile";
			n2.className = "tileImg";

			let opening = isOpening(x, y);
			if(opening != 0){
				n.setAttribute("wall", opening);
				n.className = "tile tilePath activePath";
			} else {
				n.setAttribute("wall", 0);
			}

			n.setAttribute("block", "B");

			n.style.left = x * 12 + 4 + "px";
			n.style.top = y * 12 + "px";

			n.setAttribute("x", x);
			n.setAttribute("y", y);

			n.appendChild(n2);
			mapContainer.appendChild(n);
		}
	}

	let clicked = false;
	let tiles = classes("tile");

	mapContainer.addEventListener("pointerdown", e => {
		clicked = true;

		if(tool == 1){
			let p = getCursorTileE(e, mapContainer);
			paintTile(tiles, erase, p[0], p[1]);
		} else if(tool == 2){
			if(cpx != -1){
				let p = getCursorTileE(e, mapContainer);

				paintArray(tiles, erase, getLine(p[0], p[1], cpx, cpy, 100));
				tiles[getPos(cpx - 1, cpy - 1)].style.filter = "brightness(1.0)";
				cpx = cpy = -1;
			} else {
				let p = getCursorTileE(e, mapContainer);
				cpx = p[0];
				cpy = p[1];

				tiles[getPos(cpx - 1, cpy - 1)].style.filter = "brightness(10.0)";
			}
		}
	});

	mapContainer.addEventListener("pointerup", e => {
		clicked = false;
		px = py = -1;
	});

	mapContainer.addEventListener("pointerleave", e => {
		clicked = false;
		px = py = -1;
	});

	mapContainer.addEventListener("pointermove", e => {
		if(clicked) {
			let p = getCursorTileE(e, mapContainer);
			
			let x = p[0],
			y = p[1];

			if(x > 50) x = 50;
			if(y > 36) y = 36;

			if(tool == 1) {
				if(px != -1){
					paintArray(tiles, erase, getLine(px, py, x, y));
				}
			}

			px = x;
			py = y;
		}
	});
}