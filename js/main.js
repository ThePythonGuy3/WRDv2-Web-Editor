let size = [50, 36];
let opening = 2; // *2

let isOpening = (x, y) => {
	if((x == 0 || x == size[0] - 1) && y >= size[1] / 2 - opening && y <= size[1] / 2 + opening - 1) return x == 0 ? 2 : 4;

	if((y == 0 || y == size[1] - 1) && x >= size[0] / 2 - opening && x <= size[0] / 2 + opening - 1) return y == 0 ? 3 : 1;

	return 0;
}

let element = id => {
	return document.getElementById(id);
}

let classes = className => {
	return document.getElementsByClassName(className);
}

let create = type => {
	return document.createElement(type);
}

let actOnPath = (path, hide) => {
	let elems = classes("tilePath");

	for(let i = 0; i < elems.length; i++){
		if(elems[i].getAttribute("wall") == path) {
			elems[i].className = "tile tilePath";
			if(hide) elems[i].className += " activePath";
		}
	}
}

let paintTile = (tiles, x, y) => {
	for(let i = 0; i < tiles.length; i++){
		if(tiles[i].getAttribute("x") == x - 1 && tiles[i].getAttribute("y") == y - 1){
			if(tiles[i].className.includes("activePath")) break;
			tiles[i].children[0].src = "./resources/tiles/C.png";
			break;
		}
	}
}

let zoom = 1;
const z_speed = 0.2;

let tool = 1;

let clearTools = root => {
	root.style.setProperty("--brush-color", "#BEBEBE");
	root.style.setProperty("--line-color", "#BEBEBE");
	root.style.setProperty("--rect-color", "#BEBEBE");
	root.style.setProperty("--select-color", "#BEBEBE");
};

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
	let select = element("select");

	down.onchange = () => {
		actOnPath(1, down.checked);
	}

	left.onchange = () => {
		actOnPath(2, left.checked);
	}

	up.onchange = () => {
		actOnPath(3, up.checked);
	}

	right.onchange = () => {
		actOnPath(4, right.checked);
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

	select.onclick = () => {
		tool = 4;

		clearTools(root);

		root.style.setProperty("--select-color", getComputedStyle(root).getPropertyValue("--button-bg-active"));
	}

	nightCheck.onchange = () => {
		root.style.setProperty("--bg-color", nightCheck.checked ? "#0D1117" : "#FEFEFE");
		root.style.setProperty("--text-color", nightCheck.checked ? "#DEDEDE" : "#303030");

		root.style.setProperty("--button-bg-hover", nightCheck.checked ? "#DEDEDE" : "#AEAEAE");
		root.style.setProperty("--button-bg-active", nightCheck.checked ? "#FEFEFE" : "#8E8E8E");
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

	mapContainer.addEventListener("pointermove", e => {
		if(clicked) {
			let rect = mapContainer.getBoundingClientRect();

			let x = parseInt((parseInt(e.clientX - rect.left) - 3) / 12) + 1;
			let y = parseInt((parseInt(e.clientY - rect.top) - 3) / 12) + 1;
			
			if(x > 50) x = 50;
			if(y > 36) y = 36;

			paintTile(tiles, x, y);
		}
	});
}