<?php
    $BaseURL="https://pokeapi.co/api/v2/move";

    $move=0;
    if(array_key_exists('move', $_GET)){
        $move = $_GET['move'];
    }

    $generation="generation-i";//generation being used
    if(array_key_exists('generation', $_GET)){
        $generation = $_GET['generation'];
    }

    $game="red-blue";//game within that generation being used;
    if(array_key_exists('game', $_GET)){
        $game = $_GET['game'];
    }

    $URL="$BaseURL/$move";

    $data=file_get_contents($URL);

    $pokemonMoveArr=json_decode($data);

    header('content-type:application/json');      // tell the requestor that this is JSON
    header("Access-Control-Allow-Origin: *");     // turn on CORS
    
    //move flavor text///////////////////////////////////////////////
    $flavorTextEntries=$pokemonMoveArr->flavor_text_entries;
    echo "<ul><li>Type:".$pokemonMoveArr->type->name."</li>";
    for($i=0;$i<count($flavorTextEntries);$i++)
    {
        if($flavorTextEntries[$i]->language->name=="en"&&$flavorTextEntries[$i]->version_group->name==$game)
        {
            echo "<li>Flavor Text: ".$flavorTextEntries[$i]->flavor_text."</li>";
        }
    }
    //effect entry/////////////////////////////////////////////////////
    $effectEntries=$pokemonMoveArr->effect_entries;
    for($i=0;$i<count($effectEntries);$i++)
    {
        if($effectEntries[$i]->language->name=="en")
        {
            if(strpos($effectEntries[$i]->short_effect, '$effect_chance')){//sometimes uses effect chance need to put the value in the string
                $newEntry=str_ireplace('$effect_chance',$pokemonMoveArr->effect_chance,$effectEntries[$i]->short_effect);
                echo "<li>Effect: ".$newEntry."</li>";
            }
            else{echo "<li>Effect: ".$effectEntries[$i]->short_effect."</li>";}
        }
    }
    //accuracy///////////////////////////////////////////////////////////
    if($pokemonMoveArr->accuracy!=null)
    {
        echo "<li>Accuracy:".$pokemonMoveArr->accuracy."</li>";
    }
    //pp////////////////////////////////////////////////////////////////
    if($pokemonMoveArr->pp!=null)
    {
        echo "<li>PP:".$pokemonMoveArr->pp."</li>";
    }
?>