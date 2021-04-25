// SELECT CVS
const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");



// GAME VARS AND CONSTS
let frames = 0;
const DEGREE = Math.PI / 180;

// LOAD SPRITE IMAGE
const sprite = new Image();
sprite.src = "pictures/sprite.png";

const background = new Image();
background.src = "pictures/background.jpg";

const ground = new Image();
ground.src = "pictures/ground.png";

const getReadyPic = new Image();
getReadyPic.src = "pictures/getReady.png";

const unmute = new Image();
unmute.src = "pictures/sound.png";

const mute = new Image();
mute.src = "pictures/mute.png";

const angry_bird = new Image();
angry_bird.src = "pictures/bird.png";

var counter_show_text = 0;

// LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "audio/assets_point.mp3";

const FLAP = new Audio();
FLAP.src = "audio/sounds_fly.mp3";

const HIT = new Audio();
HIT.src = "audio/assets_lose.mp3";


const DIE = new Audio();
DIE.src = "audio/assets_lose.mp3";

const CHALLENGE_SCORE = 15;

// GAME STATE
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
}

// START BUTTON COORD
const startBtn = {
    x: 270,
    y: 263,
    w: 83,
    h: 29
}

const soundBtn = {
    x: 15,
    y: 15,
    w: 35,
    h: 35
}

// CONTROL THE GAME
cvs.addEventListener("click", function(evt) {

    let rect = cvs.getBoundingClientRect();
    let clickX = evt.clientX - rect.left;
    let clickY = evt.clientY - rect.top;

    if (clickX > soundBtn.x && clickX <= soundBtn.x + soundBtn.w && clickY >= soundBtn.y && clickY < soundBtn.y + soundBtn.h) {
        if (sound.isSound) {
            sound.isSound = false;
        } else {
            sound.isSound = true;
        }
    }

    switch (state.current) {
        case state.getReady:
            state.current = state.game;
            counter_show_text = 0;
            break;
        case state.game:
            if (bird.y - bird.radius <= 0) return;
            bird.flap();
            if (sound.isSound) {
                FLAP.play();
            }
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;

            // CHECK IF WE CLICK ON THE START BUTTON
            if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
                pipes.reset();
                obstacle.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
            }
            break;
    }
});

// SOUND
const sound = {
    sX: 0,
    sY: 0,
    w: 35,
    h: 35,
    x: 15,
    y: 15,

    isSound: true,

    draw: function() {
        if (this.isSound) {
            ctx.drawImage(unmute, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        } else {
            ctx.drawImage(mute, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}



// BACKGROUND
const bg = {
    sX: 0,
    sY: 0,
    w: 640,
    h: 480,
    x: 0,
    y: 0,

    draw: function() {

        ctx.drawImage(background, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    }

}

// FOREGROUND
const fg = {
    sX: 0,
    sY: 0,
    w: 640,
    h: 118,
    x: 0,
    y: cvs.height - 112,

    dx: 2,

    draw: function() {
        ctx.drawImage(ground, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        ctx.drawImage(ground, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },

    update: function() {
        if (state.current == state.game) {
            this.x = (this.x - this.dx) % (this.w / 2);
        }
    }
}

// BIRD
const bird = {
    animation: [
        { sX: 276, sY: 112 },
        { sX: 276, sY: 139 },
        { sX: 276, sY: 164 },
        { sX: 276, sY: 139 }
    ],
    x: 50,
    y: 150,
    w: 34,
    h: 26,

    radius: 12,

    frame: 0,

    gravity: 0.25,
    jump: 4.6,
    speed: 0,
    rotation: 0,

    draw: function() {
        let bird = this.animation[this.frame];

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h);

        ctx.restore();
    },

    flap: function() {
        this.speed = -this.jump;
    },

    update: function() {
        // IF THE GAME STATE IS GET READY STATE, THE BIRD MUST FLAP SLOWLY
        this.period = state.current == state.getReady ? 10 : 5;
        // WE INCREMENT THE FRAME BY 1, EACH PERIOD
        this.frame += frames % this.period == 0 ? 1 : 0;
        // FRAME GOES FROM 0 To 4, THEN AGAIN TO 0
        this.frame = this.frame % this.animation.length;

        if (state.current == state.getReady) {
            this.y = 150; // RESET POSITION OF THE BIRD AFTER GAME OVER
            this.rotation = 0 * DEGREE;
        } else {
            this.speed += this.gravity;
            this.y += this.speed;

            if (this.y + this.h / 2 >= cvs.height - fg.h) {
                this.y = cvs.height - fg.h - this.h / 2;
                if (state.current == state.game) {
                    state.current = state.over;
                    if (sound.isSound) {
                        DIE.play();
                    }

                }
            }

            // IF THE SPEED IS GREATER THAN THE JUMP MEANS THE BIRD IS FALLING DOWN
            if (this.speed >= this.jump) {
                this.rotation = 90 * DEGREE;
                this.frame = 1;
            } else {
                this.rotation = -25 * DEGREE;
            }
        }

    },
    speedReset: function() {
        this.speed = 0;
    }
}

// GET READY MESSAGE
const getReady = {
    sX: 0,
    sY: 0,
    w: 230,
    h: 216,
    x: cvs.width / 2 - 108,
    y: 80,

    draw: function() {
        if (state.current == state.getReady) {
            ctx.drawImage(getReadyPic, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }

}

// GAME OVER MESSAGE
const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.width / 2 - 225 / 2,
    y: 90,

    draw: function() {
        if (state.current == state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }

}

// PIPES
const pipes = {
    position: [],

    top: {
        sX: 553,
        sY: 0
    },
    bottom: {
        sX: 502,
        sY: 0
    },

    w: 53,
    h: 400,
    gap: 140,
    maxYPos: -150,
    dx: 2,


    draw: function() {

        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            // top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);

            // bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
        }

    },

    update: function() {
        if (state.current !== state.game) return;

        if (frames % 100 == 0) {
            this.position.push({
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1)
            });
        }
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let bottomPipeYPos = p.y + this.h + this.gap;

            // COLLISION DETECTION
            // TOP PIPE
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
                state.current = state.over;
                if (sound.isSound) {
                    HIT.play();
                }

            }
            // BOTTOM PIPE
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h) {
                state.current = state.over;
                if (sound.isSound) {
                    HIT.play();
                }

            }

            // MOVE THE PIPES TO THE LEFT
            p.x -= this.dx;

            // if the pipes go beyond canvas, we delete them from the array
            if (p.x + this.w <= 0) {
                this.position.shift();
                score.value += 1;
                if (sound.isSound) {
                    SCORE_S.play();
                }

                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },

    reset: function() {
        this.position = [];
    }

}


// OBSTACLE
const obstacle = {
    position: [],

    sX: 0,
    sY: 0,
    w: 35,
    h: 35,
    x: cvs.width,
    y: cvs.height / 2,

    dx: 5,

    draw: function() {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            ctx.drawImage(angry_bird, this.sX, this.sY, this.w, this.h, p.x, p.y, this.w, this.h);
        }
    },

    update: function() {
        if (state.current !== state.game) return;

        if (frames % 100 == 0) {
            this.position.push({
                x: cvs.width,
                y: (362 * Math.random() + 1)
            });
        }
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            // COLLISION DETECTION
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
                state.current = state.over;
                if (sound.isSound) {
                    HIT.play();
                }

            }

            p.x -= 3;;

            if (p.x + this.w <= 0) {
                this.position.shift();
            }
        }
    },

    reset: function() {
        this.position = [];
    }

}




var textAlpha = (function() {
    var alpha = 1,
        shouldIncrease = false;
    return {
        fluctuate: function() {
            if (alpha < 0) shouldIncrease = true;
            if (alpha > 1) shouldIncrease = false;

            if (shouldIncrease) alpha += 0.02;
            else alpha -= 0.02;

            return alpha;
        },
        get: function() {
            return alpha;
        }
    };
})();


// CHALLENGE
function challenge() {
    if (score.value >= CHALLENGE_SCORE) {
        pipes.gap = 110;
        obstacle.draw();
    } else {
        pipes.gap = 140;
    }
}


function ChallengeAlert() {
    ctx.font = "25px Teko";
    ctx.strokeStyle = 'rgba(0,0,0,' + textAlpha.get() + ')';
    ctx.strokeText('Good! You have moved on to the next challenge!', cvs.width / 2 - 250, 420);
    ctx.fillStyle = 'rgba(255,255,255,' + textAlpha.get() + ')';
    ctx.fillText('Good! You have moved on to the next challenge!', cvs.width / 2 - 250, 420);
    textAlpha.fluctuate();

}



const silver_medal = {
    sX: 358,
    sY: 113,
    w: 47,
    h: 43,
    x: 229,
    y: 176,

    draw: function() {
        if (state.current == state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

const bronze_medal = {
    sX: 360,
    sY: 159,
    w: 47,
    h: 43,
    x: 232,
    y: 176,

    draw: function() {
        if (state.current == state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

const gold_medal = {
    sX: 312,
    sY: 158,
    w: 47,
    h: 43,
    x: 232,
    y: 176,

    draw: function() {
        if (state.current == state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

// SCORE
const score = {
    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,

    draw: function() {
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";

        if (state.current == state.game) {
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width / 2, 50);
            ctx.strokeText(this.value, cvs.width / 2, 50);

        } else if (state.current == state.over) {
            // SCORE VALUE
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 380, 186);
            ctx.strokeText(this.value, 380, 186);
            // BEST SCORE
            ctx.fillText(this.best, 380, 228);
            ctx.strokeText(this.best, 380, 228);
        }
    },

    reset: function() {
        this.value = 0;
    }
}

// DRAW
function draw() {

    //ctx.fillStyle = "#70c5ce";
    //ctx.fillRect(0, 0, cvs.width, cvs.height);

    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();

    sound.draw();

    // if (score.value >= CHALLENGE_SCORE) {
    //     obstacle.draw();
    // }
    challenge();
    if (score.value >= CHALLENGE_SCORE && counter_show_text < 200) {
        ChallengeAlert();
        counter_show_text++;
    }

    gameOver.draw();
    score.draw();

    if (score.value >= score.best) {
        gold_medal.draw();
    } else if (score.value >= 10) {
        bronze_medal.draw();
    } else if (score.value >= 5) {
        silver_medal.draw();
    }


}

// UPDATE
function update() {
    bird.update();
    fg.update();
    pipes.update();
    if (score.value >= CHALLENGE_SCORE) {
        obstacle.update();
    }
}

// LOOP
function loop() {
    update();
    draw();
    frames++;

    requestAnimationFrame(loop);
}
loop();