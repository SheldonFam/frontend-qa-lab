import app from "./app.js";
import { env } from "./config/env.js";
import { failUnfinishedRuns } from "./modules/runs/services/run.service.js";

app.listen(env.PORT, (error) => {
  if (error) {
    throw error;
  }

  failUnfinishedRuns();

  console.log(`Server running on http://localhost:${env.PORT}`);
});
