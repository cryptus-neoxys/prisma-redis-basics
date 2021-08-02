# Prisma Basics

[![wakatime](https://wakatime.com/badge/github/cryptus-neoxys/prisma-redis-basics.svg)](https://wakatime.com/badge/github/cryptus-neoxys/prisma-redis-basics)

## What does it do
This is a basic CRUD application with a simple User and Post Relational Schema.

Made to learn Prisma V2 and Redis. Also implemented rate-limit with Redis as Store.

## 👨‍💻 🛠️ Tech Stack

1. Nodejs
  1. Express
  2. Express-Validator
  3. Express-rate-limit (redisStore: redis-rate-limit)
  4. Prisma (lacks in-built validation + lifecycle hooks)
  5. Redis

## ▶️ Running Locally

1. Fork the repo
2. `git clone https://github.com/<your-username>/prisma-orm.git <name>`
3. `cd <name>`
4. `yarn install` or `npm install`
5. `yarn run dev` or `npm run dev`
6. the app should be running at http://localhost:5000/

## Screenshots (Cache Speed)

<table>
  <tr>
    <th>Using Database</th>
    <th>With Cache</th>
  </tr>
  <tr>
    <td>
      <img src="https://user-images.githubusercontent.com/50591491/115385355-ad362b80-a1f5-11eb-8482-60b3c7c51c37.png">
    </td>
    <td>
      <img src="https://user-images.githubusercontent.com/50591491/115385436-c50daf80-a1f5-11eb-9f0a-77771bfdc8e2.png">
    </td>
  </tr>
  <tr>
    <th align=centre>Response Time: 129.72 ms</th>
    <th align=centre>Response Time: 0.418 ms</th>
  </tr>
</table>

## 🔔 Credits
Built from [Classsed](https://youtu.be/Ehv69qFvN2I), [Traversy Media](https://youtu.be/oaJq1mQ3dFI), [yoursTRULY](https://youtu.be/RL9mnX0qXhY) and [Coding Garden](https://youtu.be/nCWE6eonL7k) YouTube videos.
