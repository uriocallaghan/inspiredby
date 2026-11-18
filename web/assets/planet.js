const storySteps = document.querySelector('.ib-planet .steps');
const storyGraphic = document.querySelector('.ib-planet .graphic');
const storyFrames = [...storyGraphic.querySelectorAll('[data-frame]')];
const storyControls = document.querySelector('.ib-planet .ctl');
const storyButtons = [...storyControls.querySelectorAll('.seg button')];
const storyViews = [...document.querySelectorAll('.ib-planet [data-view]')];
const playButton = storyControls.querySelector('[data-play]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let currentView = 0;
let playback;

function showStoryFrame(index) {
  storyFrames.forEach((frame, position) => {
    frame.hidden = position !== index;
  });
}

function showStoryView(index) {
  currentView = index;
  storyButtons.forEach((button, position) => {
    button.setAttribute('aria-pressed', String(position === index));
    storyViews[position].hidden = position !== index;
  });
}

function stopPlayback() {
  window.clearInterval(playback);
  playback = undefined;
  playButton.textContent = 'Reprodueix';
}

storyButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    stopPlayback();
    showStoryView(index);
  });
});

playButton.addEventListener('click', () => {
  if (playback !== undefined) {
    stopPlayback();
    return;
  }
  showStoryView(0);
  playButton.textContent = 'Atura';
  playback = window.setInterval(() => {
    showStoryView(currentView + 1);
    if (currentView === storyViews.length - 1) stopPlayback();
  }, 2400);
});

function updateMotionPreference() {
  playButton.hidden = reduceMotion.matches;
  if (reduceMotion.matches) stopPlayback();
}

updateMotionPreference();
reduceMotion.addEventListener('change', updateMotionPreference);
storyControls.hidden = false;

if (window.IB?.scrolly) {
  document.body.classList.add('planet-ready');
  window.IB.scrolly(storySteps, storyGraphic, showStoryFrame);
}
