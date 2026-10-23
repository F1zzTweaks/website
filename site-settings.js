/* ╔═════════════════════════════════════════════════════════════════════════════╗
   ║  SITE SETTINGS  –  the only file you need to edit                           ║
   ║  Put each link between the quotes. Leave a link empty and its button turns  ║
   ║  into a greyed-out one. NEVER put an email address on this site.            ║
   ║  (index.html can be replaced with a newer version without losing these.)    ║
   ╚═════════════════════════════════════════════════════════════════════════════╝ */
window.SITE = {
  discordInvite:   "https://discord.gg/UBAZsf2PHt",   // your Discord invite, e.g. "https://discord.gg/abc123"
  downloadUrl:     "https://github.com/F1zzTweaks/F1zzTweaks/releases/latest/download/F1zzTweaks.exe",
                         // ^ always the NEWEST release. Never needs changing again, as long as every release
                         //   has a file named exactly F1zzTweaks.exe attached.
                         // Do NOT use the link to the release PAGE. That one opens GitHub instead of downloading.
  buy30Url:        "",   // checkout link for "30 days of Premium"
  buyLifetimeUrl:  "",   // checkout link for "Lifetime Premium"
  price30:         "$5", // price shown for 30 days   (change to what you really charge)
  priceLifetime:   "$15",// price shown for lifetime  (change to what you really charge)
  sha256:          "",

  // DOWNLOAD COUNTER. If downloadUrl is a GitHub release link, the page adds up GitHub's real download counts and shows
  // "downloads" next to the other numbers at the top. It stays hidden until the total reaches this number
  // (so a brand new site doesn't show "3 downloads"). Use 0 to show it as soon as there is at least 1.
  showDownloadsFrom: 1,
   // optional: the download's SHA-256 checksum, so people can check the file

  // VIDEO SHOWCASE. Add your clips here and a "Watch it in action" section appears on the page.
  // Leave the list empty and the whole section stays hidden. Each clip has:
  //   title:  short name shown on the tab           text:   one short line under it (optional)
  //   src:    a YouTube link (https://youtu.be/XXXXXXXXXXX)  OR  a video file (.mp4 / .webm) such as "showcase/tour.mp4"
  //   poster: optional cover picture (.jpg / .png / .webp), such as "showcase/tour.jpg"
  // Big videos: upload them to YouTube ("Unlisted" is fine) and use the link. Files on this site must stay under 25 MB.
  // TUTORIAL VIDEOS (the "Tutorials" tab). Paste your YouTube links here, remove the // at the start of each line:
  tutorials: [
    { title: "The BEST Pc Tweaks For 2026 ( F1zz Tweaks )", text: "", src: "https://youtu.be/8VoYVcu_ukw" },
    { title: "F1zz Tweaks. The new FREE PC tweaks that will help improve your gaming performance.", text: "", src: "https://www.youtube.com/watch?v=2l6aqOmxwdw" }
  ],




  videos: [
    { title: "V3.1 tour", text: "Game Boost, the Game Library, Discord status and 695 tweaks.", src: "promo.mp4", poster: "promo.jpg" },
    // { title: "Quick tour",       text: "Everything in 60 seconds.",           src: "showcase/tour.mp4", poster: "showcase/tour.jpg" },
    // { title: "One-click suite",  text: "Optimize and undo it again.",         src: "https://youtu.be/XXXXXXXXXXX" },
    // { title: "F1zz Bot",         text: "Ask it what to turn on.",             src: "showcase/bot.mp4" }
  ]
};
