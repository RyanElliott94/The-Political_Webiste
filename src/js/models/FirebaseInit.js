import * as firebase from "firebase/app";

export const initFirebase = () => {
    const firebaseConfig = {
        apiKey: "AIzaSyCfhQRjslIGDl8VD-PXbOUj5utm6JOudU4",
        authDomain: "the-political.firebaseapp.com",
        databaseURL: "https://the-political.firebaseio.com",
        projectId: "the-political",
        storageBucket: "gs://the-political.appspot.com/",
        messagingSenderId: "1020847138057",
        appId: "1:1020847138057:web:f7f1389233689268"
    };
        firebase.initializeApp(firebaseConfig);
}