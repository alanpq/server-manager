const password = document.getElementById("pwd")
  , confirm_password = document.getElementById("confirm_pwd")
  , form = document.querySelector("form");

const validatePassword = () => {
  if(password.value !== confirm_password.value) {
    confirm_password.setCustomValidity("Passwords do not match!");
  } else {
    confirm_password.setCustomValidity('');
  }
}

password.onchange = validatePassword;
confirm_password.onkeyup = validatePassword;
form.onsubmit = validatePassword;