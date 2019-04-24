import * as firebase from "firebase-functions";
import * as admin from "firebase-admin";

export default firebase.https.onRequest(async (request, response) => {
  if (request.method != "POST") {
    response.status(400).send("This API only accepts POST requests");
    return;
  }
  const dataName = request.body["name"];
  const data = request.body["data"];
  if (!dataName || !data) {
    response
      .status(400)
      .send("You must provide the following data 'name' & 'data'.");
    return;
  }

  const doesFileExist = await admin
    .storage()
    .bucket()
    .file(dataName)
    .exists();

  if (doesFileExist) {
    response
      .status(400)
      .send(
        "This file already exists, Please delete it or change the name of your data file."
      );
    return;
  }

  await admin
    .storage()
    .bucket()
    .file(dataName)
    .createWriteStream()
    .write(data, "utf8");

  response.status(200).send("Saved");
});
