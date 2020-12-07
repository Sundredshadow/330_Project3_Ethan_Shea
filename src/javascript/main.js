import * as fire from './firebase.js';
//defaults
let offset=0;
let offsetMod=0;
let limit=1;

//limits of pokemon to each generation (national dex)
let gen1limit=151;
let gen2limit=251;
let gen3limit=386;
let gen4limit=493;
let gen5limit=649;
let gen6limit=721;
let gen7limit=809;

let currentBotLimit=0;
let currentTopLimit=gen1limit;
let imgURLs=[[]];
let imgIndices=[];
//if a text search
let search="";
let searched="";//used to indicate to firebase to load data(along with other checks)

function init()
{
    fire.initFirebase();
    setUpHandlers();
}

//xhr that loads pokemon
function loadPokemon(){
    // 1. Clear UI
    content.innerHTML = "";
    
    // 2. Create an XHR object to download the web service
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/
    const xhr = new XMLHttpRequest();
    let url = "https://people.rit.edu/eds7847/330/Project3/src/php/pokemon.php?"+"generation="+generation.value;
    url+="&game="+game.value;
    url+="&offset="+offset;
    url+="&limit="+limit;
    url+="&dex="+dex.value;
    if(search!="")
    {
        search=search.toLowerCase().replace(/\s/g, '');//tolowercase remove all spaces
        url+="&search="+search;
        searched=search;
        search="";
    }

    //console.log(url);
    // 3. set `onerror` handler
    xhr.onerror = (e) => console.log("error");
    content.innerHTML="<img src='images/loading.gif' alt='no loading icon' >"
    // 4. set `onload` handler
    xhr.onload = (e) => {
        const headers = e.target.getAllResponseHeaders();
        const jsonString = e.target.response;			
        // update the UI by showing the pokemon
        if(!isNaN(parseInt(jsonString[0]+jsonString[1]+jsonString[2]))){//for invalid search case
            offset=parseInt(jsonString[0]+jsonString[1]+jsonString[2]);//getting search info back from php
            if(offset>currentTopLimit)//need to find correct generation to use as a national dex
            {
                figureOutGen(offset);
                loadPokemon();
            }  
        }
        //firebase related code//////////////////////////////////////////////////////
        content.innerHTML=`${jsonString.substring(3,jsonString.length)}`;//created content
        if(searched!=""){  //sombody must have searched for something specific     
            //do a simple check if it actually returned something valid then add to firebase
            if(content.innerHTML!="Invalid Search")
            {
                let path = 'pokemon/' + searched;//use tempsearch since search is reset in loadPokemon
                firebase.database().ref(path).set(firebase.database.ServerValue.increment(1));
                firebase.database().ref("pokemon").on("value", fire.getMostSearched, fire.firebaseError);
            }
            searched="";
        }

        //adding photo switcher/////////////////////////////////////////////////////////////////////////////
        //gettin all the sprite objects containing images
        let spriteSelectors=document.querySelectorAll(".sprites");
        imgURLs=[[]];
        for(let z=0;z<spriteSelectors.length;z++)
        {
            //get images urls
            let imgs=spriteSelectors[z].querySelectorAll(".pokemonIMGs");
            imgURLs.push([]);//allocate data
            for(let i=0;i<imgs.length;i++)
            {
                if(imgs[i].src!="https://people.rit.edu/eds7847/330/Project3/pokemon.html"){
                    imgURLs[z].push(imgs[i].src);//place data
                }
            }
            imgIndices[z]=0;//default to front facing
        }
        for(let z=0;z<spriteSelectors.length;z++){
            spriteSelectors[z].innerHTML=`<button class="imgPrev">\<-</button><button class="imgNext">-\></button><img src=${imgURLs[z][imgIndices[z]]} alt='Not Available' class='pokemonIMGs'>`;
        }
        //img prev and next
        setUpImgSwitch();
        setUpMoveSwitch(); 
        setupAbilitySwitch();
    }; // end xhr.onload
    changePokemonIDHTML();
    xhr.open("GET",url);
    xhr.send();		
}; // end onclick

function changePokemonIDHTML(){
    if(dex.value=="regional"){
        pokemonID.innerHTML=(offset-currentBotLimit+1)+"/"+(currentTopLimit-currentBotLimit);
    }
    else if(dex.value=="national")
    {
        pokemonID.innerHTML=(offset+1)+"/"+(currentTopLimit);
    }
}

//handlers that are used on start//////////////////////////////////////////
function setUpHandlers()
{
    reset.onclick=(e)=>{
        generation.value="generation-i";
        dex.value="national";
        dexgenerationChange();
        game.value="red-blue";
        offset=0;
        offsetMod=0;
        limit=1;
        searchlimit.value=1;
        searchoffset.value=1;
        pokemonID.innerHTML="";
        content.innerHTML="";
        firebase.database().ref("pokemon").on("value", fire.getMostSearched, fire.firebaseError);
    }

    showPokemon.onclick = (e)=>{
        loadPokemon();
    }
    prevPokemon.onclick = (e)=>{
        if(offset-limit-offsetMod>=currentBotLimit)
        {
            offset=offset-offsetMod-limit;
        } 
        else
        {
            offset=currentBotLimit;
        }
        loadPokemon();
    }

    nextPokemon.onclick = (e)=>{
        if(offset+limit+offsetMod<currentTopLimit){// 809 max amount of pokemon up to gen-7(there is more but gen-8 according to the api is incomplete as of yet)
            offset+=limit+offsetMod;   
        } 
        else
        {
            offset=currentTopLimit-limit;
        }
        loadPokemon();
    }

    //changes the game options since generation or dex changed
    generation.onchange = (e)=>{dexgenerationChange();}
    dex.onchange=(e)=>{dexgenerationChange();}

    //limit
    searchlimit.onchange=(e)=>{limit=parseInt(searchlimit.value);}
    //offset
    searchoffset.onchange=(e)=>{offsetMod=parseInt(searchoffset.value)-1;}


    //search via pokemon id or name
    searchViaPokemon.onclick= (e)=>{
        //figure out if their its pokemon name or id
        let tempsearch=searchBox.value;
        let intSearch=parseInt(searchBox.value).toString();
        if(tempsearch.length>intSearch.length&&!isNaN(parseInt(intSearch))){//compare string lengths to see if its just a string or just an iD
            return;//contains both numbers and string characters cannot do search exits.
        }
        else if(!isNaN(parseInt(intSearch))){//id search
            let changeOffset=parseInt(searchBox.value)-1;
            dex.value="national";//must immediatly switch to national dex since gen specific will cause issues
            if(changeOffset<0){changeOffset=0;}//constrains to first pokemon in any dex(happens to be bulbasaur)
            if(changeOffset>gen7limit){changeOffset=gen7limit-1}//constrains to last pokemon (gen-7)
            if(changeOffset>currentTopLimit)//need to find correct generation to use as a national dex
            {
                figureOutGen(changeOffset);
            }
            offset=changeOffset;
        }
        else//if not a number must be pokemon search
        {
            //do pokemon search(checks in php if valid)
            search=tempsearch;
        }
        loadPokemon();
    }
}

//handlers used after search/////////////////////////////////////////////////
function setUpImgSwitch()
{
    let prevImgSelectors=document.querySelectorAll(".imgPrev");
    let nextImgSelectors=document.querySelectorAll(".imgNext");
    let spriteSelectors=document.querySelectorAll(".sprites");
    for(let i=0; i<prevImgSelectors.length;i++){
        prevImgSelectors[i].onclick=(e)=>
        {
            if(imgIndices[i]-1>=0)
            {
                imgIndices[i]=imgIndices[i]-1;
                spriteSelectors[i].innerHTML=`<button class="imgPrev">\<-</button><button class="imgNext">-\></button><img src=${imgURLs[i][imgIndices[i]]} alt='Not Available' class='pokemonIMGs'>`;
                setUpImgSwitch()
                
            }
        }
        nextImgSelectors[i].onclick=(e)=>
        {
            if(imgIndices[i]+1<imgURLs[i].length)
            {
                imgIndices[i]=imgIndices[i]+1;
                spriteSelectors[i].innerHTML=`<button class="imgPrev">\<-</button><button class="imgNext">-\></button><img src=${imgURLs[i][imgIndices[i]]} alt='Not Available' class='pokemonIMGs'>`;
                setUpImgSwitch()
            }
        }
    }
}

//xhr that loads moves info(seperate because don't need all the additional data)
function setUpMoveSwitch(){
    let moveSelectors=document.querySelectorAll(".Moves");
    for(let i=0; i<moveSelectors.length;i++){
        //move selection
        moveSelectors[i].querySelector(".moves").onclick=(e)=>
        {
            // 1. Clear UI
            moveSelectors[i].querySelector(".moveInfo").innerHTML = "";
            
            // 2. Create an XHR object to download the web service
            // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/
            const xhr = new XMLHttpRequest();
            let url = "https://people.rit.edu/eds7847/330/Project3/src/php/pokemonMoveSearch.php?"+"move="+moveSelectors[i].querySelector(".moves").value;
            url+="&game="+game.value;
            url+="&generation="+generation.value;

            //console.log(url);
            // 3. set `onerror` handler
            xhr.onerror = (e) => console.log("error");
            
            // 4. set `onload` handler
            xhr.onload = (e) => {
                const headers = e.target.getAllResponseHeaders();
                const jsonString = e.target.response;			
                moveSelectors[i].querySelector(".moveInfo").innerHTML=`${jsonString}`;//created content  
            }; // end xhr.onload
            xhr.open("GET",url);
            xhr.send();	
        }
    }
}

//xhr that loads abilitiy info (seperate because don't need all the additional data)
function setupAbilitySwitch(){
    let abilitySelectors=document.querySelectorAll(".ability");
    for(let i=0; i<abilitySelectors.length;i++){
        //move selection
        if(abilitySelectors[i].querySelector(".abilities").value!="none"){
            abilitySelectors[i].querySelector(".abilities").onclick=(e)=>
            {
                // 1. Clear UI
                abilitySelectors[i].querySelector(".abilityInfo").innerHTML = "";
                
                // 2. Create an XHR object to download the web service
                // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/
                const xhr = new XMLHttpRequest();
                let url = "https://people.rit.edu/eds7847/330/Project3/src/php/pokemonAbilitySearch.php?"+"ability="+abilitySelectors[i].querySelector(".abilities").value;
                url+="&game="+game.value;
                url+="&generation="+generation.value;

                //console.log(url);
                // 3. set `onerror` handler
                xhr.onerror = (e) => console.log("error");
                
                // 4. set `onload` handler
                xhr.onload = (e) => {
                    const headers = e.target.getAllResponseHeaders();
                    const jsonString = e.target.response;
                    //console.log(jsonString);			
                    abilitySelectors[i].querySelector(".abilityInfo").innerHTML=`${jsonString}`;//created content  
                }; // end xhr.onload
                xhr.open("GET",url);
                xhr.send();	
            }
        }
    }
}



//figures out limit offset, etc when dex or generation is changed
function dexgenerationChange()
{
    if(dex.value=="regional")
    {
        if(generation.value=="generation-i")
        {
            game.innerHTML="<option value='red-blue' selected>red-blue</option><option value='yellow'>yellow</option>";
            offset=0;
            currentBotLimit=0;
            currentTopLimit=gen1limit;
        }
        else if(generation.value=="generation-ii")
        {
            game.innerHTML="<option value='gold' selected>gold</option><option value='silver' selected>silver</option><option value='crystal'>crystal</option>";
            offset=gen1limit;
            currentBotLimit=gen1limit;
            currentTopLimit=gen2limit;
        }
        else if(generation.value=="generation-iii")
        {
            game.innerHTML="<option value='ruby-sapphire' selected>ruby-sapphire</option><option value='emerald'>emerald</option><option value='firered-leafgreen'>firered-leafgreen</option>";
            offset=gen2limit;
            currentBotLimit=gen2limit;
            currentTopLimit=gen3limit;
        }
        else if(generation.value=="generation-iv")
        {
            game.innerHTML="<option value='diamond-pearl' selected>diamond-pearl</option><option value='platinum'>platinum</option><option value='heartgold-soulsilver'>heartgold-soulsilver</option>";
            offset=gen3limit;
            currentBotLimit=gen3limit;
            currentTopLimit=gen4limit;
        }
        else if(generation.value=="generation-v")
        {
            game.innerHTML="<option value='black-white' selected>black-white</option><option value='black-2-white-2'>black-2-white-2</option>";
            offset=gen4limit;
            currentBotLimit=gen4limit;
            currentTopLimit=gen5limit;
        }
        else if(generation.value=="generation-vi")
        {
            game.innerHTML="<option value='x-y' selected>x-y</option><option value='omega-ruby-alpha-sapphire'>omega-ruby-alpha-sapphire</option>";
            offset=gen5limit;
            currentBotLimit=gen5limit;
            currentTopLimit=gen6limit;
        }
        else if(generation.value=="generation-vii")
        {
            game.innerHTML="<option value='sun-moon' selected>sun-moon</option><option value='ultra-sun-ultra-moon'>ultra-sun-ultra-moon</option>";
            offset=gen6limit;
            currentBotLimit=gen6limit;
            currentTopLimit=gen7limit;
        }
    }
    if(dex.value=="national")
    {
        if(generation.value=="generation-i")
        {
            game.innerHTML="<option value='red-blue' selected>red-blue</option><option value='yellow'>yellow</option>";
            if(offset>gen1limit){
                offset=0;
            }
            currentBotLimit=0;
            currentTopLimit=gen1limit;
        }
        else if(generation.value=="generation-ii")
        {
            game.innerHTML="<option value='gold' selected>gold</option><option value='silver' selected>silver</option><option value='crystal'>crystal</option>";
            if(offset>gen2limit){
                offset=0;
            }
            currentBotLimit=0;
            currentTopLimit=gen2limit;
        }
        else if(generation.value=="generation-iii")
        {
            game.innerHTML="<option value='ruby-sapphire' selected>ruby-sapphire</option><option value='emerald'>emerald</option><option value='firered-leafgreen'>firered-leafgreen</option>";
            if(offset>gen3limit){
                offset=0;
            }
            currentBotLimit=0;
            currentTopLimit=gen3limit;
        }
        else if(generation.value=="generation-iv")
        {
            game.innerHTML="<option value='diamond-pearl' selected>diamond-pearl</option><option value='platinum'>platinum</option><option value='heartgold-soulsilver'>heartgold-soulsilver</option>";
            if(offset>gen4limit){
                offset=0;
            }
            currentBotLimit=0;
            currentTopLimit=gen4limit;
        }
        else if(generation.value=="generation-v")
        {
            game.innerHTML="<option value='black-white' selected>black-white</option><option value='black-2-white-2'>black-2-white-2</option>";
            if(offset>gen5limit){
                offset=0;
            }
            currentBotLimit=0;
            currentTopLimit=gen5limit;
        }
        else if(generation.value=="generation-vi")
        {
            game.innerHTML="<option value='x-y' selected>x-y</option><option value='omega-ruby-alpha-sapphire'>omega-ruby-alpha-sapphire</option>";
            if(offset>gen6limit){
                offset=0;
            }
            currentBotLimit=0;
            currentTopLimit=gen6limit;
        }
        else if(generation.value=="generation-vii")
        {
            game.innerHTML="<option value='sun-moon' selected>sun-moon</option><option value='ultra-sun-ultra-moon'>ultra-sun-ultra-moon</option>";
            if(offset>gen7limit){
                offset=0;
            }
            currentBotLimit=0;
            currentTopLimit=gen7limit;
        }
    }
}


function figureOutGen(changedOffset)
{
    //really simple if statment checking where search id ends up based on generation pokemon limits
    if(gen2limit>=changedOffset){generation.value="generation-ii";}
    else if(gen3limit>=changedOffset){generation.value="generation-iii";}
    else if(gen4limit>=changedOffset){generation.value="generation-iv";}
    else if(gen5limit>=changedOffset){generation.value="generation-v";}
    else if(gen6limit>=changedOffset){generation.value="generation-vi";}
    else{generation.value="generation-vii";}//gen-7

    dexgenerationChange();
}

export {init};