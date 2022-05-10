let size = [50, 36];
let opening = 2; // *2

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

	clearFloor(tiles, elems[0].getAttribute("x"), elems[0].getAttribute("y"));
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

let zoom = 1;
const z_speed = 0.2;

let tool = 1;

let erase = false;

let initTheme = true;
window.onload = () => {
	let root = document.querySelector(":root");

	let mapContainer = element("mapContainer");
	let nightCheck = element("nightCheck");

	mapContainer.addEventListener('contextmenu', event => event.preventDefault());

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

	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		nightCheck.checked = true;
		swapMode(root, nightCheck);
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
		buttons[i].title = buttons[i].id[0].toUpperCase() + buttons[i].id.slice(1);
	}

	brush.onclick = () => {
		tool = 1;

		clearTools(root);

		root.style.setProperty("--brush-color", getComputedStyle(root).getPropertyValue("--button-bg-active"));
	}

	line.onclick = () => {
		tool = 2;

		clearTools(root);

		root.style.setProperty("--line-color", getComputedStyle(root).getPropertyValue("--button-bg-active"));
	}

	rect.onclick = () => {
		tool = 3;

		clearTools(root);

		root.style.setProperty("--rect-color", getComputedStyle(root).getPropertyValue("--button-bg-active"));
	}

	fill.onclick = () => {
		tool = 4;

		clearTools(root);

		root.style.setProperty("--fill-color", getComputedStyle(fill).getPropertyValue("--button-bg-active"));
	}

	select.onclick = () => {
		tool = 5;

		clearTools(root);

		root.style.setProperty("--select-color", getComputedStyle(root).getPropertyValue("--button-bg-active"));
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
	});

	mapContainer.addEventListener("pointerup", e => {
		clicked = false;
	});

	mapContainer.addEventListener("pointerleave", e => {
		clicked = false;
	});

	mapContainer.addEventListener("pointermove", e => {
		if(clicked) {
			let rect = mapContainer.getBoundingClientRect();

			let x = parseInt((parseInt(e.clientX - rect.left) - 4) / 12) + 1;
			let y = parseInt((parseInt(e.clientY - rect.top)) / 12) + 1;
			
			if(x > 50) x = 50;
			if(y > 36) y = 36;

			paintTile(tiles, erase, x, y);
		}
	});
}