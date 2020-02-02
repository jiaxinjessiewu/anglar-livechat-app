import { Component, OnInit } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { AngularFireAuth } from "@angular/fire/auth";
import { auth } from "firebase/app";
import { FormControl, FormGroup, Validators } from "@angular/forms";

interface Messages {
  name: string;
  message: string;
  email: string;
  timeStamp: number;
}
interface Users {
  name: string;
  email: string;
}
@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"]
})
export class ChatComponent implements OnInit {
  user: Observable<firebase.User>;
  messagesCollection: AngularFirestoreCollection<Messages>;
  messages: Observable<Messages[]>;
  validatingForm: FormGroup;
  usersCollection: AngularFirestoreCollection<Users>;

  myUser: any = {};
  name: string;
  message: string;
  varify: boolean;
  signup_form: boolean;
  login_form: boolean;
  login_error_msg: string;
  signup_error_msg: string;

  constructor(public afAuth: AngularFireAuth, public afs: AngularFirestore) {}

  ngOnInit() {
    this.name = "";
    this.getChatData();
    this.varify = false;

    this.user = this.afAuth.authState;
    this.usersCollection = this.afs.collection("users");
    this.validatingForm = new FormGroup({
      loginFormModalEmail: new FormControl("", Validators.email),
      loginFormModalPassword: new FormControl("", Validators.required),
      signupFormModalEmail: new FormControl("", Validators.email),
      signupFormModalPassword: new FormControl("", Validators.required)
    });
    this.signup_form = true;
    this.login_form = false;
    this.login_error_msg = "";
    this.signup_error_msg = "";
  }

  getChatData() {
    this.messagesCollection = this.afs.collection("chat_messages", ref =>
      ref.orderBy("timeStamp")
    );
    this.messages = this.messagesCollection.valueChanges();
  }
  newMessage() {
    this.messagesCollection
      .add({
        name: this.myUser.name,
        message: this.message,
        email: this.myUser.email,
        timeStamp: new Date().getTime()
      })
      .then(() => {
        this.message = "";
      });
  }

  get loginFormModalEmail() {
    return this.validatingForm.get("loginFormModalEmail");
  }

  get loginFormModalPassword() {
    return this.validatingForm.get("loginFormModalPassword");
  }

  get signupFormModalEmail() {
    return this.validatingForm.get("signupFormModalEmail");
  }

  get signupFormModalPassword() {
    return this.validatingForm.get("signupFormModalPassword");
  }
  signup() {
    this.afAuth.auth
      .createUserWithEmailAndPassword(
        this.validatingForm.get("signupFormModalEmail").value,
        this.validatingForm.get("signupFormModalPassword").value
      )
      .then(() => {
        var email = this.validatingForm.get("signupFormModalEmail").value;
        this.myUser = {
          name: this.name,
          email: email
        };
        this.usersCollection.add({
          name: this.name,
          email: email
        });
        this.varify = true;
      })
      .catch(error => {
        this.signup_error_msg = error.message;
      });
  }
  login() {
    this.afAuth.auth
      .signInWithEmailAndPassword(
        this.validatingForm.get("loginFormModalEmail").value,
        this.validatingForm.get("loginFormModalPassword").value
      )
      .then(() => {
        var email = this.validatingForm.get("loginFormModalEmail").value;
        return this.afs
          .collection("users", ref => ref.where("email", "==", email))
          .valueChanges()
          .subscribe(user => {
            this.myUser = user[0];
            this.varify = true;
          });
      })
      .catch(error => {
        this.login_error_msg = error.message;
      });
  }
  signOut() {
    this.afAuth.auth.signOut().then(() => {
      window.location.reload();
    });
  }
  signupModal(type) {
    var active_signup = (<HTMLInputElement>document.getElementById("signup"))
      .classList;
    var active_login = (<HTMLInputElement>document.getElementById("login"))
      .classList;
    switch (type) {
      case "signup":
        this.signup_form = true;
        this.login_form = false;
        if (!active_signup.contains("active")) {
          (<HTMLInputElement>document.getElementById("signup")).classList.add(
            "active"
          );
          (<HTMLInputElement>document.getElementById("login")).classList.remove(
            "active"
          );
        }
        break;
      case "login":
        this.signup_form = false;
        this.login_form = true;
        if (!active_login.contains("active")) {
          (<HTMLInputElement>document.getElementById("login")).classList.add(
            "active"
          );
          (<HTMLInputElement>(
            document.getElementById("signup")
          )).classList.remove("active");
        }
        break;
    }
  }
}
