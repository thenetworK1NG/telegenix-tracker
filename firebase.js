// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyBa96Lj4Cvdo3YWKSK5QX27b-qMYwphmfE",
	authDomain: "comments-8dc4e.firebaseapp.com",
	projectId: "comments-8dc4e",
	storageBucket: "comments-8dc4e.firebasestorage.app",
	messagingSenderId: "979950539286",
	appId: "1:979950539286:web:97f4f9f9addb8e47a51b37",
	measurementId: "G-Z6DNHF1ZFK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
