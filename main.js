let form = document.getElementById('form')
let email = document.getElementById('email')
let password = document.getElementById('password')
let error1 = document.getElementById('error1')
let error2 = document.getElementById('error2')

function validate() {
  let isValid = true
  if (email.value === '') {
    email.style.border = '1px solid red'
    error1.innerHTML = 'Введите почту'
    isValid = false
  }
  else {
    error1.innerHTML = ''
    email.style.border = '1px solid white'
  }
  if (password.value === '') {
    password.style.border = '1px solid red'
    error2.innerHTML = 'Введите пароль'
    isValid = false
  }
  else {
    error2.innerHTML = ''
    password.style.border = '1px solid white'
  }
  return isValid
}


email.addEventListener('blur', validate)
password.addEventListener('blur', validate)

form.addEventListener('submit', (e) => {
  e.preventDefault()
  if (validate()) alert('форма успешно отправлена')
})