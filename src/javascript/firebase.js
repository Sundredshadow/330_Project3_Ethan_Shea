//just does all the setup wanted it seperate just in case

let firebaseConfig = {
apiKey: "AIzaSyDcoDnm9iRHimhpcVPL80HRnmql8a7IR5M",
authDomain: "pokemon-api-979f7.firebaseapp.com",
databaseURL: "https://pokemon-api-979f7.firebaseio.com",
projectId: "pokemon-api-979f7",
storageBucket: "pokemon-api-979f7.appspot.com",
messagingSenderId: "486778714078",
appId: "1:486778714078:web:51ccbbfd95c5500fb78f4f",
measurementId: "G-HPE3K12VKB"
};
function initFirebase()
{
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
    firebase.database().ref("pokemon").on("value", getMostSearched, firebaseError);
}

function getMostSearched(data)
{
    let obj = data.val();
    let mostSearched=0;
    let mostSearchedKey="";
    for (let key in obj){   // use for..in to interate through object keys
        let pokemonData = obj[key];
        if(pokemonData>mostSearched)
        {
            mostSearchedKey=key;
            mostSearched=pokemonData;
        }
    }	
    document.querySelector('#mostSearched').innerHTML="Current Most Searched Pokemon is: "+mostSearchedKey+" with "+mostSearched+" searches";
    console.log(mostSearchedKey);
    console.log(mostSearched);
}

function firebaseError(error){
    console.log(error);
}
export {initFirebase,getMostSearched,firebaseError};