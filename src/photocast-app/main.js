import '@webcomponents/webcomponentsjs/webcomponents-loader.js';
import './ifg-photo-button.js';

window.addEventListener('ifg-photo-button-click', handleCastUrl);

window['__onGCastApiAvailable'] = function (isAvailable) {
    if (isAvailable) {
        initializeCastApi();
    }
};

function initializeCastApi() {
    cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: '06B87EDE',
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });

    var context = cast.framework.CastContext.getInstance();
    context.addEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        function (event) {
            switch (event.sessionState) {
                case cast.framework.SessionState.SESSION_STARTED:
                    console.log('CastContext: CastSession started');
                    var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
                    console.log(castSession);

                    castSession.addMessageListener('urn:x-cast:com.example.namespace',
                        function (ns, message) {
                            console.log("message:", message);
                        }
                    );

                    break;
                case cast.framework.SessionState.SESSION_RESUMED:
                    console.log('CastContext: CastSession resumed');
                    var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
                    console.log(castSession);

                    castSession.addMessageListener('urn:x-cast:com.example.namespace',
                        function (ns, message) {
                            console.log("message:", message);
                        }
                    );

                    break;
                case cast.framework.SessionState.SESSION_ENDED:
                    console.log('CastContext: CastSession disconnected');
                    // Update locally as necessary
                    break;
            }
        });
};


function handleCastUrl(event) {
    console.log("main ", event.detail);
    let action = event.detail;
  
    castUrl(action.photoUrl);
  };

function castUrl(castUrl) {
    mode = DEFAULT_MODE;
    rotation = DEFAULT_ROTATION;
    panSpeed = DEFAULT_PAN_SPEED;
    
    let message = { 
        type: "CAST_URL",
        url: castUrl,
        mode: mode,
        rotation: rotation,
        panSpeed: panSpeed
    };
    message = JSON.stringify(message);
    console.log(message);

    let castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    if (castSession) {
        castSession.sendMessage('urn:x-cast:com.example.namespace', message)
        .then(() => console.log("castUrl ok"))
        .catch((error) => console.log("castUrl NOK:", error));
    }
};

function changeDisplay() {
    let message = { 
        type: "CHANGE_DISPLAY",
        mode: mode,
        rotation: rotation,
        panSpeed: panSpeed
    };
    message = JSON.stringify(message);
    console.log(message);

    let castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    if (castSession) {
        castSession.sendMessage('urn:x-cast:com.example.namespace', message)
        .then(() => console.log("changeDisplay ok"))
        .catch((error) => console.log("changeDisplay NOK:", error));
    }
};

function changePanSpeed() {
    let message = { 
        type: "CHANGE_PAN_SPEED",
        panSpeed: panSpeed
    };
    message = JSON.stringify(message);
    console.log(message);

    let castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    if (castSession) {
        castSession.sendMessage('urn:x-cast:com.example.namespace', message)
        .then(() => console.log("changePanSpeed ok"))
        .catch((error) => console.log("changePanSpeed NOK:", error));
    }
};


function enterFolderUrl(folderUrl) {
    // remove buttons of the previous folder
    let toRemoveElements = document.querySelectorAll(".castUrl,.parentFolder,.childFolder");
    for (let toRemoveElement of toRemoveElements) {
        toRemoveElement.parentNode.removeChild(toRemoveElement);
    }

    // add buttons of the current folder.
    parseFolder(folderUrl);
}

function getThumbnailUrl(path, fileName) {
    let thumbnailFileName = fileName.substr(0, fileName.lastIndexOf(".")) + ".jpg";
    return path + "thumbnails/" + thumbnailFileName;
}

function parseFolder(path) {
    $.get(path).done(function (html) {
        //console.log(html);
        let photosDiv = document.getElementById("photos");
        let foldersDiv = document.getElementById("folders");
        let response = $(html);

        // find all links ending with .jpg
        response.find('a[href$=".jpg"],a[href$=".JPG"],a[href$=".png"],a[href$=".PNG"]').each(function () {
            let fileName = $(this).text();
            let fileUrl = $(this).attr('href');
            let fileSize = $(this).parent().next().next().text();

            // Create a button to cast the jpeg file.
            let button = document.createElement("ifg-photo-button");
            button.classList.add("castUrl");
            button.photoName = fileName;
            button.photoSize = fileSize;
            button.photoUrl = path.replace('https','http') + fileUrl; 
            button.thumbnailUrl = getThumbnailUrl(path, fileName);
            photosDiv.appendChild(button);
        })

        // find all links ending with /
        response.find('a[href$="/"]').each(function () {
            let folderName = $(this).text();
            let folderUrl = $(this).attr('href');

            if (folderUrl == '/') {
                // We reached the startFolder.
                return;
            }

            if (folderUrl == 'thumbnails/') {
                // don't display thumbnails folder.
                return;
            }

            // Create a button to navigate to this folder.
            let button = document.createElement("button");
            button.innerHTML = folderName.replace(/\/$/, '');;
            foldersDiv.appendChild(button);
            let newFolderUrl = '';
            if (folderUrl.startsWith('/')) {
                // parent folder.
                newFolderUrl = startUrl + folderUrl;
                button.classList.add("parentFolder");
            } else {
                newFolderUrl = path + folderUrl;
                button.classList.add("childFolder");
            }
            button.addEventListener("click", function () {
                enterFolderUrl(newFolderUrl);
            });
        })
    });
}

function addCommands() {
    let commandsDiv = document.getElementById("commands");
    let button0 = document.createElement("button");
    button0.innerHTML='0';
    button0.addEventListener("click", function () {
        rotation = 0;
        changeDisplay();
    });
    commands.appendChild(button0);    

    let button90 = document.createElement("button");
    button90.innerHTML='90';
    button90.addEventListener("click", function () {
        rotation = 90;
        changeDisplay();
    });
    commands.appendChild(button90);    

    let buttonMinus90 = document.createElement("button");
    buttonMinus90.innerHTML='-90';
    buttonMinus90.addEventListener("click", function () {
        rotation = -90;
        changeDisplay();
    });
    commands.appendChild(buttonMinus90);    

    let button180 = document.createElement("button");
    button180.innerHTML='180';
    button180.addEventListener("click", function () {
        rotation = 180;
        changeDisplay();
    });
    commands.appendChild(button180);    

    let buttonStretch = document.createElement("button");
    buttonStretch.innerHTML='Stretch';
    buttonStretch.addEventListener("click", function () {
        mode = 0;
        changeDisplay();
    });
    commands.appendChild(buttonStretch);    

    let buttonFit = document.createElement("button");
    buttonFit.innerHTML='Fit';
    buttonFit.addEventListener("click", function () {
        mode = 1;
        changeDisplay();
    });
    commands.appendChild(buttonFit);    

    let buttonPan = document.createElement("button");
    buttonPan.innerHTML='Pan';
    buttonPan.addEventListener("click", function () {
        mode = 2;
        changeDisplay();
    });
    commands.appendChild(buttonPan);    

    let buttonPanSpeed05 = document.createElement("button");
    buttonPanSpeed05.innerHTML='Pan Speed 0.5';
    buttonPanSpeed05.addEventListener("click", function () {
        panSpeed = 0.5;
        changePanSpeed();
    });
    commands.appendChild(buttonPanSpeed05);    

    let buttonPanSpeed1 = document.createElement("button");
    buttonPanSpeed1.innerHTML='Pan Speed 1';
    buttonPanSpeed1.addEventListener("click", function () {
        panSpeed = 1;
        changePanSpeed();
    });
    commands.appendChild(buttonPanSpeed1);    

    let buttonPanSpeed2 = document.createElement("button");
    buttonPanSpeed2.innerHTML='Pan Speed 2';
    buttonPanSpeed2.addEventListener("click", function () {
        panSpeed = 2;
        changePanSpeed();
    });
    commands.appendChild(buttonPanSpeed2);    

    let buttonPanSpeed4 = document.createElement("button");
    buttonPanSpeed4.innerHTML='Pan Speed 4';
    buttonPanSpeed4.addEventListener("click", function () {
        panSpeed = 4;
        changePanSpeed();
    });
    commands.appendChild(buttonPanSpeed4);    
}

var startUrl = 'https://ORDI-TELE';
var startFolder = startUrl + '/photos/';
const DEFAULT_MODE = 1;
const DEFAULT_ROTATION = 0;
const DEFAULT_PAN_SPEED = 1;
var mode = DEFAULT_MODE;
var rotation = DEFAULT_ROTATION;
var panSpeed = DEFAULT_PAN_SPEED;

parseFolder(startFolder);
addCommands();

