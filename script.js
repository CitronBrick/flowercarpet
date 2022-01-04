var stage;

var colorList = [
	'crimson','tomato','firebrick','darkred','plum','thistle','orchid','darkorchid',
	// 'limegreen','palegreen',
	'sandybrown','NavajoWhite',
	'mistyrose','yellow','skyblue','royalblue','blueviolet','mediumslateblue','yellowgreen','moccasin','peachpuff','indianred',
	'palevioletred','cornflowerblue','powderblue','pink','lightpink','lightsalmon'
];



function findDescendantsByName(ancestor,name) {
	var res = [];
	var stack = [ancestor];
	while(stack.length) {
		var obj = stack.pop();
		if(obj.name == name) {
			res.push(obj);
		}
		if(obj.children) {
			for(let c of obj.children) {
				stack.push(c);
			}
		}
	}
	return res;
}



class Petal extends createjs.Shape {

	constructor(x,y,color,w=100,h=50) {
		super();
		this.graphics.f(color).de(0,-25,w,h).ef();
	}
}

class SimpleFlower extends createjs.Container {

	constructor(x,y,nbPetals=5,color='mediumvioletred') {
		super();
		this.set({x,y,nbPetals,scale:0.3});
		var core = new createjs.Shape();
		core.graphics.f('gold').dc(0,0,10).ef();
		for(var i = 0; i < nbPetals;i++) {
			// var petal = new createjs.Shape();
			// petal.graphics.f(color).de(0,-25,100,50).ef();
			var petal = new Petal(0,0,color);
			petal.rotation = (360/nbPetals)*i;
			petal.name = 'petal';
			this.addChild(petal);
		}
		this.setBounds(-55,-55,110,110);
		this.addChild(core);
		this.angle = random(360); 
		this.bloom();
	}

	bloom() {
		var waitingTime = Math.floor(Math.random()*1000);
		this.children.filter(c=>c.name == 'petal').forEach((p)=>{
			p.scale =0;
			createjs.Tween.get(p).wait(waitingTime).to({scale:1},1000, createjs.Ease.circOut).on('change',(e)=>{
				// console.log('eee');
				// console.log(e.target.target.scale);
			});
		});
		this.rotation = -45;
		createjs.Tween.get(this).to({rotation: this.angle} ,1000);
	}
}

class Tulip extends createjs.Container {

	constructor(x,y,color='crimson') {
		super();
		this.set({x,y,scale:1});
		/*var semicircle = new createjs.Shape();
		semicircle.graphics.f(color)*/
		var bottomPart = new createjs.Shape();
		var width = 50;
		var curveY = -30;
		var rectY = -50;
		// var graphics = bottomPart.graphics.f(color).s(color).mt(-width/2, -100).lt(-width/2,-50).a(0,-50,width/2,0,Math.PI,false).lt(width/2,-50).lt(width/2,-100).lt(-width/2,-100).es().ef();
		var graphics = bottomPart.graphics.f(color).s(color).mt(-width/2,rectY).lt(-width/2,curveY).a(0,curveY,width/2,0,Math.PI,false);
		graphics.lt(width/2,curveY).lt(width/2,rectY).lt(-width/2,rectY).es().ef();
		
		var petalGroup = drawTriangles({x:-width/2,y:rectY},{x:width/2,y:rectY},3,20,color);
		this.addChild(bottomPart,petalGroup);
	}	
}

function drawTriangles(p1,p2,nb,height,color) {
	var res = new createjs.Container();
	res.set({x:p1.x,y:p1.y});
	var petalWidth = Math.abs((p2.x-p1.x)/nb);

	for(var i = 0; i < (nb*2); i++) {
		var demiPetal = new createjs.Shape();
		demiPetal.graphics.s(color).f(color);
		if(i%2) {
			// slant up
			demiPetal.graphics.mt(i*petalWidth/2, 0).lt((i+1)*petalWidth/2, -height).lt((i+1)*petalWidth/2, 0).lt(i*petalWidth/2,0)
		} else {
			// slant down
			demiPetal.graphics.mt(i*petalWidth/2, 0).lt(i*petalWidth/2, -height).lt((i+1)*petalWidth/2, 0).lt(i*petalWidth/2,0).es().ef();
		}
		demiPetal.graphics.es().ef();
		res.addChild(demiPetal);
	}
	return res;
}

function random(n) {
	return ~~(Math.random() * n);
}

function getRandomColor() {
	return colorList[Math.floor(Math.random()*colorList.length)];
}

class FlowerCarpet extends createjs.Container {


	constructor() {
		super();
		this.carpetList = [];
		for(var i = 0; i < 40; i++) {
			for(var j = 0; j < 50; j++) {
				var nbPetals = Math.floor(Math.random()*3) + 4;
				// var f = new SimpleFlower(i*50,j*60,nbPetals, getRandomColor());
				var f = new SimpleFlower(i*30,j*40,nbPetals, getRandomColor());
				this.carpetList.push(f);
				this.addChild(f);
			}
		}

	}



	moveAwayFrom(centralArea, clbk) {
		var centralAreaBounds = centralArea.getBounds();
		centralArea.set({bottomX: centralArea.x + centralAreaBounds.x + centralAreaBounds.width, bottomY: centralArea.y + centralAreaBounds.y + centralAreaBounds.height});
		var centralFlowers = this.carpetList.filter(f=>{
			var bounds = f.getBounds();
			f.set({bottomX: f.x + bounds.x + bounds.width, bottomY: f.y + bounds.y + bounds.height});
			f.set({topX: f.x + bounds.x , topY: f.y + bounds.y });
			return (f.topX > centralArea.x && f.bottomX < centralArea.bottomX && f.topY > centralArea.y && f.bottomY < centralArea.bottomY )
		}).forEach((f,i)=>{
			// f.visible = false;
			var x = (f.x < (centralArea.x + centralAreaBounds.width/2))?(centralArea.x - 50): (centralArea.x + centralAreaBounds.width+ 50);
			var tw = createjs.Tween.get(f).to({x: x},1000);
			if(!i) {
				tw.on('complete', clbk);
			}
		});
		// console.log(cen)/
	}
}

function makeFlowerCarpet() {
	var carpetList = [];
	for(var i = 0; i < 40; i++) {
		for(var j = 0; j < 50; j++) {
			var nbPetals = Math.floor(Math.random()*3) + 4;
			var f = new SimpleFlower(i*50,j*60,nbPetals, getRandomColor());
			carpetList.push(f);
			stage.addChild(f);
		}
	}

	/*carpetList.forEach((f,i)=>{
		createjs.Tween.get(f)
	})*/
}



class Message extends createjs.Container {

	constructor(msg) {
		super();
		this.text = new createjs.Text(msg, '20px Arial', 'aquamarine');
		this.addChild(this.text);
	}
}

function makeCentralArea() {


	var centralArea = new createjs.Container();
	centralArea.widthRatio = 0.6;
	centralArea.heightRatio = 0.3;

	// var [x,y] = [150,150];
	var [x,y] = [(stage.canvas.width - centralArea.widthRatio * stage.canvas.width)/2, (stage.canvas.height - stage.canvas.height * centralArea.heightRatio)/2];
	centralArea.set({x,y});
	var bounds = [0,0, stage.canvas.width*centralArea.widthRatio, stage.canvas.height* centralArea.heightRatio];
	console.log(bounds);
	centralArea.setBounds(...bounds);
	var fond = new createjs.Shape();
	fond.setBounds(0,0,bounds[2],bounds[3]);
	fond.graphics.f('transparent').dr(0,0,bounds[2],bounds[3]).ef();
	centralArea.addChild(fond);

	var mask = new createjs.Shape();
	mask.set({x,y});
	mask.graphics.f('red').dr(...bounds).ef();
	centralArea.mask = mask;
	console.log(centralArea.children[0]);
	// console.log(mask);
	return centralArea;
}

function makeFallingTulips(centralArea) {
	for(var i = 0; i < 10; i++) {
		for(var j = 0; j < 40; j++) {
			// let tulip = new Tulip(i*30,  j*-50);
			var color = colorList[random(colorList.length)];
			let tulip = new Tulip(j*30,  i*-50, color);
			tulip.scale = (4+random(3))/10;
			centralArea.addChild(tulip);		
			var speed = (random(20)/10 + 5)/10; 
			var time =( 300-i*-50 )/speed;
			createjs.Tween.get(tulip).to({y:380},time);
		}
	}
}



var tulip,centralArea;
window.addEventListener('load',()=>{
	createjs.MotionGuidePlugin.install();
	var canvas = document.querySelector('canvas');

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	stage = new createjs.Stage(canvas);

	tulip = new Tulip(200,500,'crimson');
	tulip.scale=1;

	var sf1 = new SimpleFlower(300,100,6,'papayawhip');


	// black background
	var bg = new createjs.Shape();
	bg.graphics.f('black').dr(0,0,canvas.width,canvas.height).ef();

	var fc = new FlowerCarpet();
	stage.addChild(bg, tulip,sf1, new Message("HML"), fc);


	centralArea = makeCentralArea();
	fc.moveAwayFrom(centralArea,()=> {
		makeFallingTulips(centralArea);
	});


	stage.addChild(centralArea);



	

	




	
	createjs.Ticker.on('tick', stage);
	
});