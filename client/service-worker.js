self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).then(function(response) {
      if (!response.ok) {
        // An HTTP error response code (40x, 50x) won't cause the fetch() promise to reject.
        // We need to explicitly throw an exception to trigger the catch() clause.
        throw Error('response status ' + response.status);
      }

      // If we got back a non-error HTTP response, return it to the page.
      return response;
    }).catch(function(error) {
      console.warn('Constructing a fallback response, ' +
        'due to an error while fetching the real response:', error);

      // Construct the fallback response via an in-memory variable. In a real application,
      // you might use something like `return fetch(FALLBACK_URL)` instead,
      // to retrieve the fallback response via the network.
      return new Response('offline');
    })
  );
});
