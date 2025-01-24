let size = [30, 20];
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

let getPos = (x, y) => {
	if(x < 0 || x >= size[0] || y < 0 || y >= size[1]) return -1;
	return x + y * size[0];
}

let getXY = pos => {
	if(!inRange(pos)) return [-1, -1];
	return [pos % size[0], parseInt(pos / size[0])];
}

let inRange = p => {
	return p >= 0 && p < 1800;
}

let actOnPath = (tiles, path, hide) => {
	let elems = classes("tilePath");

	for(let i = 0; i < elems.length; i++){
		if(elems[i].getAttribute("wall") == path) {
			elems[i].className = "tile tilePath";
			if(hide){
				let x = parseInt(elems[i].getAttribute("x"));
				let y = parseInt(elems[i].getAttribute("y"));

				paintTile(tiles, false, true, x + 1, y + 1);

				elems[i].className += " activePath";
			}
		}
	}
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

	if(tile.getAttribute("block") != "s") return;

	let top = tiles[getPos(x, y - 1)];
	if(top == undefined ||(top != undefined && top.getAttribute("block") != "W")) {
		tile.setAttribute("block", "B");
		tile.children[0].src = "./resources/tiles/B.png";
	}

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
	
	if(att == "W") updateTile(tiles, x, y);
	else if (att == "s" || tiles[getPos(x, y - 1)]?.getAttribute("block") == "W"){
		tiles[getPos(x, y)].setAttribute("block", "s");
		updateFloor(tiles, x, y);
	}
	else if(att == "B" || att == "F") tiles[getPos(x, y)].children[0].src = "./resources/tiles/" + att + ".png";
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

let paintTile = (tiles, floor, erase, x, y, update = true) => {
	let i = getPos(x - 1, y - 1);
	if(!inRange(i)) return;
	if(!tiles[i].className.includes("activePath")){
		if(erase && tiles[i].getAttribute("block") == "s") return;
		tiles[i].setAttribute("block", erase ? ((inRange(getPos(x - 1, y - 2)) && tiles[getPos(x - 1, y - 2)].getAttribute("block") == "W") ? "s" : "B") : (floor ? "F" : "W"));
		let under = getPos(x - 1, y);

		if(!floor) {
			for(let x2 = -1; x2 < 2; x2++) {
				for(let y2 = -1; y2 < 2; y2++) {
					let pos = getPos(x - 1 + x2, y - 1 + y2);
					if(inRange(pos)){ 
						updateTile(tiles, x - 1 + x2, y - 1 + y2);
					}
				}
			}

			if(!erase) {
				if(!inRange(under)) return;
				if(tiles[under].getAttribute("block") != "W"){
					tiles[under].setAttribute("block", "s");
				}
			}


			if(inRange(getPos(x - 1, y)) && tiles[getPos(x - 1, y)].getAttribute("block") != "W") {
				for(let x2 = -1; x2 < 2; x2++) {
					updateFloor(tiles, x - 1 + x2, y);
				}
			}
		} else {
			updateFloor(tiles, x - 1, y - 1);
			updateTile(tiles, x - 1, y - 1);
		}

		if(update) {
			updateArea(tiles, x - 1, y - 1);
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

let getLine = (x, y, x2, y2, depth = 15) => {
	if(x == x2 && y == y2) return [[x, y]];

	let posArray = [];

	let px, py;
	for(let i = 0; i <= depth; i++){
		if(x == x2) px = x;
		else px = Math.round(x * (1 - i / depth) + x2 * (i / depth));

		if(y == y2) py = y;
		else py = Math.round(y * (1 - i / depth) + y2 * (i / depth));
		let pos = [px, py];

		if(!posArray.includes(pos)) posArray.push(pos);
	}

	return posArray;
}

let paintArray = (tiles, floor, erase, array) => {
	for(let i = 0; i < array.length; i++){
		paintTile(tiles, floor, erase, array[i][0], array[i][1]);
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

let checkIfImageExists = (url, callback) => {
	const img = new Image();
	img.src = url;

	if (img.complete) {
		callback(true);
	} else {
		img.onload = () => {
			callback(true);
		};

		img.onerror = () => {
			callback(false);
		};
	}
}

let floodFill = (tiles, floor, erase, x, y, medium, array) => {
	let t = tiles[getPos(x-1, y-1)];
	if(array.includes(getPos(x - 1, y - 1))) return;
	if(!inRange(getPos(x-1, y-1)) || (t.getAttribute("block") != "s" && t.getAttribute("block") != medium)) return;

	t.setAttribute("block", (erase ? "B" : (floor ? "F" : "W")));
	updateArea(tiles, x, y);
	array.push(getPos(x - 1, y - 1));


	floodFill(tiles, floor, erase, x - 1, y, medium, array);
	floodFill(tiles, floor, erase, x + 1, y, medium, array);
	floodFill(tiles, floor, erase, x, y - 1, medium, array);
	floodFill(tiles, floor, erase, x, y + 1, medium, array);
}

let updateAll = (tiles) => {
	for(let x = 0; x < size[0]; x++){
		for(let y = 0; y < size[1]; y++){
			updateArea(tiles, x, y);
		}
	}
}

let changes = [];
let changeDepth = 20;
let currentChange = 0;
let recordChange = (tiles) => {
	if(currentChange != 0){
		let c = currentChange;
		currentChange = 0;
		recordChange(tiles);

		for(let i = 0; i < changes.length - c - 1; i++) {
			changes.pop(i);
		}
	}

	let mp = {};
	for(let x = 0; x < size[0]; x++){
		for(let y = 0; y < size[1]; y++){
			mp[getPos(x, y)] = tiles[getPos(x, y)].getAttribute("block");
		}
	}

	if(changes.length >= changeDepth) changes.pop(0);

	changes.push(mp);
}

let loadChange = (tiles) => {
	for(let x = 0; x < size[0]; x++){
		for(let y = 0; y < size[1]; y++){
			tiles[getPos(x, y)].setAttribute("block", changes[changes.length - currentChange - 1][getPos(x, y)]);
			updateArea(tiles, x, y);
		}
	}
}

let undo = (tiles) => {
	currentChange++;
	if(currentChange >= changes.length){
		currentChange--;
		return;
	}

	loadChange(tiles);
}

let redo = (tiles) => {
	currentChange--;
	if(currentChange < 0){
		currentChange++;
		return;
	}

	loadChange(tiles);
}

let tilesAsWRDv2 = (name, biome, conn, tiles) => {
	let f = name + ";" + biome + ";" + conn + ";";
	for(let y = 0; y < size[1]; y++){
		for(let x = 0; x < size[0]; x++){
			let t = tiles[getPos(x, y)];

			let s = "";
			if(t.className.includes("activePath")) s = "F";
			else {
				s = t.getAttribute("block");

				if(s == "s") s = "B";
			}

			if(x < size[0] - 1) f += s + ".";
			else f += s;
		}
		f += ";";
	}

	return f.replace(new RegExp("\.$"), "");
}

let loadWRDv2 = (data, nameC, biomeC, cons, tiles) => {
	let sp = data.split(";");
	let name = sp[0];
	let biome = sp[1];
	let conn = sp[2];
	let room = sp[3].split(".");
	
	for (let i = 4; i < sp.length; i++)
	{
		room = room.concat(sp[i].split("."));
	}

	nameC.value = name;
	biomeC.options[biomes.indexOf(biome)].selected = true;

	for(let i = 0; i < 4; i++){
		cons[i].checked = false;
	}

	if(conn.includes("D")) cons[0].checked = true;
	if(conn.includes("L")) cons[1].checked = true;
	if(conn.includes("U")) cons[2].checked = true;
	if(conn.includes("R")) cons[3].checked = true;

	for(let x = 0; x < size[0]; x++){
		for(let y = 0; y < size[1]; y++){
			let p = getPos(x, y);
			tiles[p].setAttribute("block", room[x + y * size[0]]);
		}
	}

	updateAll(tiles);
}

let fillCanvas = (tiles, canvas, context) => {
	context.clearRect(0, 0, 8*size[0], 8*size[1]);

	for(let i = 0; i < tiles.length; i++){
		let t = tiles[i];
		let im = new Image(16, 16);
		im.src = t.children[0].src;

		context.drawImage(im, t.getAttribute("x")*8, t.getAttribute("y")*8, 8, 8);
	}
}

let tool = 1;

let erase = false;
let floor = false;

let initTheme = true;

let fToggle = false;

let tiles;
window.onload = () => {
	let root = document.querySelector(":root");

	let mapContainer = element("mapContainer");
	let nightCheck = element("nightCheck");

	let chooseFile = element("chooseFile");

	let name = element("name");

	let down = element("D");
	let left = element("L");
	let up = element("U");
	let right = element("R");

	let buttons = classes("toolButton");

	let brush = element("brush");
	let line = element("line");
	let rect = element("rect");
	let fill = element("fill");

	let floorToggle = element("mode");

	let openB = element("open");
	let save = element("save");
	let undoB = element("undo");
	let redoB = element("redo");

	let newFile = element("new_file");

	let biome = element("biome");

	let canvas = element("canvas");
	let context = canvas.getContext("2d");

	let popup = element("popup");
	let exit = element("exit");

	let help = element("help");

	let px = py = -1;
	let cpx = cpy = -1;

	let clicked = false;

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

	for(let i = 0; i < buttons.length; i++){
		let url = "./resources/icons/" + buttons[i].id + ".png";

		checkIfImageExists(url, e => {
			if(e) {
				buttons[i].src = url;
			} else {
				buttons[i].src = url.replace(".png", "1.png");
			}
		});

		buttons[i].title = ""

		let sp = buttons[i].id.split("_");
		buttons[i].title += capitalize(sp[0]) + " ";

		for(let n = 1; n < sp.length; n++){
			buttons[i].title += sp[n] + " ";
		}

		if(buttons[i].title.includes("Fill")) buttons[i].title = "Fill (please avoid using this in very big/small areas)"
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

	help.onclick = () => {
		window.open("./resources/help.pdf");
	}

	floorToggle.onclick = () => {
		floor = !floor;
		floorToggle.src = "./resources/icons/mode" + (floor + 1) + ".png";
	}

	save.onclick = () => {
		let conn = "";
		if(down.checked) conn += "D";
		if(left.checked) conn += "L";
		if(up.checked) conn += "U";
		if(right.checked) conn += "R";

		let data = tilesAsWRDv2(name.value, biome.value, conn, tiles);

		let blob = new Blob([data], { type: "text/plain;charset=utf-8" });
		saveAs(blob, name.value.toLowerCase().replace(" ", "_") + ".txt", { type: "text/plain;charset=utf-8" });
	}

	openB.onclick = () => {
		chooseFile.click();
	}

	chooseFile.addEventListener("change", () => {
		let file = chooseFile.files[0];

		file.text().then(e => {
			loadWRDv2(e, name, biome, [down, left, up, right], tiles);
		});

		chooseFile.value = "";
	});

	undoB.onclick = () => undo(tiles);
	redoB.onclick = () => redo(tiles);

	visualize.onclick = () => {
		fillCanvas(tiles, canvas, context);

		popup.style.display = "flex";
	}

	exit.onclick = () =>{
		popup.style.display = "none";
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
			n2.src = "./resources/tiles/B.png"
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

	tiles = classes("tile");
	recordChange(tiles);

	newFile.onclick = () => {
		if(confirm("Are you sure you want to clear your canvas?")){
			for(let i = 0; i < tiles.length; i++){
				tiles[i].setAttribute("block", "B");
			}
			updateAll(tiles);
		}
	}

	mapContainer.addEventListener("pointerdown", e => {
		clicked = true;
		erase = e.which == 3;

		let p = getCursorTileE(e, mapContainer);

		if(tiles[getPos(p[0]-1, p[1]-1)].className.includes("activePath")) return;
		if(!inRange(getPos(p[0]-1, p[1]-1))) return;

		if(tool == 1){
			paintTile(tiles, floor, erase, p[0], p[1]);
		} else if (tool == 4) {
			if(tiles[getPos(p[0]-1, p[1]-1)].getAttribute("block") == "s") return;
			recordChange(tiles);
			floodFill(tiles, floor, erase, p[0], p[1], tiles[getPos(p[0], p[1])].getAttribute("block"), []);
			updateAll(tiles);
		} else {
			if(cpx != -1){
				if(tool == 2){
					paintArray(tiles, floor, erase, getLine(p[0], p[1], cpx, cpy, 100));
				} else if(tool == 3){
					let xm = (p[0] < cpx) ? p[0] : cpx;
					let ym = (p[1] < cpy) ? p[1] : cpy;
					let xM = (p[0] > cpx) ? p[0] : cpx;
					let yM = (p[1] > cpy) ? p[1] : cpy;

					for(let xx = xm; xx <= xM; xx++){
						for(let yy = ym; yy <= yM; yy++){
							paintTile(tiles, floor, erase, xx, yy, false);
						}
					}

					for(let xx = xm; xx <= xM; xx++){
						for(let yy = ym; yy <= yM; yy++){
							if(xx == xm || xx == xM || yy == ym || yy == yM) updateArea(tiles, xx-1, yy-1);
							else updatePos(tiles, xx-1, yy-1);
						}
					}
				}

				tiles[getPos(cpx - 1, cpy - 1)].style.filter = "brightness(1.0)";
				cpx = cpy = -1;
			} else if(tool < 4) {
				let p = getCursorTileE(e, mapContainer);
				cpx = p[0];
				cpy = p[1];

				tiles[getPos(cpx - 1, cpy - 1)].style.filter = "brightness(10.0)";
			}
		}
	});

	mapContainer.addEventListener("pointerup", e => {
		if(clicked && tool != 4) {
			recordChange(tiles);
		}
		if(floor) updateAll(tiles);
		clicked = false;
		px = py = -1;
	});

	mapContainer.addEventListener("pointerleave", e => {
		if(clicked) recordChange(tiles);
		if(floor) updateAll(tiles);
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
					paintArray(tiles, floor, erase, getLine(px, py, x, y));
				}
			}

			px = x;
			py = y;
		}
	});

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
}

window.onbeforeunload = function() {
	return 1;
};
