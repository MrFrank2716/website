// Import 'font awesome' if it is not already loaded in the page
if (!$("link[href='https://mrgarretto.com/css/font-awesome.min.css']").length)
    $('<link rel="stylesheet" href="https://mrgarretto.com/css/font-awesome.min.css">').appendTo("head");

// See if the navbar should be invisible to start out with

var thisScript = $('script[src*=navbar]');
invisibleInitially = thisScript.attr('invisible');
var visibilityStr = '';

if (invisibleInitially !== undefined) {
	visibilityStr = ';visibility:hidden';
}


navContainer = document.getElementById('nav-container');
navContainer.innerHTML = navContainer.innerHTML + "";
navContainer.innerHTML = navContainer.innerHTML + "<style>#nav-menubutton{display:none;color:white;font-size:24px;margin-left:20px;text-align:left}#nav-menubutton:hover{cursor:pointer;color:#F19D55}#holiday-backdrop{position:fixed;margin:0px;top:0;left:0;z-index:-10}#holiday-backdrop-snowflake{position:fixed;display:none}#nav-yt-link{transition:0.3s}#nav-yt-link:hover{margin-top:3px}#nav{top:0;left:0;background-color:#262626;position:fixed;width:100%;padding-top:5px;border-bottom:1px solid #151515;box-shadow:inset 0px -1px #383838;z-index:1000;height:34px;margin-top:0;margin-bottom:0;display:inline" + visibilityStr + "}#nav ul{text-align:left;margin-bottom:2px;margin-top:0}#nav ul:hover{cursor:default}#nav-linkcontainer{font-family: Helvetica;}#nav-linkcontainer:not(.nav-linkcontainer-mobile) .hnav-all li{display:inline;list-style:none;font-family:'Ubuntu',sans-serif;font-size:19px;margin-left:2%}.hnav-all{margin-top:-10px;padding-bottom:15px}#nav ul li{text-decoration:none;color:#CCC;-o-transition:.25s;-ms-transition:.25s;-moz-transition:.25s;-webkit-transition:.25s;transition:.25s}#nav ul li:hover{color:#FF8F45;border-bottom:5px solid #FF8F45;cursor:pointer}.drop-menu{position:fixed;background-color:#3A3A3A;border-bottom:6px solid #2F2F2F;padding-left:15px;padding-right:15px;z-index:999;top:-2000px;box-shadow:3px 3px 3px #25323E;-o-transition:.35s;-ms-transition:.35s;-moz-transition:.35s;-webkit-transition:.35s;transition:.35s;text-align:left}.drop-menu ul li{list-style:none;color:#CFCFCF;margin-bottom:8px;border-bottom:1px solid #313131}.drop-menu ul{margin-top:8px;padding:0;padding-left:10px}.drop-menu h4{margin-top:10px;font-family:'Ubuntu', sans-serif;font-size:19px;color:#E6E6E6;border-bottom:2px solid #2F2F2F;margin-bottom:0;text-shadow:2px 2px #000;font-weight:500}.drop-menu a{text-decoration:none;font-family:'Asap', 'Helvetica';font-size:16px;color:#ECFFFF;margin-top:5px;-o-transition:.2s;-ms-transition:.2s;-moz-transition:.2s;-webkit-transition:.2s;transition:.2s}.drop-menu a:hover{color:#E86C19;margin-left:10px}.nav-linkcontainer-mobile{width:100%;background-color:#353535;padding-left:0px}.nav-linkcontainer-mobile .hnav-all li{font-size: 24px;display: block;width: 100%;border-bottom: 3px solid #262626;padding-left: 8%;}</style>";
navContainer.innerHTML = navContainer.innerHTML + '<div id="nav"><a id="nav-yt-link" style="float:right;display:inline-block;margin-right:20px" href="https://mrgarretto.com/php/youtubelink.php"><img src="https://mrgarretto.com/images/youtubelogo.png" width="50" height="30"></a><a id="nav-yt-link" style="float:right;display:inline-block;margin-right:12px" href="https://mrgarretto.com/php/patreonlink.php"><img src="https://mrgarretto.com/images/patreon.png" width="30" height="30"></a><div id="nav-menubutton"><i class="fa fa-bars" aria-hidden="true"></i></div><ul id="nav-linkcontainer"><span id="nav-home" class="hnav-home hnav-all"><li>Home</li></span><span id="nav-tools" class="hnav-tools hnav-all"><li>Tools</li></span><span id="nav-games" class="hnav-games hnav-all"><li>Games</li></span><span id="nav-random" class="hnav-random hnav-all"><li>Experiments</li></span><span id="nav-projects" class="hnav-projects hnav-all"><li>One command</li></span><span id="nav-info" class="hnav-info hnav-all"><li id="nav-info">Info</li></span></ul></div>';

navContainer.innerHTML = navContainer.innerHTML +
'<div id="drop-tools" class="hnav-tools drop-menu">'+
	'<h4>Minecraft Generators</h4>'+
	'<ul>'+
		'<li><a href="https://mrgarretto.com/model">Armor Stand Modeler & Animator</a></li>'+
		'<li><a href="https://mrgarretto.com/cmdcombinerpro">Command Combiner Pro</a></li>'+
		'<li><a href="https://mrgarretto.com/cmdcombiner">Command combiner generator</a></li>'+
		'<li><a href="https://mrgarretto.com/mcmidi">MIDI Songs to Commands Generator</a></li>'+
		'<li><a href="https://mrgarretto.com/convert-1-12">1.11 to 1.12 Command Converter</a></li>'+
		'<li><a href="https://mrgarretto.com/entityconverter">1.10 to 1.11 Entity command converter</a></li>'+
		'<li><a href="https://mrgarretto.com/movetowards">Move towards generator</a></li>'+
		'<li><a href="https://mrgarretto.com/facemotion">Facing motion generator</a></li>'+
	'</ul>'+
	'<h4>Minecraft Filters</h4>'+
	'<ul>'+
		'<li><a href="https://mrgarretto.com/filter/entityconverter">Convert commands to 1.11</a></li>'+
		'<li><a href="https://mrgarretto.com/filter/structurecmd">Structure to Command filters</a></li>'+
	'</ul>'+
	'<h4>Building Tools</h4>'+
	'<ul>'+
		'<li><a href="https://mrgarretto.com/blockcolors">Block color grouper</a></li>'+
	'</ul>'+
'</div>'+
'<div id="drop-games" class="hnav-games drop-menu">'+
	'<h4>Minecraft Maps</h4>'+
	'<ul>'+
		'<li><a href="https://mrgarretto.com/maps?map=impossible-getaway">Impossible Getaway</a></li>'+
		'<li><a href="https://mrgarretto.com/maps?map=destructiveworms">Destructive Worms</a></li>'+
		'<li><a href="https://mrgarretto.com/maps?map=extremegolf">Extreme Golf</a></li>'+
		'<li><a href="https://mrgarretto.com/maps?map=trickortreat">Trick or Treat</a></li>'+
		'<li><a href="https://mrgarretto.com/maps?map=soccercars">Soccer Cars</a></li>'+
		'<li><a href="https://mrgarretto.com/maps?map=hologramparkour">Hologram Parkour</a></li>'+
		// '<li><a href="https://mrgarretto.com/maps?map=platformparty">Platform Party</a></li>'+
		// '<li><a href="https://mrgarretto.com/maps?map=windfall2">Windfall 2</a></li>'+
	'</ul>'+
	// '<h4>Simple online</h4>'+
	// '<ul>'+
	// 	'<li><a href="https://mrgarretto.com/games/paths">Paths</a></li>'+
	// 	'<li><a href="https://mrgarretto.com/e/pong">Pong</a></li>'+
	// 	'<li><a href="https://mrgarretto.com/games/chaos">Chaos</a></li>'+
	// 	'<li><a href="https://mrgarretto.com/games/dodge">Dodge</a></li>'+
	// 	'<li><a href="https://mrgarretto.com/games/scramble">Scramble</a></li>'+
	// '</ul>'+
	'<h4>Random</h4>'+
	'<ul>'+
		'<li><a href="https://mrgarretto.com/secret">Secret code translator</a></li>'+
	'</ul>'+
'</div>'+
'<div id="drop-random" class="hnav-random drop-menu">'+
	'<ul>'+
		'<li><a href="https://mrgarretto.com/e/strings">Strings</a></li>'+
		'<li><a href="https://mrgarretto.com/e/japanese">Japanese Names</a></li>'+
		'<li><a href="https://mrgarretto.com/checkbrackets">Check Brackets</a></li>'+
	'</ul>'+
'</div>'+
'<div id="drop-projects" class="hnav-projects drop-menu">'+
	'<h4>One-command<br>creations</h4>'+
	'<ul>'+
		'<li><a href="https://mrgarretto.com/cmd/rvcampers">RV Campers</a></li>'+
		'<li><a href="https://mrgarretto.com/cmd/presents">Present Delivery</a></li>'+
		'<li><a href="https://mrgarretto.com/cmd/pingpong">Table Tennis</a></li>'+
		'<li><a href="https://mrgarretto.com/cmd/airships">Archimede\'s Airships</a></li>'+
		'<li><a href="https://mrgarretto.com/cmd/minions">Minions</a></li>'+
		'<li><a href="https://mrgarretto.com/cmd/utilities">More Utilities</a></li>'+
		'<li><a href="https://mrgarretto.com/cmd/thor">Thor</a></li>'+
		'<li><a href="https://mrgarretto.com/cmd/spygear">Spy Gear</a></li>'+
		'<li><a href="https://mrgarretto.com/cmd/darksouls">Dark Souls</a></li>'+
		'<li><a href="https://mrgarretto.com/cmd/rocketships">Rocket Ships</a></li>'+
		'<li><a href="https://mrgarretto.com/cmd/earthbending">Earth Bending</a></li>'+
		'<li><a href="https://mrgarretto.com/cmd/pyroitems">Pyro Items</a></li>'+
		'<li><a href="https://mrgarretto.com/cmd/ropeladders">Rope Ladders</a></li>'+
		'<li><a class="all-oc" href="https://mrgarretto.com/allcmds" style="color: #FFB586">All One Command Creations</a></li>'+
	'</ul>'+
'</div>';


// Beginning of holiday backdrop effect code

$('body').append('<canvas id="holiday-backdrop"></canvas><img id="holiday-backdrop-snowflake" src="https://mrgarretto.com/images/snowflake.png" width="20" height="20">');
canvas = document.getElementById('holiday-backdrop');
ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

holidayBackdrop = {
	snowflakes: [],
	snowflaketimer: 200,
	snowflakesize: 12,
	snowflakespeed: 0.3,
	snowflakeimg: document.getElementById("holiday-backdrop-snowflake"),
}

function updateBackdrop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	holidayBackdrop.snowflaketimer--;
	if (holidayBackdrop.snowflaketimer < 0) {
		holidayBackdrop.snowflaketimer = 200;
		holidayBackdrop.snowflakes[holidayBackdrop.snowflakes.length] = {
			x: Math.floor((Math.random() * canvas.width) - (holidayBackdrop.snowflakesize / 2)),
			y: -holidayBackdrop.snowflakesize,
		}
	}

	ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
	for (var sf = 0; sf < holidayBackdrop.snowflakes.length; sf++) {
		holidayBackdrop.snowflakes[sf].y += holidayBackdrop.snowflakespeed;

		ctx.drawImage(holidayBackdrop.snowflakeimg, holidayBackdrop.snowflakes[sf].x, holidayBackdrop.snowflakes[sf].y, holidayBackdrop.snowflakesize, holidayBackdrop.snowflakesize);
		if (holidayBackdrop.snowflakes[sf].y > canvas.height)
			holidayBackdrop.snowflakes.splice(sf, 1);
	}

	window.requestAnimationFrame(updateBackdrop);
}

window.requestAnimationFrame(updateBackdrop);

// End of holiday backdrop effect code

// 262

var dropdownMenuTop = '40px';


function subtractTop(elementId) {
	var height = document.getElementById(elementId).clientHeight;
	document.getElementById(elementId).style.top = (-60-height) + 'px';
}

addEventToClass('hnav-tools', 'mouseenter', function() {
	document.getElementById('drop-tools').style.top = dropdownMenuTop;
});
addEventToClass('hnav-tools', 'mouseleave', function() {
	document.getElementById('drop-tools').style.top = subtractTop('drop-tools');
});

addEventToClass('hnav-games', 'mouseenter', function() {
	document.getElementById('drop-games').style.top = dropdownMenuTop;
});
addEventToClass('hnav-games', 'mouseleave', function() {
	document.getElementById('drop-games').style.top = subtractTop('drop-games');
});

addEventToClass('hnav-random', 'mouseenter', function() {
	document.getElementById('drop-random').style.top = dropdownMenuTop;
});
addEventToClass('hnav-random', 'mouseleave', function() {
	document.getElementById('drop-random').style.top = subtractTop('drop-random');
});

addEventToClass('hnav-projects', 'mouseenter', function() {
	document.getElementById('drop-projects').style.top = dropdownMenuTop;
});
addEventToClass('hnav-projects', 'mouseleave', function() {
	document.getElementById('drop-projects').style.top = subtractTop('drop-projects');
});

// Link nav buttons
document.getElementById("nav-home").addEventListener('click', function() {
	window.location.href = "https://mrgarretto.com";
});
document.getElementById("nav-info").addEventListener('click', function() {
	if (typeof navBar_infoHome === 'undefined') {
		window.location.href = "https://mrgarretto.com?sub=info";
	}
});

function addEventToClass(classname, eventname, inputfunction) {
	var targetClass = document.getElementsByClassName(classname);

	for (var i = 0; i < targetClass.length; i++) {
	    targetClass[i].addEventListener(eventname, inputfunction, false);
	}
}

//Make drop menus in the right place
function getX(elementId) {
	var element = document.getElementById(elementId);
	var position = element.getBoundingClientRect();
	var x = position.left;
	return x;
}

document.getElementById('drop-tools').style.left = getX('nav-tools') + 'px';
document.getElementById('drop-games').style.left = getX('nav-games') + 'px';
document.getElementById('drop-random').style.left = getX('nav-random') + 'px';
document.getElementById('drop-projects').style.left = getX('nav-projects') + 'px';

var getDropMenu = document.getElementsByClassName('drop-menu');
Array.prototype.forEach.call(getDropMenu, function(el) {
    // Do stuff here
    subtractTop(el.id);
});

// Finally, if the navbar was initially invisible, make visility:visible now, and display:hidden

if (invisibleInitially !== undefined) {
	$('#nav').css('display', 'none');
	$('#nav').css('visibility', 'visible');
}

function updateNavbarLayout() {
	if (window.innerWidth < 640)
	{
		// The window is too small to fit all items in one line in the navbar

		$('#nav-menubutton').show();
		$('#nav-linkcontainer').hide();

		$('#nav-linkcontainer').addClass('nav-linkcontainer-mobile');

		dropdownMenuTop = '260px';

		$('.drop-menu').css('left', '10%');
	} else {
		$('#nav-menubutton').hide();
		$('#nav-linkcontainer').show();

		$('#nav-linkcontainer').removeClass('nav-linkcontainer-mobile');

		dropdownMenuTop = '40px';

		document.getElementById('drop-tools').style.left = getX('nav-tools') + 'px';
		document.getElementById('drop-games').style.left = getX('nav-games') + 'px';
		document.getElementById('drop-random').style.left = getX('nav-random') + 'px';
		document.getElementById('drop-projects').style.left = getX('nav-projects') + 'px';
	}
}

$(document).ready(function() {
	updateNavbarLayout();
});

window.addEventListener('resize', updateNavbarLayout); // Update the navbar layout every time the window is resized

$('#nav-menubutton').click(function() {
	// When the screen is small and the user clicks on the 3-bar menu icon
	if($('#nav-linkcontainer:visible').length == 0) {
		$('#nav-linkcontainer').show();
	} else {
		$('#nav-linkcontainer').hide();
	}

});