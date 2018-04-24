{
  const socket = io();
  const messageForm = document.getElementById('messageForm');
  const messageTitleInput = document.getElementById('messageTitleInput');
  const messageCategoryInput = document.getElementById('messageCategoryInput');
  const messageTrainIDInput = document.getElementById('messageTrainIDInput');
  const messageBodyInput = document.getElementById('messageBodyInput');
  const messagesList = document.getElementById('messagesList');
  const errorMessage = document.getElementById('errorMessage');
  const allForms = document.querySelectorAll('form');

  function getCurrentISOTime() {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    const localISOTime = new Date(Date.now() - tzOffset)
      .toISOString()
      .slice(0, -1);

    return localISOTime;
  }

  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    socket.emit('postNewMessage', {
      messageTitle: messageTitleInput.value,
      messageCategory: messageCategoryInput.value,
      messageTrainID: messageTrainIDInput.value,
      messageBody: messageBodyInput.value,
      messageTimestamp: getCurrentISOTime(),
    });

    messageTitleInput.value = '';
    messageCategoryInput.value = '';
    messageTrainIDInput.value = '';
    messageBodyInput.value = '';
  });

  socket.on('postNewMessage', (data) => {
    const li = document.createElement('li');
    const messageTitle = document.createElement('p');
    const messageCategory = document.createElement('p');
    const messageTrainID = document.createElement('p');
    const messageBody = document.createElement('p');
    const messageTimestamp = document.createElement('p');

    messageTitle.innerHTML = `Title: ${data.title}`;
    messageCategory.innerHTML = `Category: ${data.category}`;
    messageTrainID.innerHTML = `Train ID: ${data.trainID}`;
    messageBody.innerHTML = `Message: ${data.body}`;
    messageTimestamp.innerHTML = `Timestamp: ${data.timestamp}`;

    li.appendChild(messageTitle);
    li.appendChild(messageCategory);
    li.appendChild(messageTrainID);
    li.appendChild(messageBody);
    li.appendChild(messageTimestamp);

    messagesList.appendChild(li);
  });

  socket.on('connect_error', function() {
    errorMessage.innerHTML =
      'Oops! It seems our servers are currently unavailable. For the latest ' +
      'up to date information please visit ns.nl';
    errorMessage.classList.add('show');
    allForms.forEach((form) => {
      form.style.display = 'none';
    });
  });

  socket.on('connect', function() {
    errorMessage.innerHTML = '';
    errorMessage.classList.remove('show');
    socket.emit('joinRoute', {
      routeID: messageForm.dataset.routeid,
    });
    allForms.forEach((form) => {
      form.style.display = 'block';
    });
  });
}
