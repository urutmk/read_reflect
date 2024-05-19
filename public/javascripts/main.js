
  // Add an event listener to all elements with class "addlist"
  document.querySelectorAll('.addlist').forEach(btn => {
    btn.addEventListener('click', async (event) => {
      // Get book details from data attributes
      const title = event.target.getAttribute('data-title');
      const author = event.target.getAttribute('data-author');
      const isbn = event.target.getAttribute('data-isbn');
      const uname=event.target.getAttribute('username');
      console.log(uname);
      try {
        // Send a POST request to the server using loggedInUser
        const response = await fetch(`/books/${uname}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title,
            author: author,
            isbn: isbn
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add to reading list');
        }

        // Handle success
        alert('Book added to reading list!');
      } catch (error) {
        console.error('Error adding book to reading list:', error);
        // Handle error
        alert('Failed to add book to reading list');
      }
    });
  });