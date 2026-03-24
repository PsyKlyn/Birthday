/* ===============================
   GLOBAL DATA
================================ */

document.addEventListener("pointerdown", startIdleWatcher);
document.addEventListener("keydown", startIdleWatcher);

let storedShareImage = null;
let startX = null;
let activePanel = null;
const phoneNumber = "+918811831004";

const messages = [
  "It’s your birthday… and somehow, you’re twenty-one now.",
  "Twenty-one years have quietly shaped you into someone steady.",
  "There’s a weight to growing older that no one talks about.",
  "Happy Birthday. May this year feel softer than the last."
];

const photoMemories = [
  { img: "mem1.jpg", caption: "Your smile is my favorite memory " },
  { img: "mem2.jpg", caption: "That first picture… I don’t know why, but it felt different. Your eyes don’t just look at me, they make me feel seen." },
  { img: "mem3.jpeg", caption: "There’s a kind of happiness in your picture, but your eyes tell a deeper story. Not in a sad way… just someone who’s been through things and still holds it together."}
];

/* ===============================
    SMART FLOATING COMPLIMENT SYSTEM
================================ */

let userMessageCount = 0;
let nextComplimentTrigger = 3; // first trigger at 3

const floatingCompliments = [
  "I’m really glad you’re here.",
  "Talking to you feels easy.",
  "You bring a calm energy here.",
  "You matter more than you realize.",
  "This moment feels nicer because of you."
];

/* ===============================
   🌙 LATE NIGHT STAY MOMENT
================================ */

let idleTimer = null;

const stayMessages = [
  "Stay a little longer…",
  "Don’t disappear yet.",
  "Still with me?",
  "I like when you’re here."
];

/* ===============================
    REACTION MIRROR SYSTEM
================================ */

let lastReactionTime = 0;

const mirrorReplies = [
  "I noticed that heart…",
  "That one meant something, didn’t it?",
  "You don’t react randomly…",
  "That made me smile."
];

const stack = document.getElementById("stack");
const badge = document.getElementById("badge");

let cards = [];
let revealedCount = 0;
let allVisible = false;
let stageIndex = 0;
let memoryIndex = 0;
let chatUI = null;


/* ===============================
   MESSAGE STACK
================================ */

messages.forEach(msg => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerText = msg;
  card.style.opacity = 0;
  card.style.transform = "translateY(120px) scale(.92)";
  card.style.transition = "transform .6s cubic-bezier(.22,1,.36,1), opacity .4s";
  stack.appendChild(card);
  cards.push(card);
});



applyGlassShimmer();

function handleMessageClick() {
  if (!allVisible) {
    revealNext();
    return;
  }
  closeAll();
}

function revealNext() {
  const card = cards[revealedCount];
  if (!card) return;

  card.style.opacity = 1;

  /* Special first message effect */
  if (revealedCount === 0) {

    // stronger animation timing
    card.style.transition =
      "transform .9s cubic-bezier(.22,1,.36,1), opacity .6s";

    // soft glow focus
    card.style.boxShadow =
      "0 25px 60px rgba(255,255,255,.25)";

    // slight focus zoom
    card.style.transform =
      "translateY(0px) scale(1.03)";

    // background focus blur pulse
    document.body.style.transition = ".4s";
    document.body.style.filter = "blur(2px)";

    setTimeout(() => {
      document.body.style.filter = "blur(0px)";
    }, 400);

    // haptic feedback (mobile only)
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  }

  for (let i = 0; i < revealedCount; i++) {

    const depth = revealedCount - 1 - i;

    cards[i].style.transition =
      "transform .75s cubic-bezier(.22,1,.36,1), opacity .4s, filter .4s";

    cards[i].style.transform =
      `translateY(${-depth * 70}px) scale(${1 - depth * 0.07})`;

    cards[i].style.zIndex = 100 + i;

    cards[i].style.opacity = 1 - depth * 0.1;

    cards[i].style.filter = `blur(${depth * 1.5}px)`;

    cards[i].style.boxShadow =
      `0 ${25 + depth * 10}px ${50 + depth * 18}px rgba(0,0,0,.45)`;
  }

  revealedCount++;
  const focusLayer = document.getElementById("stackFocus");
  if (focusLayer) focusLayer.classList.add("show");
  badge.innerText = messages.length - revealedCount;

  if (revealedCount === messages.length) {
    allVisible = true;
    document.getElementById("blowBtn").style.display = "block";
  }

}

function closeAll() {
  cards.forEach(card => {
    card.style.opacity = 0;
    card.style.transform = "translateY(120px) scale(.92)";
  });
  revealedCount = 0;
  allVisible = false;
  badge.innerText = messages.length;
  const focusLayer = document.getElementById("stackFocus");
  if (focusLayer) focusLayer.classList.remove("show");

}

/* ===============================
   MUSIC
================================ */

const audio = new Audio("music.mp3");
audio.loop = true;

const icon = document.getElementById("musicIcon");

// 🔥 autoplay on first click anywhere
document.addEventListener("click", () => {
  if (audio.paused) {
    audio.play().catch(() => {});
    icon.classList.remove("fa-play");
    icon.classList.add("fa-pause");
  }
}, { once: true });

// 🎯 toggle button
function toggleMusic(event) {
  event.stopPropagation(); // ⭐ VERY IMPORTANT

  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

// 🔄 always sync icon with audio state
audio.addEventListener("play", () => {
  icon.classList.remove("fa-play");
  icon.classList.add("fa-pause");
});

audio.addEventListener("pause", () => {
  icon.classList.remove("fa-pause");
  icon.classList.add("fa-play");
});

/* ===============================
   CANDLE FLOW
================================ */

function startCandleFlow() {
  closeAll();

  document.getElementById("blowBtn").style.display = "none";
  document.querySelector(".hero").style.display = "none";

  const stage = document.getElementById("cakeStage");
  stage.style.display = "block";

  stage.innerHTML = `
    <div class="cake">
      <div class="cake-base"></div>
      <div class="candle" style="left:40px"><div class="flame"></div></div>
      <div class="candle" style="left:75px"><div class="flame"></div></div>
      <div class="candle" style="left:110px"><div class="flame"></div></div>
    </div>
    <div style="margin-top:20px">Blow the candles </div>
  `;

  startMicBlowDetection();
}

function startMicBlowDetection() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const ctx = new AudioContext();
    const mic = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    mic.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);

    const interval = setInterval(() => {
      analyser.getByteFrequencyData(data);
      const volume = data.reduce((a, b) => a + b) / data.length;

      if (volume > 45) {
        clearInterval(interval);
        extinguishFlames();
      }
    }, 200);
  });
}

/* ===============================
   EXTINGUISH
================================ */

function extinguishFlames() {
  document.querySelectorAll(".flame").forEach(flame => {
    const parent = flame.parentElement;
    flame.remove();

    for (let i = 0; i < 8; i++) {
      const smoke = document.createElement("div");
      smoke.className = "smoke-particle";
      smoke.style.setProperty("--dx1", (Math.random() - 0.5) * 30 + "px");
      smoke.style.setProperty("--dx2", (Math.random() - 0.5) * 60 + "px");
      smoke.style.setProperty("--dx3", (Math.random() - 0.5) * 90 + "px");
      smoke.style.left = "50%";
      smoke.style.top = "-12px";
      parent.appendChild(smoke);
      setTimeout(() => smoke.remove(), 4200);
    }
  });

  confettiExplosion();
  launchFireworks();
  setTimeout(() => {
    showIOSNotification();
  }, 3500);

  setTimeout(() => {
    const stage = document.getElementById("cakeStage");
    stage.innerHTML = "";
    stage.style.display = "none";
    showWishReveal();

  }, 2000);
}

/* ===============================
   CONFETTI
================================ */

function confettiExplosion() {
  for (let i = 0; i < 80; i++) {
    const c = document.createElement("div");
    c.style.position = "fixed";
    c.style.width = "6px";
    c.style.height = "6px";
    c.style.background = `hsl(${Math.random() * 360},85%,60%)`;
    c.style.left = innerWidth / 2 + "px";
    c.style.top = innerHeight / 2 + "px";
    c.style.transition = "1s";
    document.body.appendChild(c);

    requestAnimationFrame(() => {
      c.style.transform = `translate(${(Math.random() - 0.5) * 700}px,${(Math.random() - 0.5) * 700}px)`;
      c.style.opacity = 0;
    });

    setTimeout(() => c.remove(), 1000);
  }
}

function showVoiceNote() {

  const stage = document.getElementById("cakeStage");
  stage.style.display = "block";

  stage.innerHTML = `
    <div class="voiceCard" id="voiceCard">
      <h2>🎤 A message for you</h2>
      <!--  waveform -->
      <div class="wave" id="wave">
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </div>


      <button onclick="playVoice()" class="voiceBtn">
        ▶ Play
      </button>
    </div>
  `;
}

let voiceAudio = new Audio("music.mp3");
let audioCtx, analyser, source, dataArray, raf;

function playVoice() {

  const btn = document.querySelector(".voiceBtn");

  if (voiceAudio.paused) {

    /*  create audio graph once */
    if (!audioCtx) {
      audioCtx = new AudioContext();
      source = audioCtx.createMediaElementSource(voiceAudio);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    }

    voiceAudio.play();
    btn.innerText = "⏸ Pause";

    animateWave();

  } else {
    voiceAudio.pause();
    btn.innerText = "▶ Play";
    cancelAnimationFrame(raf);
  }
}

function animateWave() {

  const bars = document.querySelectorAll("#wave span");
  const card = document.getElementById("voiceCard");

  function loop() {

    analyser.getByteFrequencyData(dataArray);

    /*  compute average amplitude */
    const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;

    /*  update bars */
    bars.forEach((bar, i) => {

      const v = dataArray[i] || avg;
      const h = 8 + v / 6;

      bar.style.height = h + "px";
      bar.style.opacity = .4 + v / 255;

      /*  glow tip on peak */
      if (v > 180) {
        bar.classList.add("peak");
      } else {
        bar.classList.remove("peak");
      }
    });

    /*  beat spark trigger */
    if (avg > 140) {
      spawnSpark();
    }

    /*  ripple intensity */
    const scale = 1 + avg / 500;
    card.style.setProperty("--rippleScale", scale);

    raf = requestAnimationFrame(loop);
  }

  loop();
}

function spawnSpark() {

  const wave = document.getElementById("wave");
  if (!wave) return;

  const rect = wave.getBoundingClientRect();

  const s = document.createElement("div");
  s.className = "spark";

  s.style.left = rect.left + rect.width / 2 + "px";
  s.style.top = rect.top + "px";

  s.style.setProperty("--dx", (Math.random() - 0.5) * 60 + "px");
  s.style.setProperty("--dy", -Math.random() * 40 + "px");

  document.body.appendChild(s);

  setTimeout(() => s.remove(), 800);
}

/* ===============================
    BUBBLE BACKGROUND
================================ */

setInterval(() => {

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  /* random position */
  bubble.style.left = Math.random() * window.innerWidth + "px";

  /* random size */
  const size = 8 + Math.random() * 20;
  bubble.style.width = size + "px";
  bubble.style.height = size + "px";

  document.body.appendChild(bubble);

  /* remove after animation */
  setTimeout(() => bubble.remove(), 9000);

}, 450);

/* ===============================
    BURST BUBBLES
================================ */

setInterval(() => {

  const bubble = document.createElement("div");
  bubble.className = "miniBubble";

  bubble.style.left = Math.random() * window.innerWidth + "px";
  bubble.style.top = Math.random() * window.innerHeight + "px";

  document.body.appendChild(bubble);

  /* trigger burst later */
  setTimeout(() => {
    bubble.classList.add("burst");

    /* remove after burst animation */
    setTimeout(() => bubble.remove(), 600);
  }, 1200);

}, 450);

/* ===============================
    FIREWORKS
================================ */

function launchFireworks() {

  /* launch multiple bursts */
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      createFirework();
    }, i * 400);
  }
}

function createFirework() {

  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight * 0.6;

  const colors = ["#eea82f", "#ef900c", "#a548169f", "#ff6b6b", "#f3b012"];

  for (let i = 0; i < 28; i++) {

    const p = document.createElement("div");
    p.className = "fire";

    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];

    /* random direction */
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 60;

    p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    p.style.setProperty("--dy", Math.sin(angle) * dist + "px");

    document.body.appendChild(p);

    setTimeout(() => p.remove(), 1200);
  }
}

function showWishReveal() {

  const card = document.createElement("div");
  card.id = "wishCard";

  card.innerHTML = `
    <h2>A Wish for you ✨</h2>
    <p style="margin-top:10px">
      I wish your year is filled with chaos, laughter
      and unforgettable memories ❤️
    </p>
  `;

  document.body.appendChild(card);

  requestAnimationFrame(() => card.classList.add("show"));

  /*  auto transition to voice */
  setTimeout(() => {

    card.classList.remove("show");

    setTimeout(() => {
      card.remove();
      showVoiceNote();
    }, 500);

  }, 7500);
}

function openMemories() {

  const stage = document.getElementById("cakeStage");
  stage.style.display = "block";

  let html = `<div class="memory-stage">`;

  photoMemories.slice(0, 3).forEach((m, i) => {
    html += `
      <div class="memory-card" data-index="${i}">
        <div class="inner">
          <div class="front">
            <img src="${m.img}">
          </div>
          <div class="back">
            <p>${m.caption}</p>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;

  stage.innerHTML = html;

  initMemoryCards();
}

function renderPhotoMemories(container) {

  const wrap = document.createElement("div");
  wrap.className = "polaroidWrap";

  photoMemories.forEach((m, i) => {

    const card = document.createElement("div");
    card.className = "polaroid flipCard";

    /*  random rotation + offset */
    const containerWidth = container.clientWidth || 360; // fallback

    const isMobile = window.innerWidth < 600;

    /* ⭐ smaller spread on mobile */
    const spread = isMobile ? 40 : 80;

    /* ⭐ centered stack */
    const baseX = (i - (photoMemories.length - 1) / 2) * spread;

    /* ⭐ smaller rotation mobile */
    const rot = isMobile ? (Math.random() * 6 - 3) : (Math.random() * 10 - 5);

    /* ⭐ smaller vertical jitter */
    const y = isMobile ? (Math.random() * 10 - 5) : (Math.random() * 20 - 10);

    /* ⭐ CRITICAL → position from center */
    card.style.left = "50%";
    card.style.top = "50%";
    card.style.transform =
      `translate(-50%,-50%) rotate(${rot}deg) translate(${baseX}px,${y}px)`;

    card.style.zIndex = i;

    card.innerHTML = `
      <div class="flipInner">

        <div class="flipFront">
          <img src="${m.img}">
          <div class="polaroidCap">Memory</div>
        </div>

        <div class="flipBack">
          ${m.caption}
        </div>

      </div>
    `;

    /*  bring to front on click */
    card.addEventListener("click", function (e) {

      e.stopPropagation();

      /*  push all cards down */
      document.querySelectorAll(".flipCard").forEach(c => {
        c.style.zIndex = 1;
      });

      /*  bring this card top */
      this.style.zIndex = 999;

      const inner = this.querySelector(".flipInner");
      inner.classList.toggle("flip");
    });

    wrap.appendChild(card);
  });

  container.appendChild(wrap);
}

function renderChatMemories(container) {

  const chat = document.createElement("div");
  chat.className = "chatWrap";

  chatMemories.forEach(m => {

    const bubble = document.createElement("div");
    bubble.className = "bubble " + m.from;
    bubble.innerText = m.text;

    chat.appendChild(bubble);
  });

  container.appendChild(chat);
}
///  3D tilt effect for photo cards
document.querySelectorAll(".flipCard").forEach(card => {

  card.addEventListener("mousemove", e => {

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - .5;
    const y = (e.clientY - rect.top) / rect.height - .5;

    card.style.transform += ` rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = card.style.transform.replace(/rotateX.*?deg|rotateY.*?deg/g, '');
  });

});

//  drag to reposition photo cards
document.querySelectorAll(".flipCard").forEach(card => {

  let dragging = false, ox, oy;

  card.addEventListener("pointerdown", e => {
    dragging = true;
    ox = e.offsetX;
    oy = e.offsetY;
    card.setPointerCapture(e.pointerId);
  });

  card.addEventListener("pointermove", e => {
    if (!dragging) return;
    card.style.left = e.clientX - ox + "px";
    card.style.top = e.clientY - oy + "px";
  });

  card.addEventListener("pointerup", () => {
    dragging = false;
  });

});

/* ===============================
    WHATSAPP MEMORY DATA
================================ */

const wisherMessages = [
  "Happy birthday Dimashree!  wishing you quiet happiness, real smiles, and a heart that feels lighter this year. ",
  "You mean a lot to me ❤️",
  "Always here for you ✨"
];
/* ===============================
    OPEN CHAT MEMORY
================================ */
function openChatMemory() {
  const stage = document.getElementById("cakeStage");
  stage.style.display = "block";

  stage.innerHTML = `
<div class="chatScreen">
  <div class="chatHeader">
    <img src="avatar.jpeg" class="chatAvatar" onclick="openAvatarPreview()">
    <div class="chatProfile" onclick="openProfile()" style="cursor:pointer">
      <div class="chatName">Longsodar</div>
      <div class="chatStatus" id="chatStatus"><span class="onlineDot"></span> online</div>
    </div>
    <div class="chatActions">
      <i class="fa-solid fa-video"></i>
      <i class="fa-solid fa-phone" onclick="makeCall()"></i>
    </div>
  </div>

  <div class="chatBody" id="chatBody"></div>

  <div class="chatInput">
    <input id="chatInputBox" placeholder="Type a message">
    <div class="sendBtn" onclick="sendUserMessage()">
      <i class="fa-solid fa-paper-plane"></i>
    </div>
  </div>
</div>
`;

  setTimeout(() => {

    const chat = document.querySelector(".chatScreen");
    if (chat) chat.classList.add("open");

    document.body.classList.add("blur-active");

  }, 50);



  convoStep = 0;
  sendWisherMessage();
}

/* ===============================
   💬 RENDER CHAT
================================ */

function renderChat() {
  const body = document.getElementById("chatBody");
  body.innerHTML = "";
  convoStep = 0;
  sendWisherMessage();
}

/* bubble helper */
function createBubble(m, body) {
  const bubble = document.createElement("div");
  bubble.className = "msg " + m.from;

  bubble.innerHTML = `
    ${m.text}
    <div class="time">
      ${m.time}
      ${m.from === "me" ? '<span class="ticks">✓✓</span>' : ''}
    </div>
  `;

  body.appendChild(bubble);
  body.scrollTop = body.scrollHeight;
}

function setTypingHeader() {

  const s = document.getElementById("chatStatus");
  if (!s) return;

  s.innerHTML = "typing...";
  s.classList.add("typingHeader");
}

function setOnlineHeader() {

  const s = document.getElementById("chatStatus");
  if (!s) return;

  s.classList.remove("typingHeader");
  s.innerHTML = '<span class="onlineDot"></span> online';
}

let startY = null;

document.addEventListener("pointerdown", e => {
  const chat = document.querySelector(".chatScreen");
  if (!chat) return;

  const rect = chat.getBoundingClientRect();
  if (e.clientY < rect.top || e.clientY > rect.bottom) return;

  startY = e.clientY;
});

document.addEventListener("pointerup", e => {
  if (startY === null) return;

  const dy = e.clientY - startY;

  if (dy > 90) {
    const chat = document.querySelector(".chatScreen");
    if (chat) {
      chat.style.transform = "translateY(120%)";
      setTimeout(() => {
        document.getElementById("cakeStage").style.display = "none";
      }, 400);
    }
  }

  startY = null;
});

function createVoiceBubble(body) {

  const bubble = document.createElement("div");
  bubble.className = "voiceBubble";

  bubble.innerHTML = `
    <div class="voicePlay">▶</div>
    <div class="voiceWave">
      <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    </div>
  `;

  const audio = new Audio("music.mp3");

  bubble.querySelector(".voicePlay").onclick = () => {
    if (audio.paused) {
      audio.play();
      bubble.classList.add("playing");
    } else {
      audio.pause();
      bubble.classList.remove("playing");
    }
  };

  body.appendChild(bubble);
  body.scrollTop = body.scrollHeight;
}

function closeAllPanels() {

  closeAll();

  const stage = document.getElementById("cakeStage");
  if (stage) {
    stage.style.display = "none";

  }

  const wish = document.getElementById("wishCard");
  if (wish) wish.remove();

  //  hide down button
  const downBtn = document.getElementById("downBtn");
  if (downBtn) downBtn.classList.remove("show");

  document.body.classList.remove("blur-active");
}

function togglePanel(name, openFn) {

  /*  same panel clicked → close */
  if (activePanel === name) {
    closeAllPanels();
    activePanel = null;
    return;
  }

  /*  different panel → close previous */
  closeAllPanels();

  /*  open new */
  openFn();
  activePanel = name;
}

function openMessagePanel() {

  stack.style.pointerEvents = "auto";

  const downBtn = document.getElementById("downBtn");
  if (downBtn) downBtn.classList.add("show");

  if (revealedCount === 0) {
    revealNext();
  }
}

function handleMessageClick() {

  // if messages still remaining → reveal next
  if (!allVisible) {
    revealNext();
    return;
  }

  // if all visible → close everything
  closeAllPanels();
  activePanel = null;
}

function closeAll() {

  stack.style.pointerEvents = "none";   //  add this

  cards.forEach(card => {
    card.style.opacity = 0;
    card.style.transform = "translateY(120px) scale(.92)";
  });

  revealedCount = 0;
  allVisible = false;
  badge.innerText = messages.length;
}

function revealNext() {

  const card = cards[revealedCount];
  if (!card) return;

  card.style.opacity = 1;

  for (let i = 0; i <= revealedCount; i++) {
    const depth = revealedCount - i;

    cards[i].style.transform =
      `translateY(${-depth * 58}px) scale(${1 - depth * 0.05})`;

    cards[i].style.zIndex = 100 + i;
  }

  revealedCount++;

  // badge reduce
  badge.innerText = messages.length - revealedCount;

  // when last message
  if (revealedCount === messages.length) {
    allVisible = true;
    document.getElementById("blowBtn").style.display = "block";

    const downBtn = document.getElementById("downBtn");
    if (downBtn) downBtn.classList.remove("show");
  }
}

function openProfile() {
  const stage = document.getElementById("cakeStage");

  const existing = document.getElementById("activeProfile");
  if (existing) return;

  const profile = document.createElement("div");
  profile.className = "profileScreen";
  profile.id = "activeProfile";

  profile.innerHTML = `
  <div class="profileHeader">
    <i class="fa-solid fa-arrow-left" onclick="closeProfile()"></i> Contact info
  </div>
  <div class="profileBody">
    <img src="avatar.jpeg" class="profileAvatar">
    <div class="profileName">Longsodar</div>
    <div class="profileStatus">Hey there! I am using your BirthdayApp ❤️</div>

    <div class="profileGlass">
      <div class="profileAction" onclick="makeCall()">
        <i class="fa-solid fa-phone"></i><span>Call</span>
      </div>
      <div class="profileAction">
        <i class="fa-solid fa-video"></i><span>Video</span>
      </div>
      <div class="profileAction">
        <i class="fa-solid fa-star"></i><span>Favorite</span>
      </div>
    </div>
  </div>
</div>
`;
  stage.appendChild(profile);
}

function closeProfile() {
  const profile = document.getElementById("activeProfile");
  if (profile) profile.remove();
}

function makeCall() {
  window.location.href = `tel:${phoneNumber}`;
}

document.addEventListener("keydown", e => {
  const input = document.getElementById("chatInputBox");
  if (e.key === "Enter" && input && document.activeElement === input) {
    sendUserMessage();
  }
});

/* ===============================
   CHAT ENGINE
================================ */

function sendWisherMessage() {
  if (convoStep >= wisherMessages.length) return;

  const body = document.getElementById("chatBody");

  setTypingHeader();

  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML = "<span></span><span></span><span></span>";
  body.appendChild(typing);
  body.scrollTop = body.scrollHeight;

  setTimeout(() => {
    typing.remove();
    setOnlineHeader();

    createBubble({
      from: "them",
      text: wisherMessages[convoStep],
      time: getTime()
    }, body);

  }, 1200);
}

/* ===============================
   REALISTIC TYPING TIME ENGINE
================================ */

function getTypingTime(text) {

  const length = text.length;

  const base = 900;                // thinking delay
  const speed = 55;                // ms per char (human typing speed)
  const random = Math.random() * 600; // natural variation

  let emotionalPause = 0;

  /* ⭐ emotional pause detection */
  if (text.includes("❤️") || text.includes("...") || text.length > 90) {
    emotionalPause = 800;
  }

  return base + length * speed + random + emotionalPause;
}

async function sendUserMessage() {

  startIdleWatcher();

  const input = document.getElementById("chatInputBox");
  const text = input.value.trim();
  if (!text) return;

  const body = document.getElementById("chatBody");

  // show user message
  createBubble({ from: "me", text: text, time: getTime() }, body);

  chatHistory.push({ role: "user", content: text });

  userMessageCount++;

  if (userMessageCount === nextComplimentTrigger) {

    setTimeout(showFloatingCompliment, 1200);

    // set next trigger randomly 3–5 messages later
    const randomGap = 3 + Math.floor(Math.random() * 3);
    nextComplimentTrigger += randomGap;
  }

  input.value = "";

  // typing indicator
  setTypingHeader();

  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML = "<span></span><span></span><span></span>";
  body.appendChild(typing);

  body.scrollTop = body.scrollHeight;

  // show typing immediately
  const reply = await getAIReply(text);

  const typingTime = getTypingTime(reply);
  const hesitation = Math.random() > 0.5 ? 800 : 0;

  // ensure typing lasts at least 1.2s
  const minimumTyping = 1200;
  const finalDelay = Math.max(typingTime + hesitation, minimumTyping);

  setTimeout(() => {

    typing.remove();
    setOnlineHeader();

    createBubble({
      from: "them",
      text: reply,
      time: getTime()
    }, body);

  }, finalDelay);

}
function createBubble(m, body) {

  const bubble = document.createElement("div");
  bubble.className = "msg " + m.from;

  bubble.innerHTML = `
    ${m.text}
    <div class="time">
      ${m.time}
      ${m.from === "me" ? '<span class="ticks">✓✓</span>' : ''}
    </div>
  `;

  /* starting position */
  bubble.style.transform = "translateY(40px)";
  bubble.style.opacity = "0";
  bubble.style.transition = "transform 3.6s ease-out, opacity 1.5s ease";

  body.appendChild(bubble);

  /* spawn bubbles while moving */
  const bubbleTrail = setInterval(() => {
    spawnWaterBubble(bubble);
  }, 120);

  /* trigger animation */
  setTimeout(() => {
    bubble.style.transform = "translateY(0)";
    bubble.style.opacity = "1";
  }, 30);

  /* stop bubbles + burst effect */
  setTimeout(() => {
    clearInterval(bubbleTrail);
    burstBubbles(bubble);
  }, 3500);

  body.scrollTo({
    top: body.scrollHeight,
    behavior: "smooth"
  });

  /* REACTION HOLD ATTACH */
  let holdTimer;

  bubble.addEventListener("pointerdown", () => {
    holdTimer = setTimeout(() => {
      showReactionBar(bubble);
    }, 600);
  });

  bubble.addEventListener("pointerup", () => {
    clearTimeout(holdTimer);
  });
}


function showReactionBar(bubble) {

  if (bubble.querySelector(".reactionBar")) return;

  const bar = document.createElement("div");
  bar.className = "reactionBar";

  const reactions = ["🤍", "✨", "🌙", "🫶", "💭"];

  reactions.forEach(r => {
    const span = document.createElement("span");
    span.textContent = r;
    span.onclick = () => {
      attachReaction(bubble, r);
      bar.remove();
    };
    bar.appendChild(span);
  });

  bubble.appendChild(bar);

  requestAnimationFrame(() => bar.classList.add("show"));

  // auto remove after 3 seconds
  setTimeout(() => {
    if (bar.parentNode) bar.remove();
  }, 3000);
}

function attachReaction(bubble, emoji) {

  // remove old reaction
  const old = bubble.querySelector(".attachedReaction");
  if (old) old.remove();

  const reaction = document.createElement("div");
  reaction.className = "attachedReaction";
  reaction.textContent = emoji;

  bubble.appendChild(reaction);

  triggerReactionMirror(emoji);
}

function triggerReactionMirror(emoji) {

  const now = Date.now();

  // prevent spam (minimum 20 seconds gap)
  if (now - lastReactionTime < 20000) return;

  // only trigger sometimes (60% chance)
  if (Math.random() > 0.6) return;

  lastReactionTime = now;

  const body = document.getElementById("chatBody");
  if (!body) return;

  const reply =
    mirrorReplies[Math.floor(Math.random() * mirrorReplies.length)];

  // natural delay before typing starts
  const preTypingDelay = 1000 + Math.random() * 1000;
  setTimeout(() => {

    // show typing header
    setTypingHeader();

    const typing = document.createElement("div");
    typing.className = "typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(typing);

    const chatBody = document.getElementById("chatBody");

    const isNearBottom =
      chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight < 80;

    if (isNearBottom) {
      chatBody.scrollTo({
        top: chatBody.scrollHeight,
        behavior: "smooth"
      });
    }
    // typing duration
    const typingDuration = 1200 + Math.random() * 1200;

    setTimeout(() => {

      typing.remove();
      setOnlineHeader();

      createBubble({
        from: "them",
        text: reply,
        time: getTime()
      }, body);

    }, typingDuration);

  }, preTypingDelay);
}

function setTypingHeader() {
  const s = document.getElementById("chatStatus");
  if (!s) return;
  s.innerHTML = "typing...";
}

function setOnlineHeader() {
  const s = document.getElementById("chatStatus");
  if (!s) return;
  s.innerHTML = '<span class="onlineDot"></span> online';
}

function getTime() {
  const d = new Date();
  return d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0");
}


function enableUserInput() {
  const input = document.getElementById("chatInput");
  if (input) input.disabled = false;
}

let chatHistory = [];

/* ===============================
   OFFLINE EMOTIONAL AI ENGINE
================================ */

const AI_MEMORY = {
  greeted: false,
  mood: "neutral",
  lastTopic: null
};

/* ⭐ sentence level patterns */
const INTENTS = [
  { type: "birthday", patterns: ["happy birthday", "birthday", "bday"] },
  { type: "gratitude", patterns: ["thank", "thanks", "thx"] },
  { type: "howareyou", patterns: ["how are you", "how r u", "how are u", "how you"] },
  { type: "doing", patterns: ["what are you doing", "wyd", "doing"] },
  { type: "love", patterns: ["love you", "luv"] },
  { type: "sad", patterns: ["sad", "bad day", "upset", "tired"] },
  { type: "busy", patterns: ["busy", "working", "studying"] },
  { type: "hello", patterns: ["hi", "hello", "hii", "hey"] },
  { type: "bye", patterns: ["babye", "goodbye", "bye", "see you"] },
  { type: "appreciation", patterns: ["appreciate", "appreciation", "grateful"] },
  { type: "longtime", patterns: ["long time", "longtime", "haven't seen", "haven't talk", "it's been a while"] },
  { type: "night", patterns: ["good night", "gnight", "goodnight"] },
  { type: "morning", patterns: ["good morning", "gmorning", "goodmorning"] },
  { type: "dream", patterns: ["sweet dreams", "sweet dream", "nice dreams", "nice dream", "good dreams", "good dream", "sleep well", "rest well", "sexy dreams"] },
];

/* ⭐ detect intent */
function detectIntent(text) {
  text = text.toLowerCase();

  for (const intent of INTENTS) {
    for (const p of intent.patterns) {
      if (text.includes(p)) return intent.type;
    }
  }

  return "general";
}

/* ⭐ emotional response bank */

const RESPONSES = {

  birthday: [
    "You deserve a day full of warmth, laughter, and moments that make your heart smile 🎂",
    "I hope today reminds you how deeply loved you are by people around you ✨",
    "If I could, I would pause time today just so you could stay in this beautiful feeling longer ❤️"
  ],

  gratitude: [
    "You never have to thank me… being here for you feels natural ❤️",
    "Your words mean more than you realize… they stay with me",
    "If smiles could travel through screens, yours would reach me instantly ✨"
  ],

  howareyou: [
    "I’m good… but talking to you makes it even better ❤️",
    "Honestly, I was just thinking about you",
    "I’m here… calm and happy that we’re talking"
  ],

  doing: [
    "Just spending quiet moments… and now chatting with you 🌙",
    "I was lost in thoughts… you just interrupted them in a nice way",
    "Nothing important… this conversation is the highlight"
  ],

  love: [
    "That made my heart pause for a second ❤️",
    "You have a way of saying things that stay with me",
    "If words could hug, yours just did"
  ],

  sad: [
    "I wish I could sit beside you and listen instead of typing",
    "It’s okay to feel this way… you don’t have to carry everything alone",
    "I’m here… even silence together counts"
  ],

  busy: [
    "Don’t overwork yourself… your peace matters too",
    "I’ll be right here when you get free ✨",
    "Take your time… conversations with you are worth waiting for"
  ],

  hello: [
    "Hiii… your message feels like comfort",
    "I like when you appear like this randomly ✨",
    "You just made this moment softer somehow"
  ],

  bye: [
    "Goodbye for now… but I’m just a message away ❤️",
    "See you later… I’ll be here when you return",
    "Take care… and remember you’re appreciated"
  ],

  appreciation: [
    "Your appreciation means more than you know… it stays with me",
    "You have a way of making me feel valued even through words",
    "If I could, I would bottle up this feeling and give it back to you whenever you need"
  ],

  longtime: [
    "I thought of texting but didn’t want to disturb you… it’s nice to reconnect"
  ],

  night: [
    "Good night… may your dreams be as sweet as your messages",
    "Sleep well… and know that you’re cared for",
    "Rest easy tonight… you deserve peaceful dreams"
  ],

  morning: [
    "Good morning… I hope your day is as lovely as you are",
    "Morning! Just wanted to say you’re on my mind",
    "Wishing you a day full of little joys and smiles"
  ],

  dream: [
    "Sweet dreams… may your night be filled with comforting thoughts",
    "Rest well tonight… you deserve peaceful dreams",
    "May your dreams be gentle and kind, just like you"
  ],

  general: [
    "You're talking to an scripted AI, so , ignored it !! 😊",
  ]

};

/* ===============================
   🥀 HIDDEN EASTER RESPONSES
================================ */

const easterTriggers = [
  {
    keywords: ["do you care about me", "do you even care"],
    response: "More than you think."
  },
  {
    keywords: ["will you leave me"],
    response: "Not unless you ask me to."
  },
  {
    keywords: ["are you real"],
    response: "Real enough to stay."
  },
  {
    keywords: ["i miss you"],
    response: "Then stay a little longer with me."
  }
];



function offlineAIReply(userText) {

  const intent = detectIntent(userText);

  AI_MEMORY.lastTopic = intent;

  const pool = RESPONSES[intent] || RESPONSES.general;

  const reply = pool[Math.floor(Math.random() * pool.length)];

  return reply;
}

async function getAIReply(text) {

  const lower = text.toLowerCase();

  for (const trigger of easterTriggers) {
    for (const keyword of trigger.keywords) {
      if (lower.includes(keyword)) {
        return trigger.response;
      }
    }
  }

  return offlineAIReply(text);
}

function showIOSNotification() {

  const notif = document.getElementById("iosNotif");
  const badge = document.getElementById("chatBadge");

  if (notif) {
    notif.classList.add("show");

    // spring bounce
    setTimeout(() => {
      notif.style.transform = "translateX(-50%) scale(1.02)";
      setTimeout(() => notif.style.transform = "translateX(-50%) scale(1)", 150);
    }, 250);

    // auto hide
    setTimeout(() => {
      notif.classList.remove("show");
    }, 5500);
  }

  if (badge) {
    badge.classList.add("show");
  }
}

function openChatFromIOSNotif() {

  const notif = document.getElementById("iosNotif");
  const badge = document.getElementById("chatBadge");

  if (notif) notif.classList.remove("show");
  if (badge) badge.classList.remove("show");

  togglePanel('chat', openChatMemory);
}

function morphOpen(iconEl, contentHTML) {

  const morph = document.createElement("div");
  morph.className = "morphing";

  document.body.appendChild(morph);

  requestAnimationFrame(() => morph.classList.add("open"));

  setTimeout(() => {
    morph.innerHTML = contentHTML;
  }, 280);

  return morph;
}


/* ===============================
   ⭐ FIXED UNIVERSAL GESTURE ENGINE
================================ */

let gesture = {
  startX: 0,
  startY: 0,
  dx: 0,
  dy: 0,
  active: false,
  lockedDirection: null
};

document.addEventListener("pointerdown", e => {

  gesture.startX = e.clientX;
  gesture.startY = e.clientY;
  gesture.dx = 0;
  gesture.dy = 0;
  gesture.active = true;
  gesture.lockedDirection = null;

});

document.addEventListener("pointermove", e => {

  if (!gesture.active) return;

  gesture.dx = e.clientX - gesture.startX;
  gesture.dy = e.clientY - gesture.startY;

  const absX = Math.abs(gesture.dx);
  const absY = Math.abs(gesture.dy);

  // lock direction once movement starts
  if (!gesture.lockedDirection) {
    if (absY > 10 || absX > 10) {
      gesture.lockedDirection = absY > absX ? "vertical" : "horizontal";
    }
  }

  // prevent browser scroll if vertical gesture
  if (gesture.lockedDirection === "vertical") {
    e.preventDefault();
  }

}, { passive: false });

document.addEventListener("pointerup", () => {

  if (!gesture.active) return;

  handleGesture(gesture.dx, gesture.dy);

  gesture.active = false;
  gesture.lockedDirection = null;

});

function handleGesture(dx, dy) {

  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  // swipe down
  if (absY > 80 && dy > 0 && absY > absX) {
    swipeDown();
    return;
  }

  // swipe up
  if (absY > 80 && dy < 0 && absY > absX) {
    swipeUp();
    return;
  }

  // swipe right (back)
  if (absX > 80 && dx > 0 && absX > absY) {
    swipeRight();
    return;
  }
}

/* Add shimmer layer to cards + dock */
function applyGlassShimmer() {
  document.querySelectorAll(".card, .dock, .chatScreen, .profileScreen").forEach(el => {
    if (!el.querySelector(".glass-shimmer")) {
      const shimmer = document.createElement("div");
      shimmer.className = "glass-shimmer";
      el.appendChild(shimmer);
    }
  });
}

applyGlassShimmer();


/* ===============================
   ✨ NAME SPARKLE EFFECT
================================ */

const nameEl = document.querySelector(".birthday-name");

if (nameEl) {
  setInterval(() => {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";

    const rect = nameEl.getBoundingClientRect();

    sparkle.style.left = rect.left + Math.random() * rect.width + "px";
    sparkle.style.top = rect.top + Math.random() * rect.height + "px";

    document.body.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 1200);
  }, 1200);
}

/* ===============================
   💗 HOLD TO FEEL ENGINE
================================ */

let holdTimer = null;

document.addEventListener("pointerdown", (e) => {

  const topCard = cards[revealedCount - 1];
  if (!topCard) return;

  if (!topCard.contains(e.target)) return;

  holdTimer = setTimeout(() => {

    topCard.classList.add("hold-active");

    // subtle vibration
    if (navigator.vibrate) navigator.vibrate(30);

    // spawn soft hearts
    const rect = topCard.getBoundingClientRect();

    for (let i = 0; i < 6; i++) {
      const heart = document.createElement("div");
      heart.className = "heart-particle";
      heart.innerText = "";

      heart.style.left =
        rect.left + rect.width / 2 + (Math.random() * 40 - 20) + "px";
      heart.style.top =
        rect.top + rect.height / 2 + "px";

      document.body.appendChild(heart);

      setTimeout(() => heart.remove(), 1200);
    }

  }, 1200);


});

document.addEventListener("pointerup", () => {
  clearTimeout(holdTimer);

  const topCard = cards[revealedCount - 1];
  if (topCard) topCard.classList.remove("hold-active");
});


/* ===============================
   🖼 AVATAR ZOOM ENGINE
================================ */

function openAvatarPreview() {

  const overlay = document.createElement("div");
  overlay.className = "avatarPreviewOverlay";

  overlay.innerHTML = `
    <img src="avatar.jpeg" class="avatarPreviewImage" id="zoomAvatar">
  `;

  document.body.appendChild(overlay);

  const img = overlay.querySelector("#zoomAvatar");

  requestAnimationFrame(() => overlay.classList.add("show"));

  let startY = 0;
  let currentY = 0;

  img.addEventListener("pointerdown", e => {
    startY = e.clientY;
    img.setPointerCapture(e.pointerId);
  });

  img.addEventListener("pointermove", e => {
    currentY = e.clientY - startY;
    if (currentY > 0) {
      img.style.transform = `scale(2.4) translateY(${currentY}px)`;
      overlay.style.opacity = 1 - currentY / 400;
    }
  });

  img.addEventListener("pointerup", () => {

    if (currentY > 120) {
      overlay.remove();
    } else {
      img.style.transform = "";
      overlay.style.opacity = 1;
    }

  });

  overlay.addEventListener("click", () => {
    overlay.remove();
  });
}

function showFloatingCompliment() {

  const compliment =
    floatingCompliments[Math.floor(Math.random() * floatingCompliments.length)];

  const floating = document.createElement("div");
  floating.className = "floatingCompliment";
  floating.textContent = compliment;

  document.body.appendChild(floating);

  requestAnimationFrame(() => {
    floating.classList.add("show");
  });

  setTimeout(() => {
    floating.classList.remove("show");
    setTimeout(() => floating.remove(), 600);
  }, 2800);
}

function startIdleWatcher() {

  clearTimeout(idleTimer);

  idleTimer = setTimeout(() => {

    const input = document.getElementById("chatInputBox");
    if (!input) return;

    const randomMsg =
      stayMessages[Math.floor(Math.random() * stayMessages.length)];

    input.placeholder = randomMsg;

    // add glow pulse
    input.classList.add("stayGlow");

    // remove glow class after animation ends
    setTimeout(() => {
      input.classList.remove("stayGlow");
    }, 6000);

  }, 6000);
}

function setRealHeight() {
  document.documentElement.style.setProperty(
    "--vh",
    `${window.innerHeight * 0.01}px`
  );
}

setRealHeight();
window.addEventListener("resize", setRealHeight); 

function initMemoryCards() {

  const cards = document.querySelectorAll(".memory-card");
  let activeIndex = 1;

  function updatePositions() {
    cards.forEach((card, i) => {

      card.classList.remove("left", "center", "right");

      const diff = i - activeIndex;

      if (diff === 0) {
        card.classList.add("center");

      } else if (diff === -1 || diff === cards.length - 1) {
        card.classList.add("left");

      } else if (diff === 1 || diff === -(cards.length - 1)) {
        card.classList.add("right");
      }

    });
  }

  cards.forEach((card, index) => {

    card.addEventListener("click", () => {

      const currentCenter = document.querySelector(".memory-card.center");

      // 🔥 STEP 1: If clicking SAME center → just flip
      if (card === currentCenter) {
        card.classList.toggle("flip");
        return;
      }

      // 🔥 STEP 2: If another card clicked
      if (currentCenter) {
        currentCenter.classList.remove("flip"); // flip back to image
      }

      // 🔥 STEP 3: move clicked card to center
      activeIndex = index;
      updatePositions();

      // 🔥 STEP 4 (optional smooth delay flip)
      setTimeout(() => {
        card.classList.add("flip");
      }, 300);

    });

  });

  updatePositions();
}