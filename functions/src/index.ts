import * as admin from 'firebase-admin';

//Functions
import GetFileList from "./GetFileList";
import LoadFile from "./LoadFile";
import SaveFile from "./SaveFile";

admin.initializeApp();
admin.auth();

export {
  GetFileList,
  SaveFile,
  LoadFile
};