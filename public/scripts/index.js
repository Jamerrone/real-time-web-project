{
  const socket = io();
  const messageForm = document.getElementById('messageForm');
  const messageTitleInput = document.getElementById('messageTitleInput');
  const messageCategoryInput = document.getElementById('messageCategoryInput');
  const messageTrainIDInput = document.getElementById('messageTrainIDInput');
  const messageBodyInput = document.getElementById('messageBodyInput');
  const messagesList = document.getElementById('messagesList');

  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    socket.emit('postNewMessage', {
      messageTitle: messageTitleInput.value,
      messageCategory: messageCategoryInput.value,
      messageTrainID: messageTrainIDInput.value,
      messageBody: messageBodyInput.value,
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

    messageTitle.innerHTML = `Title: ${data.title}`;
    messageCategory.innerHTML = `Category: ${data.category}`;
    messageTrainID.innerHTML = `Train ID: ${data.trainID}`;
    messageBody.innerHTML = `Message: ${data.body}`;

    li.appendChild(messageTitle);
    li.appendChild(messageCategory);
    li.appendChild(messageTrainID);
    li.appendChild(messageBody);

    messagesList.appendChild(li);
  });

  document.addEventListener('DOMContentLoaded', function() {
    socket.emit('joinRoute', {
      routeID: messageForm.dataset.routeid,
    });
  });
}
