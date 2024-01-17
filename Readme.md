# Chai Backend

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)


This was the backend app that was developed for the challenge given by [Hitesh Choudhary](https://github.com/hiteshchoudhary) on his [Backend Series](https://github.com/hiteshchoudhary/chai-backend).

API Documentation

- [Postman](https://documenter.getpostman.com/view/16985585/2s9YsRbU3c)

NOTE: I did not host this app as of now, but maybe will in future if I build something different out of it. As of now I have created a Dockerfile and you can simply run it via docker.

### Steps of Installation

- Clone the GitHub repo:

```bash
git clone https://github.com/Ankan002/chai-backend.git
```

- Change into directories:

```bash
cd chai-backend
```

- Now configure the `.env` according to `.env.sample`, also configure .env.production by just changing the `NODE_ENV` variable.

- Now if you simply want to use Docker use the following command:

```bash
docker compose up
```

- Else you need to first install all the dependencies:

```bash
yarn
```

- Finally, you can simply start the app:

```bash
yarn start
```

- Now just follow the API docs and you are all set.
