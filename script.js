'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-02T13:01:17.194Z',
    '2025-05-03T10:36:17.929Z',
    '2025-05-04T06:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const displayMovements = function (acc, sort = false) {
  const { movements, movementsDates, locale, currency } = acc;

  containerMovements.innerHTML = '';

  const combinedMovsDates = movements.map((mov, i) => ({ mov, date: movementsDates[i] }));
  
  if (sort) combinedMovsDates.sort((a, b) => a.mov - b.mov);

  combinedMovsDates.forEach(function ({ mov, date }, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const displayDate = formatDateRelative(new Date(date), locale);

    const formattedMovement = formatNumber(locale, currency, mov);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMovement}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  })
}

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    const { owner } = acc;
    acc.username = owner.toLowerCase().split(' ').map(name => name[0]).join('');
  })
}

createUsernames(accounts);

const calcDisplaySummary = function (acc) {
  const { movements, interestRate, locale, currency } = acc;

  const incomes = movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
  const out = movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0);
  const interest = movements.filter(mov => mov > 0).map(deposit => deposit * (interestRate / 100)).filter(int => int >= 1).reduce((acc, int) => acc + int, 0);

  labelSumIn.textContent = formatNumber(locale, currency, incomes);
  labelSumOut.textContent = formatNumber(locale, currency, Math.abs(out));
  labelSumInterest.textContent = formatNumber(locale, currency, interest);
}

const calcDisplayBalance = function (acc) {
  acc.balance =  acc.movements.reduce((acc, mov) => acc + mov, 0);

  const { locale, currency, balance } = acc;

  labelBalance.textContent = `${formatNumber(locale, currency, balance)}`;
}

const updateUI = function (acc) {
  displayMovements(acc);
  calcDisplaySummary(acc);
  calcDisplayBalance(acc);
}

const clearInputs = function (...inputs) {
  inputs.forEach(input => {
    input.value = '';
    input.blur();
  })
}

const formatDateExact = function (date, locale = 'en-US', includeTime = true) {
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(includeTime && {
      hour: 'numeric',
      minute: 'numeric'
    })
  };

  return new Intl.DateTimeFormat(locale, options).format(date);
}

const formatDateRelative = function (date, locale) {
  const calcDaysPassed = (date1, date2) => Math.floor(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0 ) return 'Today';
  if (daysPassed === 1 ) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return formatDateExact(date, locale, false);
}

const formatNumber = function (locale = 'en-US', currency = 'EUR', num) {
  const options = { style: 'currency', currency };

  return new Intl.NumberFormat(locale, options).format(num);
}

const startLogoutTimer = function (minutes = 5) {
  let time = minutes * 60;

  function tick () {
    const mins = String(Math.floor(time / 60)).padStart(2, 0);
    const secs = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${mins}:${secs}`;

    if (time === 0) {
      clearInterval(timer);
      
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = '0';
    }

    time--;
  }

  tick();
  const timer = setInterval(tick, 1000);

  return timer;
}

const resetTimer = function () {
  clearInterval(timer);
  timer = startLogoutTimer();
}

// Event handlers
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);

  if (currentAccount?.pin === +inputLoginPin.value) {
    const { owner, locale } = currentAccount;
    labelWelcome.textContent = `Welcome back, ${owner.split(' ')[0]}`;

    clearInputs(inputLoginUsername, inputLoginPin);
    
    updateUI(currentAccount);

    containerApp.style.opacity = '1';

    labelDate.textContent = formatDateExact(new Date(), locale);

    timer ? resetTimer() : timer = startLogoutTimer();
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);
  const amount = +inputTransferAmount.value;

  if (amount > 0 && receiverAcc && currentAccount.balance >= amount &&  receiverAcc.username !== currentAccount.username) {
    currentAccount.movements.push(amount * -1);
    receiverAcc.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);

    clearInputs(inputTransferTo, inputTransferAmount);

    resetTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  const isAllowedToLoan = amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1);

  if (isAllowedToLoan) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
  
      updateUI(currentAccount);
  
      clearInputs(inputLoanAmount);

      resetTimer();
    }, 3000);
  }
})

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  const user = inputCloseUsername.value;
  const pin = +inputClosePin.value;

  if (user === currentAccount.username && pin === currentAccount.pin) {
    const index = accounts.findIndex(acc => acc.username === user);

    accounts.splice(index, 1);

    clearInputs(inputCloseUsername, inputClosePin);
    
    containerApp.style.opacity = '0';
  }
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  sorted = !sorted;
  displayMovements(currentAccount, sorted);
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

