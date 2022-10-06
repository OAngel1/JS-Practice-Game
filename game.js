const canvas = document.querySelector('#game');
const spanLives = document.querySelector(".lives");
const spanTime = document.querySelector(".time");
const spanLastTime = document.querySelector(".lastTime");
const spanBestTime = document.querySelector(".bestTime");

const upB = document.querySelector('#up');
const leftB = document.querySelector('#left');
const rightB = document.querySelector('#right');
const downB = document.querySelector('#down');

upB.addEventListener('click',moveEvents);
rightB.addEventListener('click',moveEvents);
leftB.addEventListener('click',moveEvents);
downB.addEventListener('click',moveEvents);

const game = canvas.getContext('2d');
const playerPosition = {
    x:undefined,
    y:undefined,
}
const doorPosition ={
    doorX:undefined,
    doorY:undefined,
    toggle:false,
}
const playerTime={
    timeStart: 0,
    timeLvl: 0,
}

let mapPlay ; 
let canvasSize;
let elementSize;
let lvl=0;
let lives = 3;
let intevaloTime;
let endGame= false;

window.addEventListener('load',setCanvasSize);
window.addEventListener('resize',setCanvasSize);
window.addEventListener("keydown", moveEvents);


function setCanvasSize(){
    if(window.innerWidth < window.innerHeight){
        canvasSize = window.innerWidth * 0.8;
    }else{
        canvasSize = window.innerHeight - 200;  
    }
    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);
    elementSize= canvasSize/10 - 2;
    console.log({canvasSize,elementSize});
    game.font= elementSize + 'px fuente';
    game.textAlign = 'end';
    startGame();
}

function startGame(){
    game.clearRect(0, 0, canvasSize, canvasSize);
    renderMaps();
    renderPlayer();
    showLives();
    showTime();
    showBestTime();
    showLastTime();
}

function renderMaps(){
    if(!mapPlay){
        createMapBiDim(lvl);
    }
    mapPlay.forEach( (row, y) => {
        row.forEach( (col , x ) =>{
            const emoji= emojis[col];
            const drawY = (y + 1) * elementSize;
            const drawX = (x + 1) * elementSize + 20 ;
            if(col == 'O' && !doorPosition.toggle){
                playerPosition.x = x;
                playerPosition.y = y;
                doorPosition.x = x;
                doorPosition.y = y;
                doorPosition.toggle=true;
            }
            game.fillText(emoji,drawX,drawY);
        })
    });
}

function renderPlayer(){
    const posY = (playerPosition.y + 1) * elementSize;
    const posX = (playerPosition.x + 1) * elementSize + 20 ;
    game.fillText(emojis['PLAYER'],posX,posY);
}
function renderNextLvl(){
    if( lvl == maps.length - 1 ){
        renderWin();
    }else{
        doorPosition.toggle=false;
        lvl++;
        createMapBiDim(lvl);
        startGame();
    }
    
}

function renderBoom(){
    const posY = (playerPosition.y + 1) * elementSize;
    const posX = (playerPosition.x + 1) * elementSize + 14 ;

    lives--;
    if(lives==0){  
        game.clearRect(0, 0, canvasSize, canvasSize);      
        renderMaps();
    
        game.fillText(emojis['PLAYER'],posX + 2,posY + 4);
        game.fillText(emojis['BOMB_COLLISION'],posX,posY);
        renderLose();
        return;
    }

    playerPosition.x = doorPosition.x ;
    playerPosition.y = doorPosition.y ;
    //doorPosition.toggle=false;
    startGame();
    game.fillText(emojis['BOMB_COLLISION'],posX,posY);
}
function renderLose(){
    const posY = (doorPosition.y + 1) * elementSize;
    const posX = (doorPosition.x + 1) * elementSize  + 20 ;
    game.fillText(emojis['GAME_OVER'],posX,posY);
    clearInterval(intevaloTime);
    endGame=true;
    showLives();
}

function renderWin(){
    const timeFinal=Date.now();
    clearInterval(intevaloTime);
    showTime(timeFinal);

    const posY = (playerPosition.y + 1) * elementSize;
    const posX = (playerPosition.x + 1) * elementSize + 20 ;
    game.fillText(emojis['WIN'],posX,posY);
    localStoraTime(timeFinal - playerTime.timeStart);
    endGame=true;
    showLives();
}

function restartGame(){
    clearInterval(intevaloTime);
    lives=3;
    lvl=0;
    doorPosition.toggle=false;
    endGame=false;
    playerTime.timeStart=0;
    createMapBiDim(lvl);
    startGame();
}

function moveEvents(event){
    let target = event.path[0].id;
    if(target ==''){
        target = event.key;
    }

    if(endGame){
        if(target=='Enter')
            restartGame();
        return;
    }
    


    switch (target) {
        case 'up':
        case 'ArrowUp':
            console.log('up');
            if(playerPosition.y != 0)
                playerPosition.y--;
            break;
            
        case 'right':
        case 'ArrowRight':
            console.log('right');
            if(playerPosition.x != 9 )
                playerPosition.x++;
            break;
            
        case 'left':
        case 'ArrowLeft':
            console.log('left');
            if(playerPosition.x != 0 )
                playerPosition.x--;
            break;
            
        case 'down':
        case 'ArrowDown':
            console.log('down');
            if(playerPosition.y != 9 )
                playerPosition.y++;
            break;
    }
    if(playerTime.timeStart==0){
        intevaloTime = setInterval(()=>showTime(),100);
        playerTime.timeStart = Date.now(); 
    }
        
    // startGame();
    // renderMaps();
    // renderPlayer();
    reactionMove();
}

function reactionMove(){
    if(mapPlay[playerPosition.y][playerPosition.x]=="I")
        renderNextLvl();
    else if(mapPlay[playerPosition.y][playerPosition.x]=="X") 
        renderBoom();
    else
        startGame();
}

function createMapBiDim(lvl){
    const arrayMap = maps[lvl].trim().split(/\n/);
    let mapBiDim =[]
    arrayMap.forEach( (row, y) => {
        mapBiDim.push( row.trim().split('') );
    });
    mapPlay = mapBiDim;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function showLives(){
    if(endGame)  
     spanLives.innerText = "Vidas: "+ lives + " Volver empezar preciona [ENTER]";
    else
    spanLives.innerText = "Vidas: " + emojis["HEART"].repeat(lives);
}
function showTime(time = Date.now()){
    let diffTime=0;
    if(playerTime.timeStart > 0){
        diffTime= time - playerTime.timeStart;
    }
    spanTime.innerText = "Tiempo: " + formatTime(diffTime);
}

function showBestTime(){
    let time=0;
    if(localStorage.getItem('bestTime'))
        time=localStorage.getItem('bestTime');  
    spanBestTime.innerText = "Mejor Tiempo: " + formatTime(parseInt(time));
}
function showLastTime(){
    let time=0;
    if(localStorage.getItem('lastTime'))
        time=localStorage.getItem('lastTime'); 
    spanLastTime.innerText = "Ultimo Tiempo: " + formatTime(parseInt(time));
}

function localStoraTime(time){
    if(localStorage.getItem('lastTime')){
        if( time < localStorage.getItem('bestTime'))
            localStorage.setItem('bestTime',time);
        localStorage.setItem('lastTime',time);    
    }else {
        localStorage.setItem('lastTime',time);
        localStorage.setItem('bestTime',time);
    }
}

function formatTime(time){
    const date = new Date(time);
    return  date.getMinutes()+":"+date.getSeconds()+":"+ date.getMilliseconds();
}

