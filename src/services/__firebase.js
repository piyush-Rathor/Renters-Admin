import * as firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage'

import config from '../constants/config'

var app = firebase.initializeApp(config.FIREBASE_CREDENTIALS[config.env])

export default app

var storageRef = app.storage().ref()

export const uploadFile = (file, path = 'colligo', onProgress = progressListener) => {
  var metadata = { contentType: file.type }
  var uploadTask = storageRef.child(path + '/' + file.name).put(file, metadata)

  return new Promise((resolve, reject) => {
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, onProgress, reject, function () {
      uploadTask.snapshot.ref.getDownloadURL().then(resolve)
    })
  })
}

const progressListener = function (snapshot) {
  var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
  console.log('Upload is ' + progress + '% done')
}
