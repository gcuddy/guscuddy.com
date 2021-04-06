const STORAGE_KEY = 'user-color-scheme';
const COLOR_MODE_KEY = '--color-mode';

const modeToggleButton = document.querySelector('.js-mode-toggle');
const modeToggleText = document.querySelector('.js-mode-toggle-text');
const modeStatusElement = document.querySelector('.js-mode-status');

const getCSSCustomProp = propKey => {
  let response = getComputedStyle(document.documentElement).getPropertyValue(propKey);

  if (response.length) {
    response = response.replace(/\"/g, '').trim();
  }

  return response;
};

const applySetting = passedSetting => {
  let currentSetting = passedSetting || localStorage.getItem(STORAGE_KEY);

  if (currentSetting) {
    document.documentElement.setAttribute('data-user-color-scheme', currentSetting);
    setButtonLabelAndStatus(currentSetting);
    updateTwitterEmbedTheme(currentSetting);
  } else {
    setButtonLabelAndStatus(getCSSCustomProp(COLOR_MODE_KEY));
    updateTwitterEmbedTheme(getCSSCustomProp(COLOR_MODE_KEY));
  }
};

const setButtonLabelAndStatus = currentSetting => {
  modeToggleText.innerText = `Enable ${
    currentSetting === 'dark' ? 'light' : 'dark'
  } mode`;
  modeStatusElement.innerText = `Color mode is now "${currentSetting}"`;
};

const updateTwitterEmbedTheme = currentSetting => {
  // this is just silly, ugly changing twitter embed style to match theme
  let twitterEmbeds = document.querySelectorAll('.twitter-embed iframe');

  twitterEmbeds.forEach((el) => {
    let src = el.getAttribute('src');
    let regex = /(?<=theme=)(light|dark)/g;
    src = src.replace(regex, currentSetting);
    el.setAttribute("src", src);
  })

}

const toggleSetting = () => {
  let currentSetting = localStorage.getItem(STORAGE_KEY);

  switch (currentSetting) {
    case null:
      currentSetting = getCSSCustomProp(COLOR_MODE_KEY) === 'dark' ? 'light' : 'dark';
      break;
    case 'light':
      currentSetting = 'dark';
      break;
    case 'dark':
      currentSetting = 'light';
      break;
  }

  localStorage.setItem(STORAGE_KEY, currentSetting);

  return currentSetting;
};

modeToggleButton.addEventListener('click', evt => {
  evt.preventDefault();

  applySetting(toggleSetting());
});

applySetting();