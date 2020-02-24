function downloadToken() {
	// Create a link and generate the text file to download.
	const token = document.createElement("a");
	token.style.display = 'none';
	token.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(window.location.hash));
	token.setAttribute('download', 'token.txt');

	// Simulate clicking the element to activate the download.
	document.body.appendChild(token);
	token.click();
	document.body.removeChild(token);
};
