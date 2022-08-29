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
		var bounds = this.getBounds();
		this.set({bottomX: this.x + bounds.x + bounds.width, bottomY: this.y + bounds.y + bounds.height});
		this.set({topX: this.x + bounds.x , topY: this.y + bounds.y });
	}

	static size = 55;

	isInside(centralArea) {
		return (this.topX > centralArea.x && this.bottomX < centralArea.bottomX && this.topY > centralArea.y && this.bottomY < centralArea.bottomY )

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

		var nbPetals = random(3)+2;
		var petalGroup = drawTriangles({x:-width/2,y:rectY},{x:width/2,y:rectY},nbPetals,15,color);
		this.addChild(bottomPart,petalGroup);
	}	

	fallSlowly(clbk) {
		this.set({dx:5, dy:2});
		createjs.Tween.get(this).to({y:'+300'},2400);
		var horiTween = createjs.Tween.get(this).to({x:'+25'},1000, createjs.Ease.sineIn);
		horiTween.to({x:'-25'},1000, createjs.Ease.sineOut).call(clbk);
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

function randomBetween(a,b) {
	return a+random(b-a);
}

function getRandomColor() {
	return colorList[Math.floor(Math.random()*colorList.length)];
}

function distance(p1,p2) {
	return Math.hypot((p1.x-p2.x), (p1.y - p2.y));
}

class FlowerCarpet extends createjs.Container {


	
	constructor() {
		super();
		this.carpetList = [];
		for(var i = 0; i < (stage.canvas.width/30 + 1); i++) {
			for(var j = 0; j < (stage.canvas.height/40+1); j++) {
				var nbPetals = Math.floor(Math.random()*3) + 4;
				var f = new SimpleFlower(i*30,j*40,nbPetals, getRandomColor());
				this.carpetList.push(f);
				this.addChild(f);
			}
		}
		this.on('mousedown',this.ripple);
		this.on('pressmove',this.ripple);
		this.on('mouseover',this.ripple);
	}

	ripple=(evt)=> {
		let x = evt.localX;
		let y = evt.localY; 
		let rayon = 30;
		let flowerList = this.children.filter(f=>{
			return distance(f,{x,y}) < rayon;
		})
		flowerList.forEach((f,i)=>{
			f.set({initialX: f.x, initialY: f.y});
			f.set({finalX: ((f.x < x)?'-':'+')+  (rayon-Math.abs(f.x - x)), finalY: ((f.y < y)?'-':'+')+(rayon-Math.abs(f.x - x))});
			
			createjs.Tween.get(f,{override: false}).to({x: f.finalX, y: f.finalY},800, createjs.Ease.sineIn).to({x:f.initialX,y:f.initialY},800, createjs.Ease.sineOut);
			// createjs.Tween.get(f).to({alpha: 0}, 1000).to({alpha: 1}, 1000).wait(400).call(()=>{console.log('ici');this.addFlower(x,y)});
		})
	}



	moveAwayFrom(centralArea, clbk) {
		var centralAreaBounds = centralArea.getBounds();
		console.log(centralAreaBounds);
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
	}

	keepBloomingLater(centralArea) {
		console.log(centralArea);
		setInterval(()=>{
			var times = random(2) + 1;
			for(var i = 0; i < times; i++) {
				var x = random(stage.canvas.width);
				var y = random(stage.canvas.height);
				this.addFlower(x,y);
			}	
		},1000);
	}

	addFlower(x,y) {
		var centralAreaIndex = stage.children.findIndex((o=>o.name=='centralArea'));
		var nbPetals = Math.floor(Math.random()*3) + 4;
		var f = new SimpleFlower(x,y, nbPetals, getRandomColor());
		if(f.isInside(centralArea)) {
			return;
		}
		this.carpetList.push(f);
		this.addChild(f);
		f.bloom();
	}


}

function makeFlowerCarpet() {
	var carpetList = [];
	for(var i = 0; i < 40; i++) {
		for(var j = 0; j < 50; j++) {
			var nbPetals = randomBetween(4,7);
			var f = new SimpleFlower(i*50,j*60,nbPetals, getRandomColor());
			carpetList.push(f);
			stage.addChild(f);
		}
	}

	
}





function makeCentralArea() {


	var centralArea = new createjs.Container();
	centralArea.widthRatio = 0.6;
	centralArea.heightRatio = 0.3;




	// var [x,y] = [150,150];
	// var [x,y] = [(stage.canvas.width - centralArea.widthRatio * stage.canvas.width)/2, (stage.canvas.height - stage.canvas.height * centralArea.heightRatio)/2];

	var text = makeMessage();
	stage.addChild(text);

	var metrics = text.getMetrics();
	console.log(metrics);
	var bounds = [0,0, Math.max(metrics.width * 1.4, canvas.width * centralArea.widthRatio), Math.max(metrics.lines.length * metrics.height , canvas.height* centralArea.heightRatio)];

	var [x,y] = [(stage.canvas.width - bounds[2])/2, (stage.canvas.height - bounds[3])/2];
	centralArea.set({x,y, name:'centralArea'});
	console.log(bounds);
	centralArea.setBounds(...bounds);
	console.log(centralArea.getBounds());
	var fond = new createjs.Shape();
	fond.setBounds(...bounds);
	fond.graphics.f('gold').dr(0,0,bounds[2],bounds[3]).ef();
	// centralArea.addChild(fond);

	var mask = new createjs.Shape();
	mask.set({x,y});
	mask.graphics.f('red').dr(...bounds).ef();
	centralArea.mask = mask;

	var border = new createjs.Shape();
	border.set({x:0,y:0,name:'border'});
	border.graphics.ss(15).s('red').dr(...bounds).es();
	// setTimeout(()=>{
		// centralArea.addChild(border);
		console.log('added');
	// },1000);

	return centralArea;
}

function makeFallingTulips(centralArea) {
	for(var i = 0; i < 10; i++) {
		for(var j = 0; j < 40; j++) {
			// let tulip = new Tulip(i*30,  j*-50);
			var color = colorList[random(colorList.length)];
			let tulip = new Tulip(j*30,  i*-50, color);
			tulip.scale = (randomBetween(3,7))/10;
			centralArea.addChild(tulip);		
			var speed = (random(20)/10 + 5)/10; 
			var time =( 300-i*-50 )/speed;
			var tw = createjs.Tween.get(tulip).to({y:380},time).call(()=>{centralArea.removeChild(tulip)});
			if(i == 9 && j == 39) { // last iteration
				tw.call(()=>{
					// addMessage(centralArea);
					createjs.Tween.get(text).to({alpha:1}, 500);
					makeSlowFallingTulips(centralArea);
				})
			}
		}
	}
}

function makeSlowFallingTulips(centralArea) {
	var bounds = centralArea.getTransformedBounds();
	setInterval(()=> {
		var times = random(5);
		for(var k = 0; k < times; k++ ) {
			var color = 'LightPink'; //getRandomColor();
			let tulip = new Tulip(random(bounds.width), 0, color);
			tulip.scale = (1+random(3))/10;
			centralArea.addChild(tulip);		
			tulip.fallSlowly(()=>centralArea.removeChild(tulip));
		}
	},500);
}

function makeMessage() {
	var msg = getMessageFromQueryString() || 'Happy Wedding Anniversary';
	// msg = stage.canvas.width < stage.canvas.height ? msg.replace(/ /g,'\n'): msg;
	msg = msg.replace(/ /g,'\n');
	// var text= new createjs.Text(msg, 'bold 3vh Script MT','RebeccaPurple');
	text= new createjs.Text(msg, 'bold 5vh GreatVibes','RebeccaPurple');
	text.textbaseLine = 'middle';
	text.textAlign = 'center';
	text.shadow = new createjs.Shadow('teal',5,5,10);
	// text.lineHeight = 10;
	var metrics = text.getMetrics();

	text.x = (stage.canvas.width)/2;
	text.y = (stage.canvas.height-metrics.height)/2 ;
	text.alpha = 0;
	console.log(metrics);
	console.log(text.x,text.y);
	return text;
}

function getMessageFromQueryString() {
	var search = window.location.search;
	if(search) {
		var usp = new URLSearchParams(search);
		let msg = usp.get('text');
		if(msg) {
			return atob(msg);
		}
	}
	return '';
}


var tulip,centralArea,canvas,text;
window.addEventListener('load',()=>{
	createjs.MotionGuidePlugin.install();
	createjs.RelativePlugin.install();
	canvas = document.querySelector('canvas');
	stage = new createjs.Stage(canvas);
	createjs.Touch.enable(stage);
	setup();
	createjs.Ticker.on('tick', stage);

	window.addEventListener('orientationchange',()=>{
		stage.removeAllChildren();
		setup();
	});
	
});

function setup() {
	stage.canvas.width = window.innerWidth;
	stage.canvas.height = window.innerHeight;


	tulip = new Tulip(200,500,'crimson');
	tulip.scale=1;

	var sf1 = new SimpleFlower(300,100,6,'papayawhip');


	// black background
	var bg = new createjs.Shape();
	bg.graphics.f('mintcream').dr(0,0,canvas.width,canvas.height).ef();

	var fc = new FlowerCarpet();
	stage.addChild(bg, sf1, fc);
	stage.enableMouseOver(20);


	centralArea = makeCentralArea();
	fc.moveAwayFrom(centralArea,()=> {
		makeFallingTulips(centralArea);
		fc.keepBloomingLater();
	});
	// stage.addChildAt(centralArea,stage.children.length-1);
	stage.addChild(centralArea);	

}