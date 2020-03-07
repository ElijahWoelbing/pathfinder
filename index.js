const canvas = document.getElementById("canvas");
const wallButton = document.getElementById("wall-button");
const startButton = document.getElementById("start-button");
const endButton = document.getElementById("end-button");
const pathButton = document.getElementById("path-button");
let gridSize = 40;
canvas.width = 800;
canvas.height = 800;
const ctx = canvas.getContext("2d");
const end = {
    x: 10,
    y: 10,
    g: Number.MAX_VALUE,
    color: "green"
};
const start = 
{
    x: 0,
    y: 0,
    g: 0,
    f: Number.MAX_VALUE,
    color: "purple"
};
let pencilOption = 0;
const cellSize = 40;
let matrix = [];
createMatrix();
drawMatrix();


function update()
{
    drawMatrix();
}

function createMatrix(){
    for(let r = 0; r < gridSize; r++)
    {
        matrix[r] = []
        for(let c = 0; c < gridSize; c++)
        {
            matrix[r][c] = 
            {
                x: c,
                y: r,
                g: Number.MAX_VALUE, // distance from start
                color: "white"
            }
        }
    }
}

function drawMatrix(){
    for(let r = 0; r < matrix.length; r++)
    {
        for(let c = 0; c < matrix[r].length; c++)
        {
            drawSquare(c, r, matrix[r][c].color)
        }
    }
}

function drawSquare(x, y, color){
    ctx.fillStyle = color;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function addWall(e)
{

    const rect = e.target.getBoundingClientRect();
    const column = Math.floor((e.clientX - rect.left) / cellSize); //x position within the element.
    const row = Math.floor((e.clientY - rect.top) / cellSize);  //y position within the element.
    console.log(matrix[row][column].color)
    if(matrix[row][column].color === "white"){
        matrix[row][column].color = "blue";
    }
    update();
}

function setMarker(e, marker){
    const rect = e.target.getBoundingClientRect();
    const column = Math.floor((e.clientX - rect.left) / cellSize); //x position within the element.
    const row = Math.floor((e.clientY - rect.top) / cellSize);  //y position within the element.
    matrix[marker.y][marker.x] = 
    {                
        x: marker.x,
        y: marker.y,
        g: marker.g,
        color: "white"
    }
    marker.x = column;
    marker.y = row; 
    matrix[row][column] = marker;
    update();
}
function drawWalls(){
    const draw = function(e)
    {
        addWall(e)
    }
    
    canvas.addEventListener("mousemove", draw)

    canvas.addEventListener("mouseup",()=>{
        canvas.removeEventListener("mousemove", draw);
    }) 
}

canvas.addEventListener("mousedown", (e)=>{
    console.log(pencilOption);
    switch(pencilOption){
        case 0: drawWalls();
        break;
        case 1: setMarker(e, start);
        break;
        case 2: setMarker(e, end);
        break;
    }   
});

wallButton.onclick = ()=>{pencilOption = 0};
startButton.onclick = ()=>{pencilOption = 1};
endButton.onclick = ()=>{pencilOption = 2};
pathButton.onclick = drawAStar;


const openList = [start];
const closeList = [];
let startTime = Date.now();
let updateInteval = 100;

function drawAStar(){
    if(Date.now() - startTime > updateInteval){
        // drawMatrix();
         // find lowest f value in open set
        let currentIndex = 0;
        for(let i = 0; i < openList.length; i++)
        {
            if(openList[i].f < openList[currentIndex].f ){
                currentIndex = i;
            }
        }
        let current = openList[currentIndex];
        if(current === end)
        {
            return;
        }
        if(current != start)
        {
            drawSquare(current.x, current.y, "gold")
        }    
        // remove current from openList
        openList.splice(currentIndex, 1);
        // add current to closed list
        closeList.push(current);
        // get currnet neighbors 
        const neighbors = [];
        //south
        if(current.y < matrix.length - 1){
          neighbors.push(matrix[current.y + 1][current.x]);
        }
        //north
        if(current.y > 0){
            neighbors.push(matrix[current.y - 1][current.x]);
        }
        //east
        if(current.x < matrix.length - 1){
            neighbors.push(matrix[current.y][current.x + 1]);
        }
        //west
        if(current.x > 0){
            neighbors.push(matrix[current.y][current.x - 1]);
        }
        // north west
        if(current.x > 0 && current.y > 0){
            neighbors.push(matrix[current.y - 1][current.x - 1]);
        }
        // south west
        if(current.x > 0 && current.y < matrix.length - 1){
            neighbors.push(matrix[current.y + 1][current.x - 1]);
        }
        // north east
        if(current.x < matrix.length - 1 && current.y > 0){
            neighbors.push(matrix[current.y - 1][current.x + 1]);
        }
        // south east
        if(current.x < matrix.length - 1 && current.y > matrix.length - 1){
            neighbors.push(matrix[current.y + 1][current.x + 1]);
        }
        for (const neighbor of neighbors) {
            if(closeList.includes(neighbor) || neighbor.color === "blue"){
                continue;
            }
            tempG = current.g + 1;
            
            if(tempG < neighbor.g){
                neighbor.g = tempG;
                neighbor.h = heuristic(neighbor);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
            }

            if(!openList.includes(neighbor)){
                openList.push(neighbor);
            }
        }
            startTime = Date.now();
    }

    if(openList.length > 0){
        requestAnimationFrame(drawAStar);
    } 
    reconstitutePath();
}



function heuristic(node){
    const deltaX = Math.abs(node.x - end.x);
    const deltaY = Math.abs(node.y - end.y);
    return deltaX + deltaY;
}

function reconstitutePath()
{
    let node = end;
    while(node.parent != start){
        drawSquare(node.parent.x, node.parent.y,"red");
        node = node.parent
    }
}