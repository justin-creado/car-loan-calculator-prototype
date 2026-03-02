// script.js

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM refs ---
  const calcBtn          = document.getElementById('calcBtn');
  const resultsPlaceholder = document.getElementById('resultsPlaceholder');
  const resultsContent   = document.getElementById('resultsContent');
  const listingsGrid     = document.getElementById('listingsGrid');

  // Car listings data
  const carListings = [
    { title: '2022 Toyota Camry',   price: 89000 },
    { title: '2023 Nissan Altima',  price: 72500 },
    { title: '2021 Honda Accord',   price: 68000 },
    { title: '2022 Hyundai Tucson', price: 95000 },
    { title: '2023 Kia Sportage',   price: 81000 },
    { title: '2020 Ford Edge',      price: 76500 },
  ];

  // Picsum seeds for variety
  const picsumSeeds = [10, 20, 30, 40, 50, 60];

  /**
   * Format a number as "AED 12,345"
   * @param {number} number
   * @returns {string}
   */
  function formatAED(number) {
    return 'AED ' + Math.round(number).toLocaleString('en-US');
  }

  /**
   * Validate all inputs; show inline errors where needed.
   * @returns {boolean} true if all inputs are valid
   */
  function validateInputs() {
    let valid = true;

    const fields = [
      { id: 'carPrice',      errId: 'err-carPrice',      label: 'Car Price',        min: 0,   max: null, type: 'number' },
      { id: 'downPayment',   errId: 'err-downPayment',   label: 'Down Payment',     min: 0,   max: null, type: 'number' },
      { id: 'interestRate',  errId: 'err-interestRate',  label: 'Interest Rate',    min: 0,   max: 30,   type: 'number' },
      { id: 'loanTenure',    errId: 'err-loanTenure',    label: 'Loan Tenure',      min: null, max: null, type: 'select' },
      { id: 'monthlyIncome', errId: 'err-monthlyIncome', label: 'Monthly Income',   min: 0,   max: null, type: 'number' },
    ];

    fields.forEach(f => {
      const el  = document.getElementById(f.id);
      const err = document.getElementById(f.errId);
      const val = el.value.trim();

      // Reset
      err.textContent = '';
      el.classList.remove('invalid');

      if (f.type === 'select') {
        if (!val) {
          err.textContent = `Please select a ${f.label}.`;
          el.classList.add('invalid');
          valid = false;
        }
        return;
      }

      // Number fields
      if (val === '') {
        err.textContent = `${f.label} is required.`;
        el.classList.add('invalid');
        valid = false;
        return;
      }

      const num = parseFloat(val);

      if (isNaN(num)) {
        err.textContent = `${f.label} must be a number.`;
        el.classList.add('invalid');
        valid = false;
        return;
      }

      if (f.min !== null && num < f.min) {
        err.textContent = `${f.label} must be at least ${f.min}.`;
        el.classList.add('invalid');
        valid = false;
        return;
      }

      if (f.max !== null && num > f.max) {
        err.textContent = `${f.label} must not exceed ${f.max}.`;
        el.classList.add('invalid');
        valid = false;
        return;
      }
    });

    // Extra: down payment must not exceed car price
    const carPrice   = parseFloat(document.getElementById('carPrice').value);
    const downPayment = parseFloat(document.getElementById('downPayment').value);
    if (!isNaN(carPrice) && !isNaN(downPayment) && downPayment >= carPrice) {
      const err = document.getElementById('err-downPayment');
      const el  = document.getElementById('downPayment');
      err.textContent = 'Down Payment must be less than the Car Price.';
      el.classList.add('invalid');
      valid = false;
    }

    // Extra: monthly income must be > 0
    const income = parseFloat(document.getElementById('monthlyIncome').value);
    if (!isNaN(income) && income === 0) {
      const err = document.getElementById('err-monthlyIncome');
      const el  = document.getElementById('monthlyIncome');
      err.textContent = 'Monthly Income must be greater than 0.';
      el.classList.add('invalid');
      valid = false;
    }

    return valid;
  }

  /**
   * Run calculation and update UI. Called on button click.
   */
  function calculateLoan() {
    if (!validateInputs()) return;

    const carPrice     = parseFloat(document.getElementById('carPrice').value);
    const downPayment  = parseFloat(document.getElementById('downPayment').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const loanTenure   = parseInt(document.getElementById('loanTenure').value, 10);
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value);

    // Step 1: Loan Amount
    const loanAmount = carPrice - downPayment;

    // Step 2: Monthly Payment (amortized formula)
    const monthlyRate = interestRate / 12 / 100;
    const months = loanTenure * 12;
    let monthlyPayment;

    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / months;
    } else {
      monthlyPayment = loanAmount
        * (monthlyRate * Math.pow(1 + monthlyRate, months))
        / (Math.pow(1 + monthlyRate, months) - 1);
    }

    // Step 3: Derived values
    const totalCost        = monthlyPayment * months;
    const totalInterest    = totalCost - loanAmount;
    const salaryPercentage = (monthlyPayment / monthlyIncome) * 100;

    updateUI({
      monthlyPayment,
      loanAmount,
      totalInterest,
      totalCost,
      salaryPercentage,
    });
  }

  /**
   * Update the results card DOM with calculated values.
   * @param {object} results
   */
  function updateUI(results) {
    const { monthlyPayment, loanAmount, totalInterest, totalCost, salaryPercentage } = results;

    document.getElementById('resMonthly').textContent       = formatAED(monthlyPayment);
    document.getElementById('resLoanAmount').textContent    = formatAED(loanAmount);
    document.getElementById('resTotalInterest').textContent = formatAED(totalInterest);
    document.getElementById('resTotalCost').textContent     = formatAED(totalCost);
    document.getElementById('resSalaryPct').textContent     = salaryPercentage.toFixed(1) + '%';

    // Affordability badge
    const badge = document.getElementById('affordBadge');
    badge.className = 'afford-badge'; // reset classes

    if (salaryPercentage < 30) {
      badge.classList.add('affordable');
      badge.textContent = 'Affordable ✓';
    } else if (salaryPercentage <= 50) {
      badge.classList.add('moderate');
      badge.textContent = 'Moderate ⚠';
    } else {
      badge.classList.add('high-risk');
      badge.textContent = 'High Risk ✗';
    }

    // Show results, hide placeholder
    resultsPlaceholder.classList.add('hidden');
    resultsContent.classList.remove('hidden');
  }

  /**
   * Build and inject car listing cards into the grid.
   */
  function renderListings() {
    carListings.forEach((car, index) => {
      const estMonthly = Math.round(car.price * 0.018);
      const seed = picsumSeeds[index];

      const card = document.createElement('div');
      card.className = 'car-card';

      card.innerHTML = `
        <img
          src="https://picsum.photos/seed/${seed}/320/200"
          alt="${car.title}"
          loading="lazy"
        />
        <div class="car-card-body">
          <div class="car-title">${car.title}</div>
          <div class="car-price">${formatAED(car.price)}</div>
          <span class="car-monthly-badge">Est. AED ${estMonthly.toLocaleString('en-US')}/mo</span>
          <button class="btn-outline">View Listing &rarr;</button>
        </div>
      `;

      listingsGrid.appendChild(card);
    });
  }

  // --- Entry point ---
  calcBtn.addEventListener('click', calculateLoan);

  // Allow Enter key in numeric fields to trigger calculation
  document.querySelectorAll('#calculator-section input').forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') calculateLoan();
    });
  });

  // Render static car listings on load
  renderListings();
});
