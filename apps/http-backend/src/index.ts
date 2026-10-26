import dotenv from "dotenv";
dotenv.config({ path: "../../.env", quiet: true });
const { default: app } = await import("./app");
const { getJwtSecret } = await import("@repo/backend-common");
getJwtSecret();
app.listen(Number(process.env.PORT || 3001), () => console.log("HTTP API ready"));
