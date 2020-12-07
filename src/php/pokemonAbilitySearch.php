<?php
    $BaseURL="https://pokeapi.co/api/v2/ability/";

    $ability=0;
    if(array_key_exists('ability', $_GET)){
        $ability = $_GET['ability'];
    }

    $generation="generation-i";//generation being used
    if(array_key_exists('generation', $_GET)){
        $generation = $_GET['generation'];
    }

    $game="red-blue";//game within that generation being used;
    if(array_key_exists('game', $_GET)){
        $game = $_GET['game'];
    }

    $URL="$BaseURL/$ability";

    $data=file_get_contents($URL);

    $pokemonAbilityArr=json_decode($data);

    header('content-type:application/json');      // tell the requestor that this is JSON
    header("Access-Control-Allow-Origin: *");     // turn on CORS
    
    //ability flavor text///////////////////////////////////////////////
    $flavorTextEntries=$pokemonAbilityArr->flavor_text_entries;
    for($i=0;$i<count($flavorTextEntries);$i++)
    {
        if($flavorTextEntries[$i]->language->name=="en"&&$flavorTextEntries[$i]->version_group->name==$game)
        {
            echo "<li>Flavor Text: ".$flavorTextEntries[$i]->flavor_text."</li>";
        }
    }
    //effect entry/////////////////////////////////////////////////////
    $effectEntries=$pokemonAbilityArr->effect_entries;
    for($i=0;$i<count($effectEntries);$i++)
    {
        if($effectEntries[$i]->language->name=="en")
        {
            if(strpos($effectEntries[$i]->short_effect, '$effect_chance')){//sometimes uses effect chance need to put the value in the string
                $newEntry=str_ireplace('$effect_chance',$pokemonAbilityArr->effect_chance,$effectEntries[$i]->short_effect);
                echo "<li>Effect: ".$newEntry."</li>";
            }
            else{echo "<li>Effect: ".$effectEntries[$i]->short_effect."</li>";}
        }
    }
?>