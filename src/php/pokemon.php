<?php

    $URL="";//total url to be used later

    $BaseURL= "https://pokeapi.co/api/v2/";//base url nothing but base level api access

    $PokemonSearch="pokemon";

    $offset=0;//whatever the id is minus one will give that pokemon(just for reference)
    if(array_key_exists('offset', $_GET)){
        $offset = $_GET['offset'];
    }

    $numberOfPokemon=1;//quantity of pokemon to show
    if(array_key_exists('limit', $_GET)){
        $numberOfPokemon = $_GET['limit'];
    }


    $generation="generation-i";//generation being used
    if(array_key_exists('generation', $_GET)){
        $generation = $_GET['generation'];
    }

    $game="red-blue";//game within that generation being used;
    if(array_key_exists('game', $_GET)){
        $game = $_GET['game'];
    }

    $dex="national";//dex within that generation being used;
    if(array_key_exists('dex', $_GET)){
        $dex = $_GET['dex'];
    }

    header('content-type:application/json');      // tell the requestor that this is JSON
    header("Access-Control-Allow-Origin: *");     // turn on CORS

    $search;//dex within that generation being used;
    if(array_key_exists('search', $_GET)){
        $search = $_GET['search'];
        $searchURL="$BaseURL$PokemonSearch/$search";
        error_reporting(0);//temporarily turn off error reporting just incase invalid pokemon
        //(don't want it printing out invalid error if search is invalid)
        $data=file_get_contents($searchURL) or die("   Invalid Search");//kills script because invalid pokemon
        $offset=json_decode($data)->id-1;
    }
    error_reporting(E_ALL);//turn error reporting back on
    $URL="$BaseURL$PokemonSearch?limit=$numberOfPokemon&offset=$offset";

    $data=file_get_contents($URL);

    $pokemonMasterArr=json_decode($data);

    //need to echo out offset in correct way so html can update when search is done
    //formatted so if less than 3 digits adds zeros to beginning
    $offsetStr=strval($offset);
    for($x=strlen($offsetStr);$x<3;$x++)
    {
        $offsetStr="0".$offsetStr;
    }
    echo $offsetStr;
    //iterates through each pokemon
    $listofPokemonArr=$pokemonMasterArr->results;
    for($i=0; $i<$numberOfPokemon;$i++)
    {
       //echo $listofPokemonArr[$i]->name; //list out all the pokemon using this array instead
        
       $pokemonData=file_get_contents($listofPokemonArr[$i]->url);//gets data of a single pokemon
       $pokemonArr=json_decode($pokemonData);//decoded json array for that pokemon

       $speciesData=file_get_contents($pokemonArr->species->url);//check generation
       $speciesArr=json_decode($speciesData);//(need it for data down the line)

        //sprites///////////////////////////////////////////////////////////////////////
        $sprites;//soon to be sprites object

        //black and white 2 has to use the same version group as black-white
        //also sprites have animated and non-animated versions so must choose
        if($game=="black-2-white-2"||$game=="black-white")
        {
            $gametemp="black-white";
            $sprites=$pokemonArr->sprites->versions->$generation->$gametemp->animated;
        }
        else if($game=="sun-moon")//sun-moon for sprites version-group can only be ultra-sun-ultra-moon
        {
            $gametemp="ultra-sun-ultra-moon";
            $sprites=$pokemonArr->sprites->versions->$generation->$gametemp;
        }
        else if($game=="omega-ruby-alpha-sapphire")//needs me to remove two FREAKING dashes
        {
            $gametemp="omegaruby-alphasapphire";//straight up stupid that i have to do this(bad api moment)
            $sprites=$pokemonArr->sprites->versions->$generation->$gametemp;
        }
        else{$sprites=$pokemonArr->sprites->versions->$generation->$game;}
        //printing out sprites
        echo "<div class='topRow'><div class='sprites'>";
        foreach ($sprites as $key => $value) //iterates through all the keys printing out the img
        {
            echo "<img src='$value' alt='' class='pokemonIMGs'>";
        }

        echo"</div>\n";

        //id///////////////////////////////////////////////
        echo "<div class='importantInfo'><div class='ID'>ID:".$pokemonArr->id."</div>";//name of pokemon
        echo "\n";

        //name///////////////////////////////////////////////
        echo "<div class='name'>Name:".$pokemonArr->name."</div>";//name of pokemon
        echo "\n";

        //genera(from species array)///////////////////////////////////////////////////////////////
        echo "<div class='genera'>Genera:";
        $generas=$speciesArr->genera;//not multiple generas multiple languages
        //trying to find a specific genera based on language
        //loop goes until it finds the right language (en or English)
        for($x=0; $x<count($generas);$x++)
        {
            if($generas[$x]->language->name=="en")
            {
                echo $generas[$x]->genus;//echo genus
                $x=count($generas);//exit loop
            }
        }
        echo"</div>\n";

        //habitat(from species array)//////////////////////////////////////////////////////////////
        echo "<div class='habitat'>Habitat:";
        if($speciesArr->habitat!=NULL){//prevent
            echo $speciesArr->habitat->name;
        }
        else{echo "Unknown";}
        echo"</div>\n";

        //types////////////////////////////////////////////////////////////////////
        $types=$pokemonArr->types;//gets types of that one pokemon
        echo "<div class=types>Types:";
        for($x=0; $x<count($types);$x++)
        {
            //must check for generation type due to such types as fairy,steel and dark being added in later games
            if($types[$x]->type->name=="dark"||$types[$x]->type->name=="steel")
            {
                if($generation!="generation-i"){
                echo $types[$x]->type->name.",";
                }
            }
            else if($types[$x]->type->name=="fairy")//fairy
            {
                if($generation=="generation-vi"||$generation=="generation-vii")
                {
                    echo $types[$x]->type->name.",";
                }
                else if($pokemonArr->name=="snubull"||$pokemonArr->name=="granbull"||$pokemonArr->name=="snubull"||$pokemonArr->name=="togepi"||$pokemonArr->name=="togetic"||$pokemonArr->name=="togekiss"||$pokemonArr->name=="cleffa"||$pokemonArr->name=="clefairy"||$pokemonArr->name=="clefable")
                {
                    //these pokemon had there normal type removed and replaced by fairy type when fairy was added
                    echo "normal,";
                }
            }
            else
            {
                echo $types[$x]->type->name.",";
            }
        }
        echo "</div>\n";

        //height///////////////////////////////////////////////////////////////////
        echo "<div class='height'>Height:".$pokemonArr->height."</div>";
        echo "\n";

        //weight///////////////////////////////////////////////////////////////////
        echo "<div class='weight'>Weight:".$pokemonArr->weight."</div></div></div>";
        echo "\n";


        echo "<div class='additionalInfo'>";
        //stats////////////////////////////////////////////////////////////////////
        $stats=$pokemonArr->stats;//gets stats of that one pokemon
        echo "<div class=stats><div class='stat'>Stats:</div>";
        for($x=0; $x<count($stats);$x++)
        {
            echo "<div class='stat'>".$stats[$x]->stat->name.":".$stats[$x]->base_stat."</div>";       
        }
        echo "</div>\n";

        //base_experience/////////////////////////////////////////////////////////
        echo "<div class='experience'>Base Experience:".$pokemonArr->base_experience."</div>";
        echo "\n";

        //moves////////////////////////////////////////////////////////////////////
        $moves=$pokemonArr->moves;//gets abilities of that one pokemon
        echo "<div class='Moves'>Moves:";

        //for some reason gold and silver uses crystal as its group name on moves
        echo "<select class=moves>Move:";
        $tempSwitch=$game;
        if($game=="gold"||$game=="silver")
        {
            $game="crystal";
        }
        for($x=0; $x<count($moves);$x++)
        {
            $versionDetails=$moves[$x]->version_group_details;

            for($z=0;$z<count($versionDetails);$z++)
            {
                if($versionDetails[$z]->version_group->name==$game)//check if move is part of this current game
                {
                    echo "<option value=".$moves[$x]->move->name.">".$moves[$x]->move->name."</option>";
                }
            }
        }
        $game=$tempSwitch;
        echo "</select><div class='moveInfo'></div></div>\n";

        //abilities///////////////////////////////////////////////////////////////
        $abilities=$pokemonArr->abilities;//gets abilities of that one pokemon
        $isAbilities=false;//check if there is abilities(added gen-3 so needed)
        echo "<div class='ability'>Abilities:";
        echo "<select class='abilities'>";
        for($x=0; $x<count($abilities);$x++)
        {
            //must check generation since some generations don't have any
            //and those that do add more.
            $abilitiesData=file_get_contents($abilities[$x]->ability->url);//check generation
            $abilitiesArr=json_decode($abilitiesData);//check generation array
            if($abilitiesArr->generation->name==$generation){
                echo "<option value=".$abilities[$x]->ability->name.">".$abilities[$x]->ability->name."</option>";
                $isAbilities=true;
            }
        }
        if(!$isAbilities)
        {
            echo "<option>none</option>";
        }
        echo "</select><div class=abilityInfo></div></div>\n";

        //forms///////////////////////////////////////////////////////////////////
        $forms=$pokemonArr->forms;//gets forms of that pokemon
        echo "Forms:";
        for($x=0; $x<count($forms);$x++)
        {
            echo $forms[$x]->name;
        }
        echo "\n";

        //////////////////////////////////SPECIES RELATED DATA////////////////////////////

        //flavor text entries//////////////////////////////////////////////////
        echo "<div class=flavorText>Flavor text:";
        $flavorTexts=$speciesArr->flavor_text_entries;
        //loop goes until it finds the right language (en or English) and version
        //for now must create a selector if its a mostly identical game version ex red-blue since flavor texts for red and blue may be different
        if(strpos($game, '-')==true)//check for - dashes since situations where this will become an issue will lie here
        {
            echo "<select class=flavortexts>";
        }
        for($x=0; $x<count($flavorTexts);$x++)
        {
            if($flavorTexts[$x]->language->name=="en")//correct language
            {
                //if game is the same or is contained inside game name echo
                if(strpos($game, '-')==true)//check for - dashes since situations where this will become an issue will lie here
                {
                    //potential error with ruby-sapphire and omega-ruby-alpha-sapphire
                    if(strpos($game, $flavorTexts[$x]->version->name)!=false&& !($game=="omega-ruby-alpha-sapphire"&&($flavorTexts[$x]->version->name=="ruby"||$flavorTexts[$x]->version->name=="sapphire")))
                    {
                        echo "<option value=".$flavorTexts[$x]->flavor_text.">".$flavorTexts[$x]->flavor_text."</option>";
                    }
                }
                else if($game==$flavorTexts[$x]->version->name)
                {
                    echo $flavorTexts[$x]->flavor_text;
                }
                
            }
        }
        if(strpos($game, '-')==true)//check for - dashes since situations where this will become an issue will lie here
        {
            echo "</select>";
        }
        echo"</div>\n";

        //shape////////////////////////////////////////////////////////////////
        echo "<div class='shape'>Shape:";
        if($speciesArr->shape!=NULL){
            echo $speciesArr->shape->name;
        }
        else{echo "Unknown";}
        echo"</div>\n";

        //base happiness///////////////////////////////////////////////////////
        echo "<div class='baseHapiness'>Base Hapiness:";
        echo $speciesArr->base_happiness;
        echo"</div>\n";

        //evolves from species/////////////////////////////////////////////////
        
        //evolution chain//////////////////////////////////////////////////////
        //some difficulty must do tree traversal
        //echo "Evolution Chain:";

        // $evolutionData=file_get_contents($speciesArr->evolution_chain->url);//get evolution data
        // $evolutionArr=json_decode($evolutionData);//array for evolution data
        // $chainArr=$evolutionArr->chain;//starting point will change

        // $reachedEndofChain=false;//exits once reached end of chain
        // //ends chain once reached current pokemon
        // while(!$reachedEndofChain)
        // {
        //     echo $chainArr->species->name;//echo out species
        //     //figure out the next in line if their is one
        //     for()//can be multiple branches sadly may run it issues
        //     {
        //         $chainArr=$chainArr->evolves_to[$y];
        //         if(count($chainArr)==0)//evolves_to is empty so reached end of chain
        //         {
        //             $reachedEndofChain=true;
        //         }
        //     }
        // }
        //echo "\n"

        //capture rate/////////////////////////////////////////////////////////
        echo "<div class='captureRate'>Capture Rate:";
        echo $speciesArr->capture_rate;
        echo"</div>\n";

        //growth rate//////////////////////////////////////////////////////////
        echo "<div class='growthRate'>Growth Rate:";
        echo $speciesArr->growth_rate->name;
        echo"</div>\n";

        echo "</div>\n";
    }
?>