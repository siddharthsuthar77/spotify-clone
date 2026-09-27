console.log("Hello Javascript");

let currentsong = new Audio();
let songs;
let currentfolder;

function formatTime(secondsWithMilliseconds) {
  const totalSeconds = Math.floor(secondsWithMilliseconds); // Ignore milliseconds
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

//To show all songs in playlist:
async function getSongs(folder) {
  currentfolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let links = div.querySelectorAll("#files a");

  songs = [];

  links.forEach((link) => {
    if (link.href.endsWith(".mp3")) {
      songs.push(link.href.split(`/${folder}/`)[1]);
      //songs.push(link.href);
    }

    //return songs ;
  });

  //to show all the songs in the playlist:
  let songUL = document
    .querySelector(".songlists")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    //songUL.innerHTML = songUL.innerHTML + song;
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                <i class="hgi hgi-stroke hgi-rounded hgi-music-note-03"></i>
                <div class="songinfo">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>Siddharth</div>
                </div>
                <div class="songplaynow">
                  <span>Play now</span>
                  <i class="hgi hgi-stroke hgi-rounded hgi-play-circle-02"></i>
                </div>
              </li>`;
  }

  //attaching an event listener to each song:
  Array.from(
    document.querySelector(".songlists").getElementsByTagName("li"),
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".songinfo").firstElementChild.innerHTML);
      playMusic(
        e.querySelector(".songinfo").firstElementChild.innerHTML.trim(),
      );
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  currentsong.src = `/${currentfolder}/` + track;

  if (!pause) {
    currentsong.play();
    play.src = "./Iconss/pause3.svg";
  }

  document.querySelector(".songnamebar").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function DisplayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/songs_projects/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");

  let cardcontainer = document.querySelector(".card-container");

  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    let parts = e.href.split("/");
    let folder = parts.pop();

    console.log("Album folder:", folder);

    // Only process folders, ignore files like cover.jpeg
    if (folder !== "songs_projects" && folder !== "" && !folder.includes(".")) {
      let a = await fetch(
        `http://127.0.0.1:5500/songs_projects/${folder}/info.json`,
      );

      let response = await a.json();

      console.log("Album info:", response);

      cardcontainer.innerHTML =
        cardcontainer.innerHTML +
        `<div data-folder="${folder}" class="card">

                    <div class="playbtn">
                        <i class="hgi hgi-stroke hgi-rounded hgi-play"></i>
                    </div>

                    <img
                        src="/songs_projects/${folder}/cover.jpeg"
                        alt="No img available"
                    />

                    <h2>${response.title}</h2>

                    <p>${response.description}</p>

                </div>`;
    }
  }

  // Load playlist when card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("CARD CLICKED");

      let folder = item.currentTarget.dataset.folder;

      console.log("Folder:", folder);

      await getSongs(`songs_projects/${folder}`);
    });
  });
}

async function main() {
  const play = document.querySelector("#play");
  const previous = document.querySelector("#previous");
  const next = document.querySelector("#next");
  //Get list of all songs:
  await getSongs("songs_projects/ncs");
  playMusic(songs[0], true);

  //Display all albums on the page:
  //DisplayAlbums()
  DisplayAlbums();

  //attach event listner to play, previous and next:
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "./Iconss/pause3.svg";
    } else {
      currentsong.pause();
      play.src = "./Iconss/playmusic.svg";
    }
  });

  //Time update event:
  currentsong.addEventListener("timeupdate", () => {
    console.log(currentsong.currentTime, currentsong.duration);
    document.querySelector(".songtime").innerHTML =
      `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  //Add an event listner to seekbar:
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percnt = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percnt + "%";
    currentsong.currentTime = (currentsong.duration * percnt) / 100;
  });

  //add an event listener for hamburger:
  document.querySelector(".hamburgerr").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //add an event listener for close button:
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //Adding an event listner for preivious and next:
  previous.addEventListener("click", () => {
    console.log("Previous click");
    console.log(currentsong);
    //currentsong.pause();
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    console.log("next click");
    //currentsong.pause()
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //adding an event listner for volume bar:
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("setting volume to ", e.target.value, "out of 100");
      currentsong.volume = parseInt(e.target.value) / 100;
    });

  //add an event listner to mute the track:
  document.querySelector(".volume > img").addEventListener("click", (e) => {
    console.log(e.target);
    if (e.target.src.includes("./Iconss/volumebtn.svg")) {
      e.target.src = e.target.src.replace(
        "./Iconss/volumebtn.svg",
        "./Iconss/volmutebtn.svg",
      );
      currentsong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value =
        0;
    } else {
      e.target.src = e.target.src.replace(
        "./Iconss/volmutebtn.svg",
        "./Iconss/volumebtn.svg",
      );
      currentsong.volume = 0.1;
      document.querySelector(".range").getElementsByTagName("input")[0].value =
        10;
    }
  });
}

main();
