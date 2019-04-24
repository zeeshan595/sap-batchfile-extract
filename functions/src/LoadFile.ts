import * as firebase from "firebase-functions";
import * as admin from "firebase-admin";

export default firebase.https.onRequest(async (request, response) => {
  if (request.method != "GET") {
    response.status(400).send("This API only accepts GET requests!");
    return;
  }

  const fileName = request.param("name");
  if (!fileName) {
    response
      .status(400)
      .send(
        "Please provide the 'name' parameter for the file name you are trying to access!"
      );
    return;
  }

  const file = admin
    .storage()
    .bucket()
    .file(fileName);
  const doesFileExist = await file.exists();
  if (!doesFileExist) {
    response.status(400).send("Could not find any file with this name!");
    return;
  }

  let fileData: string = "";
  const stream = file.createReadStream();
  stream.setEncoding("utf8");
  stream.on("data", (chunck: string) => (fileData += chunck));
  stream.on("error", () =>
    response.status(500).send("Error loading the file data")
  );
  stream.on("end", () => response.status(200).send(fileData));
});
