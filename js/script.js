// Audio Initialization
const titlesfx = new Audio('./assets/sfx/pokemonopening.mp3');
const battlesfx = new Audio('./assets/sfx/pokemonbattle.mp3');
const victorysfx = new Audio('./assets/sfx/pokemonvictoryshort.mp3');
const losssfx = new Audio('./assets/sfx/pokemonloss.mp3');
const eatSFX = new Audio('./assets/sfx/eat.ogg');
const faintSFX = new Audio('./assets/sfx/faint2.wav');
const clickSFX = new Audio('./assets/sfx/click.wav');
const bodySlamSFX = new Audio('./assets/sfx/bodyslam.mp3');
const chokeSFX = new Audio('./assets/sfx/choke.mp3');
const fatLaughSFX = new Audio('./assets/sfx/fatlaugh.mp3');
const scratchSFX = new Audio('./assets/sfx/scratch.wav');
const slashSFX = new Audio('./assets/sfx/Slash.wav');
const cuddleSFX = new Audio('./assets/sfx/cuddle.wav');
const megapunchSFX = new Audio('./assets/sfx/megapunch.wav');
const biteSFX = new Audio('./assets/sfx/bite.wav');
const barkSFX = new Audio('./assets/sfx/faint.wav');
const purrSFX = new Audio('./assets/sfx/Sing.wav');
const lickSFX = new Audio('./assets/sfx/lick.wav');

//buttons sounds post game
const fight1SFX = new Audio('./assets/sfx/fight1.mp3');
const fight2SFX = new Audio('./assets/sfx/fight5.mp3');
const fight3SFX = new Audio('./assets/sfx/fight2.mp3');
const fight4SFX = new Audio('./assets/sfx/fight3.mp3');
const fight5SFX = new Audio('./assets/sfx/fight3.mp3');
const fight6SFX = new Audio('./assets/sfx/fight4.mp3');

// Variables
let [playerPokemon, enemyPokemon] = [null, null];
let playerParty = [];
let enemyParty = [];
addListeners();

//load images
const imagesToLoad = [
    './assets/img/nemzback.png',
	'./assets/img/black.png',
	'./assets/img/pkmnvictorylegion.png',
	'./assets/img/pkmnbattle1.png',
	'./assets/img/pkmnbattle2.png',
	'./assets/img/pkmnbattle3.png',
	'./assets/img/nemzback.png',
    './assets/img/cat.png',
    './assets/img/dog.png',
    './assets/img/squirrel.png',
    './assets/img/bear.png',
    './assets/img/lynx.png',
    // ... add any other images here
];

function preloadImages() {
    for(let i = 0; i < imagesToLoad.length; i++) {
        const img = new Image();
        img.src = imagesToLoad[i];
    }
}

document.addEventListener('DOMContentLoaded', preloadImages);

// Helper functions
const getElement = id => document.getElementById(id);
const setElementStyle = (id, prop, value) => getElement(id).style[prop] = value;
const setElementSrc = (id, src) => getElement(id).src = src;
const setElementText = (id, text) => getElement(id).textContent = text;

class Pokemon {
	constructor(pokename, level, maxhealth, moves, imgfront, imgback) {
		this.pokename = pokename;
		this.level = level;
		this.health = maxhealth;
		this.maxhealth = maxhealth;
		this.moves = moves;
		this.imgfront = imgfront;
		this.imgback = imgback;
		this.alive = true;
	}
	decrementHealth(damage) {
		// Store the initial health for animation
		let initialHealth = this.health;
		// Immediately update the Pokémon's actual health
		this.health -= damage;
		if (this.health < 0) this.health = 0;

		const decreaseHealthSmoothly = (targetHealth) => {
			if (initialHealth > targetHealth) {
				initialHealth--;
				updateHealthBars(this, this.owner);
				setTimeout(() => decreaseHealthSmoothly(targetHealth), 15);  // Adjust timing for faster/slower transition
			} else if (this.health <= 0) {
				this.faint();
				if (this.owner === 'player') {
					let nextPokemonIndex = playerParty.findIndex(p => p.alive);
					if (nextPokemonIndex !== -1) {
						playerPokemon = playerParty[nextPokemonIndex];
						playerPokemon.health = playerPokemon.maxhealth;
						showPokemon();
					} else {
						//setTimeout(endGame, 2000);
					}
				}
			}
		};
		decreaseHealthSmoothly(this.health);
	}
	attack(target, move) {
		console.log(move);
		switch (move.name) {
			case 'BODY SLAM':
				bodySlamSFX.play();
				break;
			case 'CHOKE OUT':
				chokeSFX.play();
				break;
			case 'FAT LAUGH':
				fatLaughSFX.play();
				break;
			case 'CUDDLE':
				cuddleSFX.play();
				break;
			case 'BITE':
				biteSFX.play();
				break;
			case 'PURR':
				purrSFX.play();
				break;
			case 'LICK':
				lickSFX.play();
				break;
			case 'SLASH':
				slashSFX.play();
				break;
			case 'MEGA PUNCH':
				megapunchSFX.play();
				break;
			default:
				scratchSFX.play();
				break;
		}
		if (move.target == 'self') {
			this.decrementHealth(Math.round(this.maxhealth * move.damage));
		} else {
		target.decrementHealth(move.damage);
		}
	}
	useItem(target, item) {
		if (item.amount <= 0) {
			console.log(item.name + " is no longer available.");
			return; // exit the function if the item is no longer available
		}
		eatSFX.play();
		if (item.target == 'self') {
			if (item.damage < 0) {
				this.health += Math.abs(item.damage);  // Add health for healing items
			} else {
				this.decrementHealth(item.damage);  // Decrease health for damaging items
			}
			if (this.health > this.maxhealth) { // Ensure health doesn't exceed max health
				this.health = this.maxhealth;
			}
		}
		item.amount--; // decrease the item amount by 1
	}
	faint() {
		if (this.health <= 0) {
			this.alive = false;
			const spriteElement = this.owner === 'player' ? getElement('pkmnback') : getElement('pkmn');

			setTimeout(() => {
				// Hide the sprite after blinking ends
				spriteElement.style.visibility = 'hidden';
				faintSFX.play();
				if (this.owner === 'enemy') {
					faintedMessageShow(playerPokemon.pokename, enemyPokemon.pokename);
					setTimeout(() => { //check if the enemy has Pokémon or if game ends
						let nextEnemyPokemonIndex = enemyParty.findIndex(p => p.alive);
						if (nextEnemyPokemonIndex !== -1) {
							enemyPokemon = enemyParty[nextEnemyPokemonIndex];
							showPokemon();
							// addListeners();  // Bring player back to main menu
						} else {
							setTimeout(endGame('player'), 2000);
						}
					}, 2000);  // 2.5 seconds delay for the message to be read
				} else if (this.owner === 'player') {
					faintedMessageShow(enemyPokemon.pokename, playerPokemon.pokename);
					setTimeout(() => {
						let nextPokemonIndex = playerParty.findIndex(p => p.alive);
						if (nextPokemonIndex !== -1) {
							playerPokemon = playerParty[nextPokemonIndex];
							playerPokemon.health = playerPokemon.maxhealth;
							showPokemon();
						} else {
							setTimeout(endGame('enemy'), 2000);
						}
					}, 2000); // delay to allow the player to read the faint message
				}
			}, 2000); 
		}
	}
};

pokemon = [];
pokemon.push(new Pokemon('NEMZ', 50, 211, [moves['body slam'], moves['choke out'], moves['fat laugh']], './assets/img/blastoise.png', './assets/img/nemzback.png'));
pokemon.push(new Pokemon('CAT', 12, 75, [moves['cuddle'], moves['purr']], './assets/img/cat.png', './assets/img/kadabraback.png'));
pokemon.push(new Pokemon('DOG', 15, 80, [moves['bite'], moves['bark']], './assets/img/dog.png', './assets/img/kadabraback.png'));
pokemon.push(new Pokemon('SQUIRREL', 7, 30, [moves['tackle'], moves['scratch']], './assets/img/squirrel.png', './assets/img/charizardback.png'));
pokemon.push(new Pokemon('BEAR', 30, 120, [moves['slash'], moves['mega punch']], './assets/img/bear.png', './assets/img/charizardback.png'));
pokemon.push(new Pokemon('LYNX', 25, 100, [moves['scratch'], moves['lick']], './assets/img/lynx.png', './assets/img/lynx.png'));

function startButton() {
    setElementStyle('startbutton', 'zIndex', '-1');
    setElementStyle('battle', 'visibility', 'visible');
    setElementStyle('opening', 'zIndex', '1');
    titlesfx.play();
    setTimeout(() => {
        titlesfx.pause();
        preTransitionMessage();
    }, 10000); //change back to 10000
}

function preTransitionMessage() {
    clickSFX.play();
	setElementSrc('ending', './assets/img/pkmnattack.png');
    setElementText('endingtext', "NEMZ had just left SUBWAY, when...!");
    setElementStyle('ending', 'zIndex', '1');
    setElementStyle('endingtext', 'zIndex', '1');
	setElementStyle('opening', 'zIndex', '-1');
    setTimeout(() => {
        transition();
    }, 6000);
}

function transition() {
    setElementStyle('ending', 'zIndex', '-1');
	setElementStyle('endingtext', 'zIndex', '-1');
	setElementSrc('black', './assets/img/black.png');
    setElementStyle('black', 'zIndex', '1');
    setElementStyle('opening', 'zIndex', '-1');
    setTimeout(() => battlesfx.play(), 100);
    setTimeout(initGame, 2900);
}

function preBattleMessage() {
    setElementSrc('ending', './assets/img/pkmnvictorylegion.png');
    setElementText('endingtext', "LEGION LAD attacks NEMZ with animals!");
    setElementStyle('ending', 'zIndex', '1');
    setElementStyle('endingtext', 'zIndex', '1');
	setElementSrc('pkmnback', './assets/img/nemzback.png');
	setElementStyle('pkmnback', 'visibility', 'visible');
	setElementStyle('pkmnback', 'zIndex', '1');
    setTimeout(() => {
        ['ending', 'endingtext', 'black'].forEach(id => setElementStyle(id, 'zIndex', '-1'));
        ['pkmn', 'pkmnback', 'pkmn-name', 'pkmnback-name', 'pkmn-level', 'pkmnback-level', 'pkmnback-hp', 'pkmnback-maxhp', 'player-hp', 'player-hp-bar', 'enemy-hp', 'enemy-hp-bar', 'b1', 'b2'].forEach(id => setElementStyle(id, 'visibility', 'visible'));
		setElementStyle('pkmnback', 'zIndex', '0');
    }, 6000);
}

function initGame() { //Starts the game and sets the beginning pokemon at random
    preBattleMessage();
	    let nemz38 = pokemon.find(p => p.pokename === 'NEMZ'); // Assign 'NEMZ38' to the player's party
    if (nemz38) {
        nemz38.owner = 'player';
        playerParty.push(nemz38);
    }
    let otherPokemon = pokemon.filter(p => p.pokename !== 'NEMZ');     // Assign pokemon to the enemy's party
    for (let i = 0; i < otherPokemon.length; i++) {
        otherPokemon[i].owner = 'enemy';
        enemyParty.push(otherPokemon[i]);
    }
    playerPokemon = playerParty[0];
    enemyPokemon = enemyParty[0];
    showPokemon();
}

function showPokemon() {
    setElementSrc('pkmnback', playerPokemon.imgback);
    setElementSrc('pkmn', enemyPokemon.imgfront);
    setElementText('pkmnback-name', playerPokemon.pokename);
    setElementText('pkmn-name', enemyPokemon.pokename);
    setElementText('pkmnback-maxhp', playerPokemon.maxhealth);
    setElementText('pkmnback-hp', playerPokemon.health);
	setElementText('pkmn-level', enemyPokemon.level);
    setElementText('attack1', playerPokemon.moves[0].name);
    setElementText('attack2', playerPokemon.moves[1].name);
    setElementText('attack3', playerPokemon.moves[2].name);
	setElementStyle('pkmnback', 'visibility', 'visible');
    setElementStyle('pkmn', 'visibility', 'visible');
    updateHealthBars(playerPokemon, 'player');
    updateHealthBars(enemyPokemon, 'enemy');
}

function updateHealthBars(pokemon, type) {
    const percentage = pokemon.health / pokemon.maxhealth;
    setElementStyle(`${type}-hp-bar`, 'width', `${161 * percentage}px`);
}

function switchPokemon() {
	console.log('switched pokemon');
}

function runButton() {
	clickSFX.play();
	document.getElementById('b2').src = './assets/img/pkmnattack.png';
	document.getElementById('attackText').textContent = 'Can\'t run away from this battle, pussy!';
	document.getElementById('b2').style.zIndex = '2';
	document.getElementById('attackText').style.zIndex = '3';
	setTimeout(function() {
        document.getElementById('b2').src = './assets/img/pkmnbattle1.png';
		document.getElementById('attackText').textContent = '';
		document.getElementById('b2').style.zIndex = '-1';
    }, 2000);
}

function pkmnButton() {
	clickSFX.play();
	document.getElementById('b2').src = './assets/img/pkmnattack.png';
	document.getElementById('attackText').textContent = 'Left BLUEY at home!';
	document.getElementById('b2').style.zIndex = '2';
	document.getElementById('attackText').style.zIndex = '3';
	setTimeout(function() {
        document.getElementById('b2').src = './assets/img/pkmnbattle1.png';
		document.getElementById('attackText').textContent = '';
		document.getElementById('b2').style.zIndex = '-1';
    }, 2000);
}

function itemButton() {
    clickSFX.play();
    setElementSrc('b2', "./assets/img/pkmnbattle3.png"); // Load the item image
    ['b2', 'items', 'itemcancel', 'item1'].forEach(id => setElementStyle(id, 'zIndex', '1'));
    ['fight', 'pkmnbtn', 'items', 'run'].forEach(id => setElementStyle(id, 'zIndex', '-1'));
    
    setElementText('item1', `${items.potion.name} x${items.potion.amount}`); // Update the item name and quantity
    
    if (items.potion.amount <= 0) {
        getElement('item1').disabled = true; // Disable the button if the item count is 0
    } else {
        getElement('item1').disabled = false; // Ensure it's enabled otherwise
    }
}

var itemList = [];
let items = {
	'potion': {
		name: 'SUBWAY',
		damage: -200,
		target: 'self',
		amount: 1
	}
};
itemList.push(items);

function potion() {
	playerPokemon.useItem(playerPokemon, items['potion']);
	console.log('SUBWAY healed NEMZ38 for ' + items.potion.damage);
	itemMessageShow(playerPokemon, items.potion.name)
}

function itemMessageShow(pokemonName, itemName) {
    document.getElementById('b2').src = './assets/img/pkmnattack.png';
	['b2', 'items', 'itemcancel', 'item1'].forEach(id => setElementStyle(id, 'zIndex', '-1'));
    document.getElementById('attackText').textContent = 'SUBWAY healed NEMZ38!';
    document.getElementById('b2').style.zIndex = '2';
    document.getElementById('attackText').style.zIndex = '3';
	setTimeout(function() {
        ['fight', 'pkmnbtn', 'items', 'run'].forEach(id => setElementStyle(id, 'zIndex', '1'));
		document.getElementById('b2').src = './assets/img/pkmnbattle1.png';
		document.getElementById('attackText').textContent = '';
		document.getElementById('b2').style.zIndex = '-1';
    }, 2500);
	showPokemon();
    removeListeners();
    setTimeout(function() {
        enemyAttack();
        addListeners();
    }, 2500);
}

function fightButton() {
    clickSFX.play();
	setElementSrc('b2', "./assets/img/pkmnbattle2.png");
    ['b2', 'attackcancel', 'attack1', 'attack2', 'attack3'].forEach(id => setElementStyle(id, 'zIndex', '1'));
	['fight', 'pkmnbtn', 'items', 'run'].forEach(id => setElementStyle(id, 'zIndex', '-1'));
}

function cancelButton() {
    clickSFX.play();
	['attackcancel', 'attack1', 'attack2', 'attack3', 'itemcancel', 'item1',].forEach(id => setElementStyle(id, 'zIndex', '-1'));
	['fight', 'pkmnbtn', 'items', 'run'].forEach(id => setElementStyle(id, 'zIndex', '1'));
    setElementSrc('b2', "");
}

function faintedMessageShow(pokemonName, enemyName) {
    document.getElementById('b2').src = './assets/img/pkmnattack.png';
    document.getElementById('attackText').textContent =  pokemonName + ' killed a ' + enemyName + '!';
    document.getElementById('b2').style.zIndex = '2';
    document.getElementById('attackText').style.zIndex = '3';

    setTimeout(() => { //check if the enemy has more Pokémon or if the game has ended
        let nextEnemyPokemonIndex = enemyParty.findIndex(p => p.alive);
        if (nextEnemyPokemonIndex !== -1) {
            enemyPokemon = enemyParty[nextEnemyPokemonIndex];
            showPokemon();
        } else {
            //setTimeout(endGame, 2000);
        }
		document.getElementById('b2').src = './assets/img/pkmnbattle1.png';
		document.getElementById('attackText').textContent = '';
		document.getElementById('b2').style.zIndex = '-1';
    }, 2000);  // 3 seconds delay for the message to be read
}

function attackMessageShow(attackIndex) {
	document.getElementById('b2').src = './assets/img/pkmnattack.png';
	document.getElementById('attackText').textContent = playerPokemon.pokename + ' used ' + playerPokemon.moves[attackIndex].name + '!';
	document.getElementById('b2').style.zIndex = '2';
	document.getElementById('attackText').style.zIndex = '3';
}

function attackMessageHide() {
	document.getElementById('b2').src = './assets/img/pkmnbattle1.png';
	document.getElementById('attackText').textContent = '';
	document.getElementById('b2').style.zIndex = '-1';
}

function attack(attackIndex) {
    playerPokemon.attack(enemyPokemon, playerPokemon.moves[attackIndex]);
    attackMessageShow(attackIndex);
    setTimeout(function() { // stop the shaking animation and hide attack message
        document.getElementById('pkmn').style.animation = '';
        attackMessageHide();
        ['attackcancel', 'attack1', 'attack2', 'attack3', 'itemcancel', 'item1',].forEach(id => setElementStyle(id, 'zIndex', '-1'));
		['fight', 'pkmnbtn', 'items', 'run'].forEach(id => setElementStyle(id, 'zIndex', '1'));
		setElementSrc('b2', "");
    }, 2000);
    if (playerPokemon.moves[attackIndex].target != 'self') {
        document.getElementById('pkmn').style.animation = 'blink 0.15s 10';
        enemyPokemon.faint(enemyPokemon, enemyParty, playerPokemon);
		if (playerPokemon.health <= 0) {
			setTimeout(() => { // After a short delay, proceed with the logic to bring out the next Pokémon
				document.getElementById('pkmn').style.animation = '';  // Clear the blinking animation
			}, 2000);
		}
		if (enemyPokemon.health <= 0) {
			return;  // If the enemy Pokemon has fainted, don't proceed to enemyAttack
		}
		showPokemon();
    }
    removeListeners();
    setTimeout(function() {
        enemyAttack();
        addListeners();
    }, 2000);
}

function enemyAttack() {
    if (enemyPokemon.health <= 0) {
        return;  // If the enemy Pokemon has fainted, don't attack
    }
	if (playerPokemon.health <= 0) {
        return;  // If the player's Pokemon has fainted, don't proceed to next action
    }
    var attackMove = Math.floor(Math.random() * enemyPokemon.moves.length);
    document.getElementById('attackText').textContent = enemyPokemon.pokename + ' used ' + enemyPokemon.moves[attackMove].name + '!';
    document.getElementById('b2').src = './assets/img/pkmnattack.png';
    document.getElementById('b2').style.zIndex = '2';
    document.getElementById('attackText').style.zIndex = '3';
    enemyPokemon.attack(playerPokemon, enemyPokemon.moves[attackMove]);
    if (enemyPokemon.moves[attackMove].target != 'self') {
        document.getElementById('pkmnback').style.animation = 'blink 0.15s 10';
        setTimeout(function() {
            document.getElementById('pkmnback').style.animation = '';
            attackMessageHide();
        }, 2000);
    }
    showPokemon();
    playerPokemon.faint(playerPokemon, playerParty, enemyPokemon);
}


function handleAttack0() {
    attack(0);
}

function handleAttack1() {
    attack(1);
}

function handleAttack2() {
    attack(2);
}

function addListeners() {
    document.getElementById('startbutton').addEventListener('click', startButton);
    document.getElementById('fight').addEventListener('click', fightButton);
	document.getElementById('run').addEventListener('click', runButton);
	document.getElementById('pkmnbtn').addEventListener('click', pkmnButton);
    document.getElementById('attackcancel').addEventListener('click', cancelButton);
    document.getElementById('attack1').addEventListener('click', handleAttack0);
    document.getElementById('attack2').addEventListener('click', handleAttack1);
    document.getElementById('attack3').addEventListener('click', handleAttack2);
	document.getElementById('items').addEventListener('click', itemButton);
    document.getElementById('itemcancel').addEventListener('click', cancelButton);
	document.getElementById('item1').addEventListener('click', potion);
	/* document.getElementById('btn1').addEventListener('click', function() { fight1SFX.play(); });
	document.getElementById('btn2').addEventListener('click', function() { fight2SFX.play(); });
	document.getElementById('btn3').addEventListener('click', function() { fight3SFX.play(); });
	document.getElementById('btn4').addEventListener('click', function() { fight4SFX.play(); });
	document.getElementById('btn5').addEventListener('click', function() { fight5SFX.play(); });
	document.getElementById('btn6').addEventListener('click', function() { fight6SFX.play(); }); */

}

function removeListeners() {
    document.getElementById('fight').removeEventListener('click', fightButton);
    document.getElementById('attackcancel').removeEventListener('click', cancelButton);
    document.getElementById('attack1').removeEventListener('click', handleAttack0);
    document.getElementById('attack2').removeEventListener('click', handleAttack1);
    document.getElementById('attack3').removeEventListener('click', handleAttack2);
	document.getElementById('itemcancel').removeEventListener('click', cancelButton);
	document.getElementById('items').removeEventListener('click', itemButton);
    document.getElementById('item1').removeEventListener('click', potion);
}

function endGame(winner) {
    ['fight', 'pkmnbtn', 'items', 'run'].forEach(id => setElementStyle(id, 'zIndex', '-1'));
    document.getElementById('ending').style.zIndex = '1';
    document.getElementById('endingtext').style.zIndex = '1';
    battlesfx.pause();
	if (winner === 'player') {
		victorysfx.play();
		document.getElementById('pkmnback').style.zIndex = '1';
        document.getElementById('endingtext').textContent = "NEMZ38 defeated LEGION LAD!";
        setTimeout(function() {
			document.getElementById('endingtext').textContent = "Impossible! LEGION was defeated!";
			setTimeout(function() {
				postEndMessage();
			}, 6000);
        }, 5000);
        document.getElementById('ending').src = './assets/img/pkmnvictorylegion.png';
    } else if (winner === 'enemy') {
		losssfx.play();
        document.getElementById('endingtext').textContent = "NEMZ38 has been defeated!";
        setTimeout(function() {
			document.getElementById('endingtext').textContent = "The LEGION is unstoppable!";
			setTimeout(function() {
				postEndMessageLoss();
			}, 6000);
        }, 5000);
    }
}

function postEndMessage() {
	['pkmn', 'pkmnback', 'pkmn-name', 'pkmnback-name', 'pkmn-level', 'pkmnback-level', 'pkmnback-hp', 'pkmnback-maxhp', 'player-hp', 'player-hp-bar', 'enemy-hp', 'enemy-hp-bar', 'b1', 'b2'].forEach(id => setElementStyle(id, 'visibility', 'hidden'));
	['btn1', 'btn2', 'btn3', 'btn4', 'btn5', 'btn6'].forEach(id => setElementStyle(id, 'zIndex', '2'));
	['btn1', 'btn2', 'btn3', 'btn4', 'btn5', 'btn6'].forEach(id => setElementStyle(id, 'visibility', 'visible'));
	setElementSrc('ending', './assets/img/pkmnattack.png');
    setElementText('endingtext', "Thanks for playing!");
    setElementStyle('ending', 'zIndex', '1');
    setElementStyle('endingtext', 'zIndex', '1');
	setElementStyle('opening', 'zIndex', '-1');
}
function postEndMessageLoss() {
	['pkmn', 'pkmnback', 'pkmn-name', 'pkmnback-name', 'pkmn-level', 'pkmnback-level', 'pkmnback-hp', 'pkmnback-maxhp', 'player-hp', 'player-hp-bar', 'enemy-hp', 'enemy-hp-bar', 'b1', 'b2'].forEach(id => setElementStyle(id, 'visibility', 'hidden'));
	setElementSrc('ending', './assets/img/pkmnattack.png');
    setElementText('endingtext', "Try using SUBWAY item at low health!");
    setElementStyle('ending', 'zIndex', '1');
    setElementStyle('endingtext', 'zIndex', '1');
	setElementStyle('opening', 'zIndex', '-1');
}

function playAudio(buttonElement, audioElement) {
    // Disable all buttons
    const buttons = document.querySelectorAll("#btn1, #btn2, #btn3, #btn4, #btn5, #btn6");
    buttons.forEach(btn => btn.disabled = true);

    // Change appearance of the clicked button
    buttonElement.classList.add('button-active');

    audioElement.play();

    // Add event listener to handle when the audio ends
    audioElement.addEventListener('ended', function() {
        // Revert button appearance
        buttonElement.classList.remove('button-active');

        // Enable all buttons
        buttons.forEach(btn => btn.disabled = false);
    });
}

document.getElementById('btn1').addEventListener('click', function() { playAudio(this, fight1SFX); });
document.getElementById('btn2').addEventListener('click', function() { playAudio(this, fight2SFX); });
document.getElementById('btn3').addEventListener('click', function() { playAudio(this, fight3SFX); });
document.getElementById('btn4').addEventListener('click', function() { playAudio(this, fight4SFX); });
document.getElementById('btn5').addEventListener('click', function() { playAudio(this, fight5SFX); });
document.getElementById('btn6').addEventListener('click', function() { playAudio(this, fight6SFX); });
