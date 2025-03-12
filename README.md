# Welcome to SoMe app 👋
A social media app built with Expo and Firebase, allowing users to create, view and interact with posts as well as exploring gallery locations on a map.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```
2. Prebuild

   ```bash
   npm expo prebuild --platform ios --clean
   ```

3. Start the app

   ```bash
    npm run ios
   ```
**Note**: The app does not run in Expo Go since it uses Google sign-in.
   *XCode is required to run the app with iOS simulator*

## Functionalities in the app:
### Authentication
* Create an account by either signing up with Firebase email and password or with a Google sign-in.
* Option to continue as a guest (this only allows viewing access). 

### Navigation
* **Home (Gallery overview)**
   * View a grid of user posts, each showing an image, title, abstract, creator, and like/dislike buttons.
   * Tap a post to view details, comments, and location on a map.
   * Upload posts (authenticated users only), including image, title, abstract, hashtag, and cateogry.
   * View your own posts, with a delete button to remove them. 

* **Search page**
   * Search posts based on username or title.
   * Sort posts alphabetically or filter by category. 

* **Exhibition Location page**
   * View a map with markers indicating post locations.
   * Tap on a marker for a little frame to show up with the image, title and abstract of that post.

* **Profile page**
   * View you profile with username and a grid of personal posts.
   * Log out

## Known limitations
* App tested on iOS and web.
* Does not work with Expo Go due to Google sign-in.

