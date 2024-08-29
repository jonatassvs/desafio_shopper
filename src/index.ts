import express, { Express, Request, Response } from "express";


const app: Express = express();
const port = 3000;

app.get('/', function (req: Request, res: Response) {
  res.send('Hello World')
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});