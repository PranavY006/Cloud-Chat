import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

// Add Firebase products that you want to use
import {
  getAuth,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
  getFirestore,
  addDoc,
  collection,
  onSnapshot,
  doc,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDU_k_PRIXON7GCWiLw4YRoGK_4dRKk8vM",
    authDomain: "cloud-chat-92410.firebaseapp.com",
    projectId: "cloud-chat-92410",
    storageBucket: "cloud-chat-92410.appspot.com",
    messagingSenderId: "187459385094",
    appId: "1:187459385094:web:22758e5fb7c578c1d71087",
    measurementId: "G-S1Q5VS77D0",

  appId: "1:589407773218:web:676cf16926d1dee647607b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const joinButton = document.getElementById("joinButton");
const usernameInput = document.getElementById("usernameInput");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const joinView = document.getElementById("joinView");
const chatsView = document.getElementById("chatsView");
let messages = [];

let specifiedUsername = "";
let userLoggedIn = false;
joinButton.addEventListener("click", () => {
  specifiedUsername = usernameInput.value;
  if (!specifiedUsername) {
    alert("username cannot be empty");
    return;
  }

  signInAnonymously(auth)
    .then(async () => {
      joinView.classList.add("hidden");
      chatsView.classList.remove("hidden");
      userLoggedIn = true;
      await loadHistoricalMessages();
      await subscribeToNewMessages();
      writeMessagesArray();
      console.log("User logged-in");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.log(errorCode, errorMessage);
    });
});

sendButton.addEventListener("click", async () => {
  const message = messageInput.value;
  messageInput.value = "";

  const docRef = await addDoc(collection(db, "messages"), {
    user: specifiedUsername,
    message: message,
    created: new Date(),
  });
  console.log(docRef);
});

function subscribeToNewMessages() {
  const q = query(collection(db, "messages"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const newMessages = [];
    querySnapshot.forEach((doc) => {
      newMessages.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    /**
     * Creating hash map of the existing messages.
     */
    let existingMessageHash = {};
    for (let message of messages) {
      existingMessageHash[message.id] = true;
    }

    /**
     * Push only those messages which do not
     * exist in the hashMap
     */
    for (let message of newMessages) {
      if (!existingMessageHash[message.id]) {
        messages.push(message);
      }
    }

    writeMessagesArray();
  });
}

async function loadHistoricalMessages() {
  messages = [];
  const querySnapshot = await getDocs(collection(db, "messages"));
  querySnapshot.forEach((doc) => {
    messages.push({
      id: doc.id,
      ...doc.data(),
    });
  });
  console.log(messages);
  return messages;
}

function writeMessagesArray() {
  const html = [];
  for (let message of messages) {
    html.push(messageTemplate(message.message, message.user, message.created));
  }
  document.getElementById("messageList").innerHTML = html.join("");
}

function messageTemplate(message, username, timestamp) {
  return `<li>
    <div class="flex space-x-2 pl-2 pt-2">
      <div class="flex flex-col">
        <div class="flex items-baseline space-x-2">
          <div class="text-sm font-bold">${username}</div>
          <div class="text-sm text-gray-400">${
            new Date(timestamp.seconds * 1000).toLocaleDateString() +
            " " +
            new Date(timestamp.seconds * 1000).toLocaleTimeString()
          }</div>
        </div>
        <div class="text-sm text-gray-500">${message}</div>
      </div>
    </div>
  </li>`;
}