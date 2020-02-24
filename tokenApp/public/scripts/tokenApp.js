function downloadToken() { window.location.href = "http://localhost:3000/token?token=" + encodeURIComponent(window.location.hash).match("access_token%3D(.*)%26scope")[1]; };
