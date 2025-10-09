console.log("starting javascript section....")


let currentsong = new Audio;
let songs;
let currfolder;

function rep(str, search, replacement) {
  const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
  return str.replace(pattern, replacement);
}


function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    let formattedMinutes = String(minutes).padStart(2,'0');
    let formattedSeconds = String(secs).padStart(2,'0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getsongs(folder) {
    currfolder = folder;
    // Directly fetch the info.json for the current folder
    let a = await fetch(`songs/${folder}/info.json`);
    let response = await a.json();

    // The songs are listed in the info.json file
    songs = response.songs; 

    let songurl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songurl.innerHTML = ""; 
    
    for (const song of songs) {
        songurl.innerHTML = songurl.innerHTML + `<li>
                                                    <img src="svg icons/music.svg" style="filter: invert(1);" alt="">
                                                    <div class="info">
                                                        <div class="songname">${song.name}</div>
                                                        <div class="artistname">${song.artist}</div>
                                                    </div>
                                                    <img src="svg icons/play-music.svg" alt="">
                                                </li>`;
    }

    // Add click listeners to the new song list
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => { 
            let songName = e.querySelector(".info").firstElementChild.innerHTML;
            let artistName = e.querySelector(".info").lastElementChild.innerHTML;
            playmusic(songName, artistName);
        });
    });
}

const playmusic = (track, artist) => {
    // Find the corresponding song file from the 'songs' array
    const songFile = songs.find(s => s.name === track && s.artist === artist);

    if (songFile) {
        currentsong.src = `songs/${currfolder}/${songFile.file}`;
        currentsong.play();
        play.src = "svg icons/player-pause.svg";
        document.querySelector(".music-info").innerHTML = `${track}  ${artist}`;
        
        // Set volume
        currentsong.volume = 0.2;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
    }
}

async function getalbums() {
    // 1. Fetch the list of all album folders from your new manifest file
    let albumResponse = await fetch('albums.json');
    let albumData = await albumResponse.json();
    let albums = albumData.albums;

    let cardscontainer = document.querySelector(".cards-container");
    cardscontainer.innerHTML = ""; // Clear existing cards

    // 2. Loop through each album folder name
    for (const foldername of albums) {
        
        // 3. Fetch the specific info.json for that album
        try {
            let infoResponse = await fetch(`songs/${foldername}/info.json`);
            if (!infoResponse.ok) continue; // Skip if info.json is not found
            
            let response = await infoResponse.json();
            
            cardscontainer.innerHTML += `<div data-folder="${response.folder}" class="card">
                                            <div class="image-cont">
                                                <img src="${response.image}" alt="${response.title}">
                                                <div class="play-btn">
                                                    <button>
                                                        <span><img src="https://img.icons8.com/?size=100&id=59862&format=png&color=000000"></span>
                                                    </button>
                                                </div>  
                                            </div>
                                            <div class="song-details">
                                                <div class="song-name">
                                                    <a href="#">${response.title}</a>
                                                </div>
                                                <div class="artist">
                                                    <a href="#">${response.type}</a>
                                                </div>
                                            </div>
                                        </div>`;
        } catch (error) {
            console.error(`Could not load album: ${foldername}`, error);
        }
    }

    // Add event listeners after all cards are created
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getsongs(`${item.currentTarget.dataset.folder}`);
        });
    });
}


async function main() {
    await getsongs("radharani");

    await getalbums();

    play.addEventListener("click",()=>{
        if(currentsong.paused){
            currentsong.play();
            play.src = "svg icons/player-pause.svg";
        }
        else{
            currentsong.pause();
            play.src = "svg icons/player-play.svg";
        }
    })


    currentsong.addEventListener("timeupdate",()=>{
        document.querySelector(".duration").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`        
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";

        if(currentsong.currentTime == currentsong.duration){
            // Get the filename of the currently playing song
            const currentSongFilename = currentsong.src.split("/").pop();
            let fsongname = rep(currentSongFilename,"%20"," ");

            // Find the index of the current song in our songs array
            const currentIndex = songs.findIndex(song => song.file === fsongname);

            // Check if a next song exists
            if (currentIndex !== -1 && currentIndex + 1 < songs.length) {
                const nextSong = songs[currentIndex + 1];
                playmusic(nextSong.name, nextSong.artist);
            }
        }
    })

    document.querySelector(".seeker").addEventListener("click",e=>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100; 

    })
    
    prev.addEventListener("click",()=>{

        // Get the filename of the currently playing song
        const currentSongFilename = currentsong.src.split("/").pop();
        console.log(currentSongFilename);
        let fsongname = rep(currentSongFilename,"%20"," ");
        console.log(fsongname);
        // Find the index of the current song in our songs array
        const currentIndex = songs.findIndex(song => song.file === fsongname);
        console.log(currentIndex);
        // Check if a next song exists
        if (currentIndex !== -1 && currentIndex - 1 >= 0) {
            const nextSong = songs[currentIndex - 1];
            playmusic(nextSong.name, nextSong.artist);
        }

    })

    next.addEventListener("click", () => {

        // Get the filename of the currently playing song
        const currentSongFilename = currentsong.src.split("/").pop();
        let fsongname = rep(currentSongFilename,"%20"," ");

        // Find the index of the current song in our songs array
        const currentIndex = songs.findIndex(song => song.file === fsongname);

        // Check if a next song exists
        if (currentIndex !== -1 && currentIndex + 1 < songs.length) {
            const nextSong = songs[currentIndex + 1];
            playmusic(nextSong.name, nextSong.artist);
        }

    })


    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentsong.volume = parseInt(e.target.value)/100;
    })

    document.querySelector(".vol-img").addEventListener("click",e=>{

            if(e.target.src.includes("volume.svg")){
                e.target.src = e.target.src.replace("volume.svg","mute.svg");
                currentsong.volume = 0;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            }
            else{
                e.target.src = e.target.src.replace("mute.svg","volume.svg");
                currentsong.volume = 0.2;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
            }
    })

   
}

main()
