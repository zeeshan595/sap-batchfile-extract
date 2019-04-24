import * as firebase from "firebase-functions";
import * as admin from 'firebase-admin';

export default firebase.https.onRequest(async (request, response) => {
  const bucket = await admin.storage().bucket().getFiles();
  const files = bucket[0];
  
  const data : string[] = [];
  for (let i = 0; i < files.length; i++) {
    data[i] = files[i].name;
  }
  response.status(200).send({
    files: data
  });
});