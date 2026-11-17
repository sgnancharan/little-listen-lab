# Little Listen Lab

Design a minimal and visually appealing podcast interface. The interface should feature:

. A prominent text input field labeled "Type podcast topic here ... " where users can enter

their desired podcast topic.

. A "Generate Podcast" button, incorporating a speaker emoji, that triggers the podcast

generation process. The button should exhibit a color change on hover.

. A loading animation (e.g., pulsing dots) displayed while the podcast is being generated.

An audio player area that initially displays "Podcast will appear here."

Functionality: Upon clicking "Generate Podcast," the loading animation should appear for 2 -3

seconds, followed by the message "Feature coming soon!" in the audio player area.

Visual Style: Utilize soft pastel colors (with appropriate contrast) and rounded corners

throughout the design to create a cute and friendly appearance.

Adaptive Design: Ensure the interface is flexible and adapts seamlessly to different screen sizes.

Update the podcast interface to connect with this web address: https://a86b-160-30-36-71.ngrok-free.app/webhook-test/0a19b3a7-0956-4d86-a19d-a7adf799990c

When someone clicks Generate Podcast:

Take the text they typed about their podcast topic

Send it to the web address in this format: {"text": "the topic they typed"}

Show loading dots saying "Creating podcast... please wait!"

When the response comes back:

It will contain {"audioFile": "link to the podcast"}

Show this audio in the player using the audioFile link

Display message " Podcast is ready! Click play to listen"

If something goes wrong:

Show "Oops! Something went wrong. Please try again"

After successful generation:

Clear the text box for next topic

Keep all the beautiful design from before

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2840af98-bce5-4af6-8f95-ebb2e46e6ba1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
