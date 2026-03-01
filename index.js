// server/index.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());

// Dummy video list (thumbnails + links to real YouTube videos)
const videos = [
  {
    id: "1",
    title: "React Tutorial for Beginners",
    channel: "Code Camp",
    views: "1.2M views",
    uploadedAt: "2 years ago",
    thumbnail: "https://i.ytimg.com/vi/w7ejDZ8SWv8/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/w7ejDZ8SWv8"
  },
  {
    id: "2",
    title: "Node.js Crash Course",
    channel: "Dev Stack",
    views: "850K views",
    uploadedAt: "1 year ago",
    thumbnail: "https://i.ytimg.com/vi/f2EqECiTBL8/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/f2EqECiTBL8"
  },
  {
    id: "3",
    title: "JavaScript in 1 Hour",
    channel: "JS Mastery",
    views: "2.3M views",
    uploadedAt: "3 years ago",
    thumbnail: "https://i.ytimg.com/vi/W6NZfCO5SIk/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk"
  },
  {
    id: "4",
    title: "Build a YouTube Clone UI",
    channel: "UI Designs",
    views: "430K views",
    uploadedAt: "7 months ago",
    thumbnail: "https://i.ytimg.com/vi/2JQ5v2r2K0Q/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/2JQ5v2r2K0Q"
  },
  {
    id: "5",
    title: "Full React Course 2024",
    channel: "Tech With Tim",
    views: "3.4M views",
    uploadedAt: "1 year ago",
    thumbnail: "https://i.ytimg.com/vi/bMknfKXIFA8/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/bMknfKXIFA8"
  },
  {
    id: "6",
    title: "Tailwind CSS Crash Course",
    channel: "Traversy Media",
    views: "900K views",
    uploadedAt: "11 months ago",
    thumbnail: "https://i.ytimg.com/vi/dFgzHOX84xQ/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/dFgzHOX84xQ"
  },
  {
    id: "7",
    title: "MongoDB Tutorial for Beginners",
    channel: "Programming with Mosh",
    views: "1.7M views",
    uploadedAt: "3 years ago",
    thumbnail: "https://i.ytimg.com/vi/Q2aEzeMDHMA/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/Q2aEzeMDHMA"
  },
  {
    id: "8",
    title: "How Internet Works",
    channel: "Fireship",
    views: "4.1M views",
    uploadedAt: "2 years ago",
    thumbnail: "https://i.ytimg.com/vi/AEaKrq3SpW8/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/AEaKrq3SpW8"
  },
  {
    id: "9",
    title: "AI Explained in 10 Minutes",
    channel: "ColdFusion",
    views: "5.8M views",
    uploadedAt: "1 year ago",
    thumbnail: "https://i.ytimg.com/vi/3fX5F4R_wtI/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/3fX5F4R_wtI"
  },
  {
    id: "10",
    title: "Docker Complete Tutorial",
    channel: "Tech World",
    views: "750K views",
    uploadedAt: "8 months ago",
    thumbnail: "https://i.ytimg.com/vi/3c-iBn73dDE/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/3c-iBn73dDE"
  },
  {
    id: "11",
    title: "Next.js Full Guide",
    channel: "Codevolution",
    views: "2.1M views",
    uploadedAt: "5 months ago",
    thumbnail: "https://i.ytimg.com/vi/Sklc_fQBmcs/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/Sklc_fQBmcs"
  },
  {
    id: "12",
    title: "Python Full Course",
    channel: "FreeCodeCamp",
    views: "20M views",
    uploadedAt: "4 years ago",
    thumbnail: "https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw"
  },
  {
    id: "13",
    title: "DSA in 1 Video",
    channel: "Kunal Kushwaha",
    views: "1.8M views",
    uploadedAt: "1 year ago",
    thumbnail: "https://i.ytimg.com/vi/t9cDnYH0P_I/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/t9cDnYH0P_I"
  },
  {
    id: "14",
    title: "HTML & CSS Full Course",
    channel: "SuperSimpleDev",
    views: "3.2M views",
    uploadedAt: "2 years ago",
    thumbnail: "https://i.ytimg.com/vi/G3e-cpL7ofc/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/G3e-cpL7ofc"
  },
  {
    id: "15",
    title: "Cyber Security Basics",
    channel: "Simplilearn",
    views: "6.5M views",
    uploadedAt: "3 years ago",
    thumbnail: "https://i.ytimg.com/vi/3Kq1MIfTWCE/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/3Kq1MIfTWCE"
  }
];

// API route to send videos
app.get("/api/videos", (req, res) => {
  res.json(videos);
});

// Default route
app.get("/", (req, res) => {
  res.send("YouTube Clone API is running...");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
