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

let zoom = 1;
const z_speed = 0.2;
window.onload = () => {
	let root = document.querySelector(":root");

	let mapContainer = element("mapContainer");
	let nightCheck = element("nightCheck");

	let down = element("D");
	let left = element("L");
	let up = element("U");
	let right = element("R");

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

	nightCheck.onchange = () => {
		root.style.setProperty("--bg-color", nightCheck.checked ? "#202030" : "#FEFEFE");
		root.style.setProperty("--text-color", nightCheck.checked ? "#FEFEFE" : "#303030");
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
			}

			n.style.left = x * 12 + 4 + "px";
			n.style.top = y * 12 + "px";

			n.setAttribute("x", x);
			n.setAttribute("y", y);

			n.appendChild(n2);
			mapContainer.appendChild(n);
		}
	}
}