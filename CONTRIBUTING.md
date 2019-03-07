Contributing to okupando
========================

Thank you for your interest in the project. 🙂 🎉

Pull requests are more than welcome, but keep few things in mind:

1. Project aims to be as simple to use as possible. Checking the status
   must be as simple as visiting the site. No sing-ups or anything
   required.

2. We are _big_ on progressive enhancement.

   - Clients that don’t want HTML (`Accepts` header) will get plain text.

   - JavaScript is not required. Clients with no JavaScript support will
     simple HTML page that reloads every few seconds.

   - If client is modern enough, we use JavaScript for checking status
     instead of full page reloads and allow to get into queue.

   - If client supports notifications, we’ll use them instead of
     oldscool `alert()`.

   - If client does service workers and web push, we are in luck — we
     can send notifications even when one leaves the page.

3. We use english for all names, comments, issues and pull requests.

4. We have adapted [Contributor Covenant](./CODE_OF_CONDUCT.md) code of
   conduct.
