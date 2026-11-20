# Better Profile for Vinted

A Firefox add-on that shows the item description on your own Vinted profile.

When you're logged in and look at your own profile, Vinted replaces the two lines under each item (brand, then size and condition) with the number of views and favourites. This add-on puts the description back, so you see both.

## Features

- Shows title, brand, size and condition above the views and favourites, each on its own line
- Only changes your own items; other people's profiles stay as they are
- Works on all Vinted sites (`vinted.de`, `vinted.fr`, `vinted.co.uk`, `vinted.com`, …)
- Firefox 115 or newer (desktop only)
- Collects no data

## Installation

1. Download the latest `.xpi` file from [Releases](https://github.com/sevject/better-profile-for-vinted-addon/releases).
2. If Firefox shows a notice that it blocked the installation, click **Continue to Installation**.
3. Click **Add**.

If you downloaded the file first, open `about:addons`, click the **⚙ gear icon → Install Add-on From File…** and select it.

## Usage

There's nothing to set up. Log in to Vinted and open your profile: each item shows its description above the views and favourites.

Sizes are shown in full, e.g. `S / 36 / 8`, even where Vinted would normally shorten them to `S` or `EU 36`.

## The description doesn't show up?

Vinted may have changed its website. Please [open an issue](https://github.com/sevject/better-profile-for-vinted-addon/issues) with:

1. The Vinted site you use (e.g. `vinted.de`)
2. Any message starting with `[Better Profile for Vinted]` from the browser console (press **F12** and open the **Console** tab)

## Privacy

The add-on collects no data and needs no special permissions. To get the descriptions, it loads your item list from Vinted's own website, the same way the Vinted page does. Nothing is sent anywhere else.

## Disclaimer

This project is not affiliated with or endorsed by Vinted UAB.
