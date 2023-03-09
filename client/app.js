import botIcon from './assets/bot.svg';
import userIcon from './assets/user.svg';

const chatContainer = document.querySelector('#chat-container');
const form = document.querySelector('form');

let loadinterval;

function loader(element) {
  element.textContent = '';

  loadinterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexString = randomNumber.toString(16);
  return `id-${timestamp}-${hexString}`;
}

function chatStripe(isAi, value, uniqueId) {
  const profileImage = isAi ? botIcon : userIcon;
  const profileAltText = isAi ? 'bot' : 'user';

  return `
    <div class="wrapper ${isAi ? 'ai' : ''}">
      <div class="chat">
        <div class="profile">
          <img src="${profileImage}" alt="${profileAltText}">
        </div>
        <div class="message" id="${uniqueId}">${value}</div>
      </div>
    </div>
  `;
}

async function handleSubmit(event) {
  event.preventDefault();
  const data = new FormData(form);
  const prompt = data.get('prompt');

  // Render user's chat stripe
  chatContainer.insertAdjacentHTML('beforeend', chatStripe(false, prompt));

  // Reset the form
  form.reset();

  // Render bot's chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.insertAdjacentHTML('beforeend', chatStripe(true, '', uniqueId));

  // Add loading dots to the bot's chat stripe
  const messageDiv = document.getElementById(uniqueId);
  console.log(messageDiv);
  loader(messageDiv);

  try {
    // Send a POST request to the server
    const response = await fetch('http://localhost:5000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    // Clear the loading dots
    clearInterval(loadinterval);
    messageDiv.innerHTML = '';

    if (response.ok) {
      // Parse the response
      const data = await response.json();
      const botMessage = data.bot.trim();
      console.log(botMessage);

      // Render the bot's response
      typeText(messageDiv, botMessage);
    } else {
      // Handle server errors
      const errorMessage = await response.text();
      messageDiv.innerHTML = 'Something went wrong';
      alert(errorMessage);
    }
  } catch (error) {
    console.error(error);
    messageDiv.innerHTML = 'Something went wrong';
    alert(error.message);
  }

  // Scroll the chat container to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (event) => {
  if (event.keyCode === 13) {
    handleSubmit(event);
  }
});
