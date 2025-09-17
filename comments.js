import { db } from './firebase.js';
import { ref, push, set, update, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Add a comment to a task
export function addComment(taskId, text, author = "Anonymous") {
	const commentsRef = ref(db, `comments/${taskId}`);
	const newCommentRef = push(commentsRef);
	const commentData = {
		text,
		author,
		timestamp: Date.now(),
	};
	return set(newCommentRef, commentData);
}

// Edit a comment (by commentId under a task)
export function editComment(taskId, commentId, newText) {
	const commentRef = ref(db, `comments/${taskId}/${commentId}`);
	return update(commentRef, { text: newText, edited: true, editedAt: Date.now() });
}

// Delete a comment (by commentId under a task)
export function deleteComment(taskId, commentId) {
	const commentRef = ref(db, `comments/${taskId}/${commentId}`);
	return set(commentRef, null);
}

// Listen for comments on a task (callback gets all comments as an object)
export function listenForComments(taskId, callback) {
	const commentsRef = ref(db, `comments/${taskId}`);
	onValue(commentsRef, (snapshot) => {
		callback(snapshot.val() || {});
	});
}
