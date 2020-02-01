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

  name: string;
  email: string;
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
    this.messagesCollection = this.afs.collection("chat_messages");
    this.messages = this.messagesCollection.valueChanges();
    console.log("this.message : ", this.messages);
  }
  newMessage() {
    this.messagesCollection.add({
      name: this.name,
      message: this.message,
      email: this.email
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
  // newUser() {
  //   if (this.name) {
  //     this.varify_name = true;
  //   }
  //   this.messagesCollection.add({ name: this.name, message: "" });
  // }
  signup() {
    console.log(
      "signup: ",
      this.validatingForm.get("signupFormModalEmail").value,
      this.validatingForm.get("signupFormModalPassword").value,
      this.name
    );
    this.afAuth.auth
      .createUserWithEmailAndPassword(
        this.validatingForm.get("signupFormModalEmail").value,
        this.validatingForm.get("signupFormModalPassword").value
      )
      .then(() => {
        this.varify = true;
        this.email = this.validatingForm.get("signupFormModalEmail").value;
        this.usersCollection.add({
          name: this.name,
          email: this.email
        });
      })
      .catch(error => {
        var errorCode = error.code;
        var errorMessage = error.message;
        this.signup_error_msg = errorMessage;
      });
  }
  login() {
    // console.log(this.email, this.password);
    console.log(
      this.validatingForm.get("loginFormModalEmail").value,
      this.validatingForm.get("loginFormModalPassword").value
    );
    this.afAuth.auth
      .signInWithEmailAndPassword(
        this.validatingForm.get("loginFormModalEmail").value,
        this.validatingForm.get("loginFormModalPassword").value
      )
      .then(() => {
        console.log("success");
        this.varify = true;
        this.email = this.validatingForm.get("loginFormModalEmail").value;
        console.log("login user: ", this.usersCollection.valueChanges());
        this.usersCollection.valueChanges().forEach(user => {
          console.log("user:", user);
        });
      })
      .catch(error => {
        console.log("login err: ", error);
        var errorCode = error.code;
        var errorMessage = error.message;
        this.login_error_msg = errorMessage;
      });
  }
  signup_modal(type) {
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
