# Telegram Bot Notification Setup Guide

This guide will walk you through setting up a free, simple Telegram bot to receive instant notifications for new tour bookings.

## Why Telegram?
- **Completely Free:** No message limits or fees.
- **Simple Setup:** No business verification or complex APIs needed.
- **Instant Notifications:** Get booking details sent directly to a private group or channel.
- **Secure:** You control the bot and where it sends messages.

---

## Step 1: Create Your Telegram Bot

You'll create a bot using the official "BotFather" on Telegram.

1.  **Open Telegram** (on your phone or desktop app).
2.  Search for the user **`@BotFather`** (it has a blue verification checkmark).
3.  Start a chat with BotFather and type the command:
    ```
    /newbot
    ```
4.  BotFather will ask for a **name** for your bot. This is a friendly name, like `Mystic Tours Bot`.
5.  Next, it will ask for a **username**. This must be unique and end in `bot`. For example: `MysticToursAgentBot`.
6.  **Success!** BotFather will reply with a congratulatory message that includes your **API Token**. It will look something like this:
    > `Use this token to access the HTTP API:`
    > `1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789`

7.  **Copy this token immediately and save it somewhere secure.** This is your `TELEGRAM_BOT_TOKEN`.

---

## Step 2: Get Your Group's Chat ID

You need to tell your bot *where* to send the messages. The easiest way is to get the ID of a group chat.

1.  **Create a new Telegram Group:**
    *   Click the "New Message" icon in Telegram.
    *   Select "New Group".
    *   You can add one person initially (you can remove them later). Name the group something like "Mystic Tours Bookings".

2.  **Add Your Bot to the Group:**
    *   In the group settings, click "Add Members".
    *   Search for your bot's **username** (e.g., `@MysticToursAgentBot`) and add it to the group. It will join as a member.

3.  **Get the Chat ID:**
    *   The simplest way is to use a helper bot. Add the bot `@RawDataBot` to your group.
    *   As soon as it joins, it will post a large message with JSON data.
    *   Look for the `chat` section in that message. You will see an `id` field.
    *   The Chat ID for a group is a **negative number**, like `-1001234567890`.

4.  **Copy the Chat ID.** This is your `TELEGRAM_CHAT_ID`.
5.  You can now remove `@RawDataBot` from the group.

---

## Step 3: Add Credentials to Your Project

Now that you have your Bot Token and Chat ID, you need to add them to your project's environment variables.

1.  Open the `.env.local` file in your project's root directory.
2.  Add the following lines at the end, pasting your credentials:

    ```bash
    # Telegram Bot for Booking Notifications
    TELEGRAM_BOT_TOKEN=1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789
    TELEGRAM_CHAT_ID=-1001234567890
    ```

---

## Step 4: Restart and Test

1.  **Restart your development server.** Stop it (Ctrl + C) and run `pnpm dev` again to ensure it loads the new environment variables.
2.  **Make a test booking** on your website.
3.  **Check your Telegram group.** The notification should appear instantly!

### Troubleshooting

*   **Message Not Arriving?**
    *   Double-check that your `TELEGRAM_BOT_TOKEN` is correct.
    *   Ensure the `TELEGRAM_CHAT_ID` is correct and starts with a `-`.
    *   Confirm that your bot was successfully added as a member of the group.
    *   Check your server console logs for any errors from the Telegram API.
*   **Bot Can't Be Added to Group?**
    *   In your chat with BotFather, check your bot's settings. Use the `/mybots` command, select your bot, and go to `Bot Settings`. Ensure `Allow Groups?` is turned on and that `Group Privacy` is turned off so it can read messages if needed (though for this setup, it only needs to send). 